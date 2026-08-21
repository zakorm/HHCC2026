import { createContext, useContext, type ReactNode } from 'react';

import type { StudentProfile } from '@/constants/students';

const StudentContext = createContext<StudentProfile | null>(null);

export function StudentProvider({
  student,
  children,
}: {
  student: StudentProfile;
  children: ReactNode;
}) {
  return <StudentContext.Provider value={student}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const student = useContext(StudentContext);
  if (!student) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return student;
}
