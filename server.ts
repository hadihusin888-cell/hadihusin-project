import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config();

import { db } from "./src/db/index.ts";
import { 
  classes, 
  subjects, 
  teachers, 
  students, 
  materials, 
  assignments, 
  grades, 
  adminConfigs 
} from "./src/db/schema.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Quick admin password seed check on startup
  try {
    const configRows = await db.select().from(adminConfigs).where(eq(adminConfigs.id, 'config')).limit(1);
    if (configRows.length === 0) {
      await db.insert(adminConfigs).values({ id: 'config', adminPassword: 'admin123' }).onConflictDoNothing();
      console.log("Seeded default admin password: admin123");
    }
  } catch (err) {
    console.error("Failed to verify/seed admin config on startup:", err);
  }

  // API Route: Fetch all DB data for synchronized state
  app.get("/api/data", async (req, res) => {
    try {
      const cls = await db.select().from(classes);
      const subs = await db.select().from(subjects);
      const tchs = await db.select().from(teachers);
      const stds = await db.select().from(students);
      const mats = await db.select().from(materials);
      const asgs = await db.select().from(assignments);
      const grds = await db.select().from(grades);
      const adminCf = await db.select().from(adminConfigs).where(eq(adminConfigs.id, 'config')).limit(1);
      const adminPwd = adminCf[0]?.adminPassword || 'admin123';

      res.json({
        classes: cls,
        subjects: subs,
        teachers: tchs,
        students: stds,
        materials: mats,
        assignments: asgs,
        grades: grds,
        adminPassword: adminPwd
      });
    } catch (error) {
      console.error("Failed to fetch database information:", error);
      res.status(500).json({ error: "Gagal mengambil data dari database." });
    }
  });

  // Manage Classes Endpoints
  app.post("/api/classes", async (req, res) => {
    try {
      const { id, name } = req.body;
      await db.insert(classes)
        .values({ id, name })
        .onConflictDoUpdate({
          target: classes.id,
          set: { name }
        });
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating/upserting class:", error);
      res.status(500).json({ error: "Gagal menyimpan data kelas." });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      await db.update(classes).set({ name }).where(eq(classes.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ error: "Gagal memperbaharui data kelas." });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(classes).where(eq(classes.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ error: "Gagal menghapus kelas." });
    }
  });

  // Manage Subjects Endpoints
  app.post("/api/subjects", async (req, res) => {
    try {
      const { id, name } = req.body;
      await db.insert(subjects)
        .values({ id, name })
        .onConflictDoUpdate({
          target: subjects.id,
          set: { name }
        });
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating/upserting subject:", error);
      res.status(500).json({ error: "Gagal menyimpan mata pelajaran." });
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      await db.update(subjects).set({ name }).where(eq(subjects.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(500).json({ error: "Gagal memperbaharui mata pelajaran." });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(subjects).where(eq(subjects.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ error: "Gagal menghapus mata pelajaran." });
    }
  });

  // Manage Teachers Endpoints
  app.post("/api/teachers", async (req, res) => {
    try {
      const { id, nik, name, password, subjectsTaught } = req.body;
      await db.insert(teachers)
        .values({ id, nik, name, password, subjectsTaught })
        .onConflictDoUpdate({
          target: teachers.id,
          set: { nik, name, password, subjectsTaught }
        });
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating/upserting teacher:", error);
      res.status(500).json({ error: "Gagal menyimpan data guru." });
    }
  });

  app.put("/api/teachers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { nik, name, password, subjectsTaught } = req.body;
      const updateData: any = {};
      if (nik !== undefined) updateData.nik = nik;
      if (name !== undefined) updateData.name = name;
      if (password !== undefined) updateData.password = password;
      if (subjectsTaught !== undefined) updateData.subjectsTaught = subjectsTaught;

      await db.update(teachers).set(updateData).where(eq(teachers.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating teacher:", error);
      res.status(500).json({ error: "Gagal memperbaharui data guru." });
    }
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(teachers).where(eq(teachers.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ error: "Gagal menghapus data guru." });
    }
  });

  // Manage Students Endpoints
  app.post("/api/students", async (req, res) => {
    try {
      const { id, nis, name, classId, password } = req.body;
      await db.insert(students)
        .values({ id, nis, name, classId, password })
        .onConflictDoUpdate({
          target: students.id,
          set: { nis, name, classId, password }
        });
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating/upserting student:", error);
      res.status(500).json({ error: "Gagal menyimpan data siswa." });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { nis, name, classId, password } = req.body;
      const updateData: any = {};
      if (nis !== undefined) updateData.nis = nis;
      if (name !== undefined) updateData.name = name;
      if (classId !== undefined) updateData.classId = classId;
      if (password !== undefined) updateData.password = password;

      await db.update(students).set(updateData).where(eq(students.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ error: "Gagal memperbaharui data siswa." });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(students).where(eq(students.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ error: "Gagal menghapus data siswa." });
    }
  });

  // Bulk Import Students / Classes
  app.post("/api/students/bulk", async (req, res) => {
    try {
      const { students: importStudents, classes: importClasses } = req.body;

      if (importClasses && importClasses.length > 0) {
        for (const cls of importClasses) {
          await db.insert(classes)
            .values({ id: cls.id, name: cls.name })
            .onConflictDoUpdate({ target: classes.id, set: { name: cls.name } });
        }
      }

      if (importStudents && importStudents.length > 0) {
        for (const std of importStudents) {
          await db.insert(students)
            .values({ id: std.id, nis: std.nis, name: std.name, classId: std.classId, password: std.password })
            .onConflictDoUpdate({
              target: students.id,
              set: { nis: std.nis, name: std.name, classId: std.classId, password: std.password }
            });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error importing bulk student data:", error);
      res.status(500).json({ error: "Gagal mengimpor data massal siswa." });
    }
  });

  // Materials Endpoints
  app.post("/api/materials", async (req, res) => {
    try {
      const { id, title, description, link, classId, subjectId, teacherId, createdAt } = req.body;
      await db.insert(materials)
        .values({ id, title, description, link, classId, subjectId, teacherId, createdAt })
        .onConflictDoUpdate({
          target: materials.id,
          set: { title, description, link, classId, subjectId, teacherId, createdAt }
        });
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating material:", error);
      res.status(500).json({ error: "Gagal menyimpan materi pembelajaran." });
    }
  });

  app.put("/api/materials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, link, classId, subjectId } = req.body;
      await db.update(materials)
        .set({ title, description, link, classId, subjectId })
        .where(eq(materials.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating material:", error);
      res.status(500).json({ error: "Gagal memperbaharui materi pembelajaran." });
    }
  });

  app.delete("/api/materials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(materials).where(eq(materials.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({ error: "Gagal menghapus materi pembelajaran." });
    }
  });

  // Assignments Endpoints
  app.post("/api/assignments", async (req, res) => {
    try {
      const { id, title, description, dueDate, link, classId, subjectId, teacherId, formEnabled, previewEnabled, createdAt } = req.body;
      await db.insert(assignments)
        .values({ id, title, description, dueDate, link, classId, subjectId, teacherId, formEnabled, previewEnabled: previewEnabled ?? true, createdAt })
        .onConflictDoUpdate({
          target: assignments.id,
          set: { title, description, dueDate, link, classId, subjectId, teacherId, formEnabled, previewEnabled: previewEnabled ?? true, createdAt }
        });
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ error: "Gagal menyimpan tugas baru." });
    }
  });

  app.put("/api/assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, dueDate, link, classId, subjectId, formEnabled, previewEnabled } = req.body;
      await db.update(assignments)
        .set({ title, description, dueDate, link, classId, subjectId, formEnabled, previewEnabled: previewEnabled ?? true })
        .where(eq(assignments.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ error: "Gagal memperbaharui tugas." });
    }
  });

  app.delete("/api/assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(assignments).where(eq(assignments.id, id));
      await db.delete(grades).where(eq(grades.assignmentId, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ error: "Gagal menghapus tugas." });
    }
  });

  // Grades / Submission Endpoints
  app.post("/api/grades", async (req, res) => {
    try {
      const { id, studentId, assignmentId, subjectId, classId, grade, feedback, submissionLink, status, submittedAt, gradedAt } = req.body;
      const cleanGrade = grade === undefined ? null : grade;
      const cleanFeedback = feedback === undefined ? null : feedback;
      const cleanSubLink = submissionLink === undefined ? null : submissionLink;
      const cleanSubAt = submittedAt === undefined ? null : submittedAt;
      const cleanGrdAt = gradedAt === undefined ? null : gradedAt;

      await db.insert(grades)
        .values({
          id,
          studentId,
          assignmentId,
          subjectId,
          classId,
          grade: cleanGrade,
          feedback: cleanFeedback,
          submissionLink: cleanSubLink,
          status,
          submittedAt: cleanSubAt,
          gradedAt: cleanGrdAt
        })
        .onConflictDoUpdate({
          target: grades.id,
          set: {
            studentId,
            assignmentId,
            subjectId,
            classId,
            grade: cleanGrade,
            feedback: cleanFeedback,
            submissionLink: cleanSubLink,
            status,
            submittedAt: cleanSubAt,
            gradedAt: cleanGrdAt
          }
        });
      res.json({ success: true });
    } catch (error) {
      console.error("Error submitting/upserting grade:", error);
      res.status(500).json({ error: "Gagal mengumpulkan data nilai/tugas." });
    }
  });

  app.put("/api/grades/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { grade, feedback, status, gradedAt, submissionLink, submittedAt } = req.body;
      
      const updateData: any = {};
      if (grade !== undefined) updateData.grade = grade === null ? null : grade;
      if (feedback !== undefined) updateData.feedback = feedback === null ? null : feedback;
      if (status !== undefined) updateData.status = status;
      if (gradedAt !== undefined) updateData.gradedAt = gradedAt === null ? null : gradedAt;
      if (submissionLink !== undefined) updateData.submissionLink = submissionLink === null ? null : submissionLink;
      if (submittedAt !== undefined) updateData.submittedAt = submittedAt === null ? null : submittedAt;

      await db.update(grades).set(updateData).where(eq(grades.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating grade:", error);
      res.status(500).json({ error: "Gagal memberi nilai." });
    }
  });

  // Admin Config Password
  app.post("/api/admin/password", async (req, res) => {
    try {
      const { adminPassword } = req.body;
      await db.insert(adminConfigs)
        .values({ id: 'config', adminPassword })
        .onConflictDoUpdate({
          target: adminConfigs.id,
          set: { adminPassword }
        });
      res.json({ success: true });
    } catch (error) {
      console.error("Error changing admin password:", error);
      res.status(500).json({ error: "Gagal mengubah password admin." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
