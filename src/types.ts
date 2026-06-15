export interface Class {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface TeacherSubjectTaught {
  subjectId: string;
  classIds: string[]; // Teacher can teach this subject in multiple classes
}

export interface Teacher {
  id: string; // usually NIK
  nik: string;
  name: string;
  password?: string;
  subjectsTaught: TeacherSubjectTaught[];
}

export interface Student {
  id: string; // usually NIS
  nis: string;
  name: string;
  classId: string;
  password?: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  link: string; // Canva, GDocs, Slides link
  classId: string; // TARGET CLASS ID
  subjectId: string;
  teacherId: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  link: string; // Quizizz, GForm, Kahoot link
  classId: string; // TARGET CLASS ID
  subjectId: string;
  teacherId: string;
  formEnabled: boolean; // ON/OFF form submission
  previewEnabled?: boolean; // ON/OFF preview iframe
  createdAt: string;
}

export interface Grade {
  id: string; // e.g. studentId_assignmentId
  studentId: string;
  assignmentId: string;
  subjectId: string;
  classId: string;
  grade?: number;
  feedback?: string;
  submissionLink?: string; // Link submitted by student
  status: 'SUBMITTED' | 'GRADED' | 'NOT_SUBMITTED' | 'RESET';
  submittedAt?: string;
  gradedAt?: string;
}

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | null;

export interface SessionUser {
  id: string; // NIK or NIS or 'admin'
  name: string;
  role: UserRole;
  loginAt?: number; // Timestamp of when the user logged in
  meta?: any; // Extra meta properties (like Class room reference for students)
}
