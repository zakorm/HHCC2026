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

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
