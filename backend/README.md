# Jstyoucation — backend

Django + Django REST Framework backend for the Jstyoucation MVP (teacher upload/marking,
student learning profile, parent read-only view). Built from the brief in
`../claude-code-brief/` — see that folder for the PRD, ERD, and full API design docs.

Database is local SQLite (not the Neon Postgres the original brief assumed — that was swapped
out mid-build; see `../claude-code-brief/settings_snippet.py` if this ever needs to move to
Postgres/Neon for real hosting).

Auth is DRF's `TokenAuthentication` (a static per-user token, not JWT) — simplest thing that
satisfies the `Authorization: Bearer <token>`-shaped contract in `openapi.yaml` for a hackathon
MVP. `/auth/login` accepts `email` (not username) and resolves it to the underlying Django user.

The "AI Scanner" is a synchronous fake marker (`api/marking.py`) — it picks a random topic from
the submission's unit and a random correct/incorrect per question, then runs the exact same
stats-recalculation / recommendation-generation / activity-log cascade a real OCR+marking worker
would trigger. Swap `run_marking()`'s `_fake_mark_question` for a real provider call later; the
rest of the pipeline (status flow, `student_topic_stats`, `student_subject_profiles`,
`student_revision_recommendations`, `activity_log`) is real.

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

# --- upload a submission (runs the fake AI marker synchronously) ---
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

## Known simplifications vs. the brief

- SQLite instead of Neon Postgres (see top of this file).
- Static DRF tokens instead of JWT access/refresh pairs — `/auth/refresh` exists for shape
  compatibility but just re-validates the same token.
- The AI Scanner is a synchronous fake marker, not a real OCR/marking worker — see `api/marking.py`.
- Strong/weak cutoffs (`STRONG_CUTOFF` / `WEAK_CUTOFF`) and the profile-generation threshold
  (`PROFILE_GENERATION_THRESHOLD`) live as constants in `api/marking.py`, per `schema_notes.md`
  flagging these as product decisions still to be made.
