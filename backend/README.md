# Jstyoucation — backend

Django + Django REST Framework backend for the project (teacher upload/marking,
student learning profile, parent read-only view).

Database is local SQLite

Auth is DRF's `TokenAuthentication` (a static per-user token, not JWT) — simplest thing that
satisfies the `Authorization: Bearer <token>`-shaped contract in `openapi.yaml` for the project. `/auth/login` accepts an email and password, and resolves it to the underlying Django user.

The "AI Scanner" (`api/marking.py`) runs synchronously right after a submission is created (or on
`/reprocess`): it OCRs the submission photo (`api/ocr_pipeline.py`, GOT-OCR2.0) and classifies the
unit's topics as strong/needs-improvement against the extracted text (`api/topic_analysis.py`,
Qwen2.5-1.5B-Instruct), writing one `SubmissionQuestion` per topic the model found a real signal
on. There's no per-question answer-key parsing, so `question_count` means "topics classified," not
a literal count of exam questions -- and because it's real model inference (not a random roll),
`POST /submissions` and `/reprocess` can take a while (CPU-bound, no GPU on most dev machines).
Requires `requirements-ocr.txt` (see the OCR pipeline section below). The rest of the pipeline
(status flow, `student_topic_stats`, `student_subject_profiles`, `student_revision_recommendations`,
`activity_log`) is unchanged from before.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # .venv\Scripts\activate on Windows
pip install -r requirements.txt

cp .env.example .env            # DJANGO_SECRET_KEY + DJANGO_DEBUG; edit the secret key for anything real

python manage.py migrate
python manage.py seed_demo_data # teacher "MA", students Toby/Kevin, a marked Biology test, etc.
python manage.py createsuperuser # optional, for /admin/

python manage.py runserver
```

Demo login: any of `mana@riverside.edu` / `toby.king@riverside.edu` / `kevin.marsh@riverside.edu`
/ `rachel.king@example.com`, password `demo1234`.

Django admin is at `http://127.0.0.1:8000/admin/` (needs a superuser — schools, subjects, units,
topics, classes, and revision materials are all manageable there without a custom UI).

## App layout

| App | Holds |
| --- | --- |
| `accounts` | `School`, `User` (role: teacher/student/parent/admin), `StudentProfile`, `TeacherProfile`, `ParentProfile`, `ParentStudentLink` |
| `curriculum` | `Subject` → `Unit` → `Topic` |
| `classroom` | `SchoolClass`, `ClassTeacher`, `ClassStudent` |
| `submissions` | `Submission`, `SubmissionQuestion` (AI Scanner marking) |
| `profiles` | `StudentTopicStat`, `StudentSubjectProfile` |
| `revision` | `RevisionMaterial`, `StudentRevisionRecommendation` |
| `activitylog` | `ActivityLog` |
| `api` | DRF serializers/views/urls/permissions cutting across the above — the actual `/api/v1/...` surface |

Role-based access (`api/permissions.py`): a teacher can only touch classes they're assigned to;
a student/parent can only read students they're linked to (self, own children, or students in a
class they teach). Enforced server-side, not trusted from client-supplied IDs.

## OCR pipeline (`/ocr/pdf`)

A separate, general-purpose PDF/PNG/JPG → Markdown OCR endpoint (`api/ocr_pipeline.py` +
`OcrPdfView`) using GOT-OCR2.0 via `transformers`. Standalone/ad-hoc use -- doesn't persist
anything. `marking.py` calls the same `ocr_pipeline`/`topic_analysis` modules directly for
the real submissions/marking flow above (photo uploads, not PDFs, and it does persist).

Heavy ML deps (`torch`, `transformers`, `pdf2image`, ...) live in `requirements-ocr.txt`,
not `requirements.txt`, so the base app install stays light. Install them only if you're
using this endpoint:

```bash
pip install -r requirements-ocr.txt
brew install poppler       # macOS, required by pdf2image
apt install poppler-utils  # Linux
```

The model is downloaded from Hugging Face on first use and cached in-process (loaded once
per server process, not once per request). GPU is auto-detected and used if available;
otherwise it falls back to CPU with a logged warning (slow).

```bash
curl -s $BASE/ocr/pdf -H "Authorization: Token $TOKEN" \
  -F "file=@/path/to/paper.pdf" -F "dpi=200" -F "mode=format"
```

`mode` is `format` (structure-preserving, default) or `ocr` (plain text). Response:
`{ filename, markdown, failed_pages }` -- `failed_pages` lists any page numbers that
failed OCR (skipped, not fatal) and are stubbed out in the markdown.

