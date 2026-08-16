# Jstyoucation — Mobile MVP Spec

**v2 — updated for the rebrand in `Hackathon_Deck_v2.pdf`** (green/black/orange, Poppins
headlines, white background — replaces the earlier navy/powder-blue/Fraunces direction).

Reference: `design/reference-teacher.png`, `design/reference-student.png`, `design/reference-parent.png`
(screenshots of the Claude Design mockup — HTML, not usable directly in RN)

## Font setup (do first)

```
npx expo install @expo-google-fonts/poppins @expo-google-fonts/inter expo-font expo-splash-screen
```

```jsx
import { useFonts, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
```

Note: v1 used Fraunces (serif) + IBM Plex Mono. Both are dropped in v2 — remove those
packages if already installed, and swap any `fontFamily: 'Fraunces_...'` references to
the `Poppins_...` equivalents in `design/tokens.js`.

## Navigation

Bottom tab navigator per role (`@react-navigation/bottom-tabs`). Icons via `lucide-react-native`.

- **Teacher:** Upload · Class · Priority · More
- **Student:** Profile · Revise · Subjects · More
- **Parent:** Progress · Activity · More

(MVP can hardcode which tab set loads based on a role selector/login — role switching itself is not in MVP scope per the PRD.)

## Screen 1 — Teacher: Upload

- Header: wordmark + avatar (`View` row)
- "Upload student work" card:
  - Dropzone → `Pressable` that opens `expo-image-picker` (camera + library), styled as a dashed-border box (`borderStyle: 'dashed'` works in RN)
  - Student picker + Subject picker → `@react-native-picker/picker` or a custom bottom-sheet modal
  - Primary button → `Pressable` with `CheckCircle2` icon (lucide-react-native)
- "Recent submissions" card: `FlatList` of rows — avatar circle (initials), name, detail text, status pill (`Marked` / `Processing`)
- "Prioritize this week" card: grouped by topic, each topic renders a row of name chips (`FlatList` or `.map` inside `View` with `flexWrap: 'wrap'`)

## Screen 2 — Student: Profile

- Profile header: avatar circle + name + subtitle
- "Biology learning profile" card:
  - Meta row: student name, year/grade, last-updated date
  - **Status boxes** (side-by-side pair): a green "Strong area" box and an orange "Needs support" box, each with an icon, topic name, percentage, and mini progress bar — this replaces the v1 list-of-mastery-rows pattern with the two-box highlight pattern from the updated deck
  - "Visible to student, teacher and parent" pill (eye icon + muted background) — keep this, it reinforces the 3-stakeholder value prop from the PRD
  - **Topic overview**: horizontal scrollable row of small topic chips (5+ topics), each showing name / percentage / mini bar, color-coded green (strong) / orange (needs support) / gray (not enough data yet)
- Focus callout: dark `View` card with icon + title + body text — this is the single most important UI moment, keep it visually distinct (dark/black background against the white screen, green icon accent)
- "Recommended for you" card: `FlatList` of tool rows — icon chip, name, description, small pill button

Build `<StatusBox variant="strong|weak" topic percent />` and `<TopicChip name percent status="strong|weak|neutral" />` as reusable components — the Parent screen reuses the status-box pattern too.

## Screen 3 — Parent: Progress

- Three-stat summary strip: `View` row of 3 equal-flex stat cards
- Subject overview: same mastery-row component as Student screen (reuse it — build one `<MasteryRow />` component, don't duplicate)
- Recent activity: `FlatList` of rows — dot + text (mixed bold/regular via nested `Text`) + timestamp

## Shared components to build once (used across screens)

- `<MasteryRow topic weakOrStrong percent />`
- `<StatusPill label variant="done|processing" />`
- `<NameChip name />`
- `<Card title description>{children}</Card>`
- `<Avatar initials variant="sm|md|lg" />`

## Explicitly NOT in MVP scope (per PRD §7)

- Multi-subject aggregation per student
- Adaptive tool-recommendation engine (static mapping is fine for MVP)
- Handwritten free-response grading
- Multi-language support
- Actual role-switching UI (role is fixed per logged-in user)
