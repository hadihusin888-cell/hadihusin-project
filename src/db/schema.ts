import { pgTable, text, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { TeacherSubjectTaught } from '../types.ts';

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const teachers = pgTable('teachers', {
  id: text('id').primaryKey(),
  nik: text('nik').notNull().unique(),
  name: text('name').notNull(),
  password: text('password'),
  subjectsTaught: jsonb('subjects_taught').$type<TeacherSubjectTaught[]>().notNull(),
});

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  nis: text('nis').notNull().unique(),
  name: text('name').notNull(),
  classId: text('class_id').notNull(),
  password: text('password'),
});

export const materials = pgTable('materials', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  link: text('link').notNull(),
  classId: text('class_id').notNull(),
  subjectId: text('subject_id').notNull(),
  teacherId: text('teacher_id').notNull(),
  createdAt: text('created_at').notNull(),
});

export const assignments = pgTable('assignments', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  dueDate: text('due_date').notNull(),
  link: text('link').notNull(),
  classId: text('class_id').notNull(),
  subjectId: text('subject_id').notNull(),
  teacherId: text('teacher_id').notNull(),
  formEnabled: boolean('form_enabled').notNull(),
  previewEnabled: boolean('preview_enabled').notNull(),
  createdAt: text('created_at').notNull(),
});

export const grades = pgTable('grades', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  assignmentId: text('assignment_id').notNull(),
  subjectId: text('subject_id').notNull(),
  classId: text('class_id').notNull(),
  grade: integer('grade'),
  feedback: text('feedback'),
  submissionLink: text('submission_link'),
  status: text('status').notNull(), // 'SUBMITTED' | 'GRADED' | 'NOT_SUBMITTED' | 'RESET'
  submittedAt: text('submitted_at'),
  gradedAt: text('graded_at'),
});

export const adminConfigs = pgTable('admin_configs', {
  id: text('id').primaryKey(), // config
  adminPassword: text('admin_password').notNull(),
});
