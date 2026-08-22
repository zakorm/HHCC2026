import { Platform } from 'react-native';

// Android emulators can't reach the host machine via localhost — 10.0.2.2 is
// the documented alias for it. iOS simulator and web both share the host's
// loopback address. Override with EXPO_PUBLIC_API_URL for a real device or
// a deployed backend.
const DEFAULT_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type Role = 'teacher' | 'student' | 'parent' | 'admin';

export type ApiUser = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_initials: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: ApiUser;
};

type Envelope<T> = { data: T[]; page: number; page_size: number; total: number };
type DataEnvelope<T> = { data: T[] };

export type SchoolClassSummary = { id: string; name: string; subject_id: string };
export type Student = { id: string; full_name: string; avatar_initials: string; year_level: string };
export type UnitRef = { id: string; name: string };

export type ScheduleSlot = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_id: string;
  class_name: string;
  subject_name: string;
  room: string;
  student_count: number;
};

export type RosterEntry = {
  student: Student;
  assignments_count: number;
  weak_topic_count: number;
};

export type AssignmentType = 'classwork' | 'homework' | 'test' | 'exam';
export type SubmissionStatus = 'processing' | 'marked' | 'needs_review';

export type SubmissionQuestion = {
  id: string;
  question_number: number;
  topic_id: string;
  student_answer: string;
  expected_answer: string;
  ai_is_correct: boolean | null;
  ai_confidence: number | null;
  teacher_overridden: boolean;
  final_is_correct: boolean | null;
};

export type Submission = {
  id: string;
  student: Student;
  class_id: string;
  unit_id: string;
  assignment_type: AssignmentType;
  question_count: number;
  status: SubmissionStatus;
  submitted_at: string;
  marked_at: string | null;
};

export type SubmissionDetail = Submission & { questions: SubmissionQuestion[] };

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? 'Something went wrong. Please try again.';
    throw new ApiError(message, response.status);
  }
  return body as T;
}

export function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(token: string) {
  return request<void>('/auth/logout', { method: 'POST' }, token);
}

export async function getClasses(token: string) {
  const res = await request<Envelope<SchoolClassSummary>>('/classes', {}, token);
  return res.data;
}

export async function getClassStudents(classId: string, token: string) {
  const res = await request<Envelope<Student>>(`/classes/${classId}/students`, {}, token);
  return res.data;
}

export async function getSubjectUnits(subjectId: string, token: string) {
  const res = await request<Envelope<UnitRef>>(`/subjects/${subjectId}/units`, {}, token);
  return res.data;
}

export async function getTeacherSchedule(token: string) {
  const res = await request<DataEnvelope<ScheduleSlot>>('/teachers/me/schedule', {}, token);
  return res.data;
}

export async function getClassRoster(classId: string, token: string) {
  const res = await request<DataEnvelope<RosterEntry>>(`/classes/${classId}/roster`, {}, token);
  return res.data;
}

export function getSubmission(submissionId: string, token: string) {
  return request<SubmissionDetail>(`/submissions/${submissionId}`, {}, token);
}

export type CreateSubmissionInput = {
  photoUri: string;
  studentId: string;
  classId: string;
  unitId: string;
  assignmentType: AssignmentType;
};

export function createSubmission(input: CreateSubmissionInput, token: string) {
  const form = new FormData();
  const filename = input.photoUri.split('/').pop() ?? 'photo.jpg';
  const extMatch = /\.(\w+)$/.exec(filename);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  // React Native's fetch/FormData wants { uri, name, type } for a file part,
  // not a real Blob -- this shape is RN-specific and not standard DOM FormData.
  form.append('photo', { uri: input.photoUri, name: filename, type: mimeType } as unknown as Blob);
  form.append('student_id', input.studentId);
  form.append('class_id', input.classId);
  form.append('unit_id', input.unitId);
  form.append('assignment_type', input.assignmentType);

  return request<Submission>('/submissions', { method: 'POST', body: form }, token);
}