PNG/JPG uploads also work -- `dpi` is ignored (no PDF-to-image conversion needed) and
OCR runs directly on the image, treated as a single page.

### Topic classification (optional, via `unit_id`)

Pass a `unit_id` and the OCR'd text is also run through a small local instruct LLM
(`api/topic_analysis.py`, Qwen2.5-1.5B-Instruct -- same `requirements-ocr.txt`, no extra
deps) that sorts the unit's topics (falling back to the whole subject's topics if the
unit has none) into `strong` vs `needs_improvement` based on whatever signal it can read
out of the text (marks, corrections, grades, or its own judgement of answer correctness).
Topics the text doesn't give a signal on are omitted from both lists.

```bash
curl -s $BASE/ocr/pdf -H "Authorization: Token $TOKEN" \
  -F "file=@/path/to/paper.pdf" -F "mode=format" -F "unit_id=<unit_id>"
```

Adds `strong_topics` / `needs_improvement_topics` (each a list of `{id, unit, subject, name}`)
to the response.

## curl walkthrough

```bash
BASE=http://127.0.0.1:8000/api/v1

# --- login ---
TOKEN=$(curl -s $BASE/auth/login -X POST -H "Content-Type: application/json" \
  -d '{"email":"mana@riverside.edu","password":"demo1234"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# --- who am I ---
curl -s $BASE/me -H "Authorization: Token $TOKEN"

# --- teacher's classes ---
curl -s $BASE/classes -H "Authorization: Token $TOKEN"
CLASS_ID=<id from the response above>

# --- roster with per-student summary ---
curl -s $BASE/classes/$CLASS_ID/roster -H "Authorization: Token $TOKEN"

# --- priority view: weak topics grouped with students ---
curl -s $BASE/classes/$CLASS_ID/priorities -H "Authorization: Token $TOKEN"

# --- units for a subject (upload screen dropdown) ---
curl -s $BASE/subjects/<subject_id>/units -H "Authorization: Token $TOKEN"

# --- upload a submission (runs the real OCR + topic-classification AI scanner synchronously) ---
curl -s $BASE/submissions -H "Authorization: Token $TOKEN" \
  -F "photo=@/path/to/photo.jpg" \
  -F "student_id=<student_id>" -F "class_id=$CLASS_ID" \
  -F "unit_id=<unit_id>" -F "assignment_type=test"

# --- submission detail incl. per-question marking ---
curl -s $BASE/submissions/<submission_id> -H "Authorization: Token $TOKEN"

# --- teacher override of one question (human-in-the-loop) ---
curl -s $BASE/submissions/<submission_id>/questions/<question_id> -X PATCH \
  -H "Authorization: Token $TOKEN" -H "Content-Type: application/json" \
  -d '{"final_is_correct": true, "note": "handwriting misread by OCR"}'

# --- re-run marking on a needs_review submission ---
curl -s $BASE/submissions/<submission_id>/reprocess -X POST -H "Authorization: Token $TOKEN"

# --- student's subjects + one subject's full learning profile ---
curl -s $BASE/students/<student_id>/subjects -H "Authorization: Token $TOKEN"
curl -s $BASE/students/<student_id>/subjects/<subject_id>/profile -H "Authorization: Token $TOKEN"

# --- revision recommendations ---
curl -s $BASE/students/<student_id>/recommendations -H "Authorization: Token $TOKEN"
curl -s $BASE/recommendations/<recommendation_id>/start -X POST -H "Authorization: Token $TOKEN"
curl -s $BASE/recommendations/<recommendation_id>/complete -X POST -H "Authorization: Token $TOKEN"

# --- parent view (log in as rachel.king@example.com instead) ---
curl -s $BASE/parents/me/children -H "Authorization: Token $PARENT_TOKEN"
curl -s $BASE/students/<student_id>/summary -H "Authorization: Token $PARENT_TOKEN"
curl -s $BASE/students/<student_id>/activity -H "Authorization: Token $PARENT_TOKEN"

# --- admin/content management (needs is_staff or role=admin) ---
curl -s $BASE/admin/subjects -H "Authorization: Token $ADMIN_TOKEN"
curl -s $BASE/admin/revision-materials -X POST -H "Authorization: Token $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic": "<topic_id>", "tool_type": "quiz", "weakness_type": "procedural", "title": "Quick quiz — Genetics"}'
```

List endpoints return `{ data: [...], page, page_size, total }`; errors return
`{ error: { code, message, details } }`.

