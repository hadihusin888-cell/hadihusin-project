import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Class, 
  Subject, 
  Teacher, 
  Student, 
  Material, 
  Assignment, 
  Grade, 
  SessionUser,
} from '../types.ts';

interface DbContextType {
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  materials: Material[];
  assignments: Assignment[];
  grades: Grade[];
  adminPassword: string;
  currentUser: SessionUser | null;
  isLoading: boolean;
  
  // Auth actions
  login: (username: string, password: string, role: 'ADMIN' | 'TEACHER' | 'STUDENT') => Promise<SessionUser>;
  logout: () => void;
  updateAdminPassword: (newPassword: string) => void;
  updateTeacherPassword: (nik: string, newPassword: string) => void;
  updateStudentPassword: (nis: string, newPassword: string) => void;

  // Manage Classes
  addClass: (name: string) => Class;
  editClass: (id: string, name: string) => void;
  deleteClass: (id: string) => void;

  // Manage Subjects (Mapel)
  addSubject: (name: string) => Subject;
  editSubject: (id: string, name: string) => void;
  deleteSubject: (id: string) => void;

  // Manage Teachers (Guru)
  addTeacher: (nik: string, name: string, subjectsTaught: any[], password?: string) => Teacher;
  editTeacher: (id: string, name: string, subjectsTaught: any[], password?: string) => void;
  deleteTeacher: (id: string) => void;

  // Manage Students (Siswa)
  addStudent: (nis: string, name: string, classId: string, password?: string) => Student;
  editStudent: (id: string, name: string, classId: string, password?: string) => void;
  deleteStudent: (id: string) => void;
  importStudentsBulk: (
    studentsToImport: Array<{ nis: string; name: string; classInput: string; password?: string }>
  ) => Promise<{ addedStudents: number; addedClasses: number }>;

  // Materials (Materi)
  addMaterial: (title: string, description: string, link: string, classId: string, subjectId: string, teacherId: string) => Material;
  editMaterial: (id: string, title: string, description: string, link: string, classId: string, subjectId: string) => void;
  deleteMaterial: (id: string) => void;

  // Assignments (Tugas)
  addAssignment: (title: string, description: string, dueDate: string, link: string, classId: string, subjectId: string, teacherId: string, formEnabled: boolean, previewEnabled?: boolean) => Assignment;
  editAssignment: (id: string, title: string, description: string, dueDate: string, link: string, classId: string, subjectId: string, formEnabled: boolean, previewEnabled?: boolean) => void;
  deleteAssignment: (id: string) => void;

  // Grading & Submissions (Nilai)
  submitAssignment: (studentId: string, assignmentId: string, submissionLink: string, subjectId: string, classId: string) => Grade;
  gradeAssignment: (gradeId: string, gradeValue: number, feedback: string) => void;
  resetAssignmentValue: (gradeId: string) => void;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [adminPassword, setAdminPassword] = useState<string>('admin123');
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronous initial fetch & live synchronization polling loop
  useEffect(() => {
    // 1. Instantly load from localStorage for lightning-fast launch presentation state
    const storedClasses = localStorage.getItem('smp_classes');
    const storedSubjects = localStorage.getItem('smp_subjects');
    const storedTeachers = localStorage.getItem('smp_teachers');
    const storedStudents = localStorage.getItem('smp_students');
    const storedMaterials = localStorage.getItem('smp_materials');
    const storedAssignments = localStorage.getItem('smp_assignments');
    const storedGrades = localStorage.getItem('smp_grades');
    const storedAdminPassword = localStorage.getItem('smp_admin_pwd');
    const storedUser = localStorage.getItem('smp_current_user');

    if (storedClasses) setClasses(JSON.parse(storedClasses));
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
    if (storedTeachers) setTeachers(JSON.parse(storedTeachers));
    if (storedStudents) setStudents(JSON.parse(storedStudents));
    if (storedMaterials) setMaterials(JSON.parse(storedMaterials));
    if (storedAssignments) setAssignments(JSON.parse(storedAssignments));
    if (storedGrades) setGrades(JSON.parse(storedGrades));
    if (storedAdminPassword) setAdminPassword(storedAdminPassword);
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    // If local state is empty, keep loading indicator until at least first background query finishes
    if (!storedClasses && !storedSubjects && !storedTeachers) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    // 2. Fetch function to bridge live cloud relational state down to device
    const fetchLiveData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
          setSubjects(data.subjects || []);
          setTeachers(data.teachers || []);
          setStudents(data.students || []);
          setMaterials(data.materials || []);
          setAssignments(data.assignments || []);
          setGrades(data.grades || []);
          setAdminPassword(data.adminPassword || 'admin123');

          // Save current state as local standby cache
          localStorage.setItem('smp_classes', JSON.stringify(data.classes || []));
          localStorage.setItem('smp_subjects', JSON.stringify(data.subjects || []));
          localStorage.setItem('smp_teachers', JSON.stringify(data.teachers || []));
          localStorage.setItem('smp_students', JSON.stringify(data.students || []));
          localStorage.setItem('smp_materials', JSON.stringify(data.materials || []));
          localStorage.setItem('smp_assignments', JSON.stringify(data.assignments || []));
          localStorage.setItem('smp_grades', JSON.stringify(data.grades || []));
          localStorage.setItem('smp_admin_pwd', data.adminPassword || 'admin123');

          // Align currentUser metadata if there was a modification on other screens
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role === 'TEACHER') {
              const liveTeacher = (data.teachers || []).find((t: Teacher) => t.id === parsedUser.id);
              if (liveTeacher) {
                const updatedUser: SessionUser = {
                  ...parsedUser,
                  name: liveTeacher.name,
                  meta: { ...parsedUser.meta, nik: liveTeacher.nik }
                };
                setCurrentUser(updatedUser);
                localStorage.setItem('smp_current_user', JSON.stringify(updatedUser));
              }
            } else if (parsedUser.role === 'STUDENT') {
              const liveStudent = (data.students || []).find((s: Student) => s.id === parsedUser.id);
              if (liveStudent) {
                const updatedUser: SessionUser = {
                  ...parsedUser,
                  name: liveStudent.name,
                  meta: { ...parsedUser.meta, nis: liveStudent.nis, classId: liveStudent.classId }
                };
                setCurrentUser(updatedUser);
                localStorage.setItem('smp_current_user', JSON.stringify(updatedUser));
              }
            }
          }
        }
      } catch (error) {
        console.warn("Offline or background REST server data sync failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveData();

    // Set stable micro-polling sync timer (every 5 seconds) to ensure multi-screen coherence
    const pollingInterval = setInterval(fetchLiveData, 5000);

    return () => {
      clearInterval(pollingInterval);
    };
  }, []);

  // Auth Operations
  const login = async (username: string, password: string, role: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    if (role === 'ADMIN') {
      if (username.toLowerCase() === 'admin' && password === adminPassword) {
        const user: SessionUser = { id: 'admin', name: 'Administrator', role: 'ADMIN' };
        setCurrentUser(user);
        localStorage.setItem('smp_current_user', JSON.stringify(user));
        return user;
      }
      throw new Error('Username Admin salah atau Password salah.');
    }

    if (role === 'TEACHER') {
      const teacher = teachers.find(t => t.nik === username);
      if (teacher && teacher.password === password) {
        const user: SessionUser = { id: teacher.id, name: teacher.name, role: 'TEACHER', meta: { nik: teacher.nik } };
        setCurrentUser(user);
        localStorage.setItem('smp_current_user', JSON.stringify(user));
        return user;
      }
      throw new Error('NIK atau Password Guru salah.');
    }

    if (role === 'STUDENT') {
      const student = students.find(s => s.nis === username);
      if (student && student.password === password) {
        const user: SessionUser = { id: student.id, name: student.name, role: 'STUDENT', meta: { nis: student.nis, classId: student.classId } };
        setCurrentUser(user);
        localStorage.setItem('smp_current_user', JSON.stringify(user));
        return user;
      }
      throw new Error('NIS atau Password Siswa salah.');
    }

    throw new Error('Peran login tidak valid.');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smp_current_user');
  };

  const updateAdminPassword = (newPassword: string) => {
    setAdminPassword(newPassword);
    localStorage.setItem('smp_admin_pwd', newPassword);

    fetch('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: newPassword })
    }).catch(err => console.error("Error updating admin password:", err));
  };

  const updateTeacherPassword = (nik: string, newPassword: string) => {
    const updated = teachers.map(t => {
      if (t.nik === nik) {
        const teacherUpdated = { ...t, password: newPassword };
        fetch(`/api/teachers/${t.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        }).catch(err => console.error("Error updating teacher password:", err));
        return teacherUpdated;
      }
      return t;
    });
    setTeachers(updated);
    localStorage.setItem('smp_teachers', JSON.stringify(updated));
  };

  const updateStudentPassword = (nis: string, newPassword: string) => {
    const updated = students.map(s => {
      if (s.nis === nis) {
        const studentUpdated = { ...s, password: newPassword };
        fetch(`/api/students/${s.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        }).catch(err => console.error("Error updating student password:", err));
        return studentUpdated;
      }
      return s;
    });
    setStudents(updated);
    localStorage.setItem('smp_students', JSON.stringify(updated));
  };

  // Manage Classes
  const addClass = (name: string) => {
    const newClass: Class = {
      id: name.trim().toUpperCase().replace(/\s+/g, '_'),
      name: name.trim()
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem('smp_classes', JSON.stringify(updated));

    fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass)
    }).catch(err => console.error("Error adding class:", err));

    return newClass;
  };

  const editClass = (id: string, name: string) => {
    const updated = classes.map(c => c.id === id ? { ...c, name: name.trim() } : c);
    setClasses(updated);
    localStorage.setItem('smp_classes', JSON.stringify(updated));

    fetch(`/api/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    }).catch(err => console.error("Error editing class:", err));
  };

  const deleteClass = (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    localStorage.setItem('smp_classes', JSON.stringify(updated));

    fetch(`/api/classes/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error("Error deleting class:", err));
  };

  // Manage Subjects
  const addSubject = (name: string) => {
    const newSub: Subject = {
      id: "MAPEL_" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: name.trim()
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    localStorage.setItem('smp_subjects', JSON.stringify(updated));

    fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub)
    }).catch(err => console.error("Error adding subject:", err));

    return newSub;
  };

  const editSubject = (id: string, name: string) => {
    const updated = subjects.map(s => s.id === id ? { ...s, name: name.trim() } : s);
    setSubjects(updated);
    localStorage.setItem('smp_subjects', JSON.stringify(updated));

    fetch(`/api/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    }).catch(err => console.error("Error editing subject:", err));
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    localStorage.setItem('smp_subjects', JSON.stringify(updated));

    fetch(`/api/subjects/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error("Error deleting subject:", err));
  };

  // Manage Teachers
  const addTeacher = (nik: string, name: string, subjectsTaught: any[], password?: string) => {
    const newTeacher: Teacher = {
      id: nik.trim(),
      nik: nik.trim(),
      name: name.trim(),
      password: password && password.trim() ? password.trim() : nik.trim(),
      subjectsTaught
    };
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem('smp_teachers', JSON.stringify(updated));

    fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTeacher)
    }).catch(err => console.error("Error adding teacher:", err));

    return newTeacher;
  };

  const editTeacher = (id: string, name: string, subjectsTaught: any[], password?: string) => {
    const updated = teachers.map(t => {
      if (t.id === id) {
        const updatedT = { 
          ...t, 
          name: name.trim(), 
          subjectsTaught,
          password: password && password.trim() ? password.trim() : t.password
        };
        fetch(`/api/teachers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: name.trim(), 
            subjectsTaught,
            password: password && password.trim() ? password.trim() : t.password 
          })
        }).catch(err => console.error("Error editing teacher:", err));
        return updatedT;
      }
      return t;
    });
    setTeachers(updated);
    localStorage.setItem('smp_teachers', JSON.stringify(updated));
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    localStorage.setItem('smp_teachers', JSON.stringify(updated));

    fetch(`/api/teachers/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error("Error deleting teacher:", err));
  };

  // Manage Students
  const addStudent = (nis: string, name: string, classId: string, password?: string) => {
    const newStudent: Student = {
      id: nis.trim(),
      nis: nis.trim(),
      name: name.trim(),
      classId,
      password: password && password.trim() ? password.trim() : nis.trim()
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('smp_students', JSON.stringify(updated));

    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent)
    }).catch(err => console.error("Error adding student:", err));

    return newStudent;
  };

  const editStudent = (id: string, name: string, classId: string, password?: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        const updatedS = { 
          ...s, 
          name: name.trim(), 
          classId,
          password: password && password.trim() ? password.trim() : s.password
        };
        fetch(`/api/students/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: name.trim(), 
            classId,
            password: password && password.trim() ? password.trim() : s.password 
          })
        }).catch(err => console.error("Error editing student:", err));
        return updatedS;
      }
      return s;
    });
    setStudents(updated);
    localStorage.setItem('smp_students', JSON.stringify(updated));
  };

  const deleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem('smp_students', JSON.stringify(updated));

    fetch(`/api/students/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error("Error deleting student:", err));
  };

  const importStudentsBulk = async (
    studentsToImport: Array<{ nis: string; name: string; classInput: string; password?: string }>
  ) => {
    let currentClasses = [...classes];
    let currentStudents = [...students];

    const newClassesToCreate: Class[] = [];
    const newStudentsToCreate: Student[] = [];

    const findClassIdInternal = (clsInput: string, classList: Class[]) => {
      if (!clsInput) return null;
      const normalized = clsInput.trim().toLowerCase();
      
      // 1. Try raw ID match
      let matchedClass = classList.find(c => c.id.toLowerCase() === normalized);
      if (matchedClass) return matchedClass.id;

      // 2. Try Name match
      matchedClass = classList.find(c => c.name.toLowerCase() === normalized);
      if (matchedClass) return matchedClass.id;

      // 3. Try fallback
      const stripped = normalized.replace(/[^a-z0-9]/g, '');
      matchedClass = classList.find(c => {
        const clsIdSt = c.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const clsNmSt = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return clsIdSt === stripped || clsNmSt === stripped;
      });
      if (matchedClass) return matchedClass.id;

      return null;
    };

    studentsToImport.forEach(item => {
      let targetClassId = findClassIdInternal(item.classInput, currentClasses);

      if (!targetClassId) {
        const normalizedClassName = item.classInput.trim();
        const newClassId = normalizedClassName.toUpperCase().replace(/\s+/g, '_');
        
        const newClass: Class = {
          id: newClassId,
          name: normalizedClassName
        };
        currentClasses.push(newClass);
        newClassesToCreate.push(newClass);
        targetClassId = newClassId;
      }

      const nisTrimmed = item.nis.trim();
      const isDuplicate = currentStudents.some(s => s.id === nisTrimmed || s.nis === nisTrimmed);
      
      if (!isDuplicate) {
        const newStudent: Student = {
          id: nisTrimmed,
          nis: nisTrimmed,
          name: item.name.trim(),
          classId: targetClassId,
          password: item.password && item.password.trim() ? item.password.trim() : nisTrimmed
        };
        currentStudents.push(newStudent);
        newStudentsToCreate.push(newStudent);
      }
    });

    if (newClassesToCreate.length > 0 || newStudentsToCreate.length > 0) {
      if (newClassesToCreate.length > 0) {
        setClasses(currentClasses);
        localStorage.setItem('smp_classes', JSON.stringify(currentClasses));
      }
      if (newStudentsToCreate.length > 0) {
        setStudents(currentStudents);
        localStorage.setItem('smp_students', JSON.stringify(currentStudents));
      }

      await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classes: newClassesToCreate,
          students: newStudentsToCreate
        })
      }).catch(err => console.error("Error bulk uploading students/classes:", err));
    }

    return {
      addedStudents: newStudentsToCreate.length,
      addedClasses: newClassesToCreate.length
    };
  };

  // Materials CRUD
  const addMaterial = (
    title: string, 
    description: string, 
    link: string, 
    classId: string, 
    subjectId: string, 
    teacherId: string
  ) => {
    const newMat: Material = {
      id: "MAT_" + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      classId,
      subjectId,
      teacherId,
      createdAt: new Date().toISOString()
    };
    const updated = [...materials, newMat];
    setMaterials(updated);
    localStorage.setItem('smp_materials', JSON.stringify(updated));

    fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMat)
    }).catch(err => console.error("Error adding material:", err));

    return newMat;
  };

  const editMaterial = (
    id: string, 
    title: string, 
    description: string, 
    link: string, 
    classId: string, 
    subjectId: string
  ) => {
    const updated = materials.map(m => {
      if (m.id === id) {
        const updatedM = { 
          ...m, 
          title: title.trim(), 
          description: description.trim(), 
          link: link.trim(), 
          classId, 
          subjectId 
        };
        fetch(`/api/materials/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: title.trim(), 
            description: description.trim(), 
            link: link.trim(), 
            classId, 
            subjectId 
          })
        }).catch(err => console.error("Error editing material:", err));
        return updatedM;
      }
      return m;
    });
    setMaterials(updated);
    localStorage.setItem('smp_materials', JSON.stringify(updated));
  };

  const deleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    localStorage.setItem('smp_materials', JSON.stringify(updated));

    fetch(`/api/materials/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error("Error deleting material:", err));
  };

  // Assignments CRUD
  const addAssignment = (
    title: string, 
    description: string, 
    dueDate: string, 
    link: string, 
    classId: string, 
    subjectId: string, 
    teacherId: string, 
    formEnabled: boolean,
    previewEnabled?: boolean
  ) => {
    const newAsg: Assignment = {
      id: "ASG_" + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      link: link.trim(),
      classId,
      subjectId,
      teacherId,
      formEnabled,
      previewEnabled: previewEnabled ?? true,
      createdAt: new Date().toISOString()
    };
    const updated = [...assignments, newAsg];
    setAssignments(updated);
    localStorage.setItem('smp_assignments', JSON.stringify(updated));

    fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsg)
    }).catch(err => console.error("Error adding assignment:", err));

    return newAsg;
  };

  const editAssignment = (
    id: string, 
    title: string, 
    description: string, 
    dueDate: string, 
    link: string, 
    classId: string, 
    subjectId: string, 
    formEnabled: boolean,
    previewEnabled?: boolean
  ) => {
    const updated = assignments.map(a => {
      if (a.id === id) {
        const updatedA = { 
          ...a, 
          title: title.trim(), 
          description: description.trim(), 
          dueDate, 
          link: link.trim(), 
          classId, 
          subjectId,
          formEnabled,
          previewEnabled: previewEnabled ?? true
        };
        fetch(`/api/assignments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: title.trim(), 
            description: description.trim(), 
            dueDate, 
            link: link.trim(), 
            classId, 
            subjectId,
            formEnabled,
            previewEnabled: previewEnabled ?? true
          })
        }).catch(err => console.error("Error editing assignment:", err));
        return updatedA;
      }
      return a;
    });
    setAssignments(updated);
    localStorage.setItem('smp_assignments', JSON.stringify(updated));
  };

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    
    // Also remove respective grades locally to keep sync clean
    const updatedGrades = grades.filter(g => g.assignmentId !== id);
    setGrades(updatedGrades);

    localStorage.setItem('smp_assignments', JSON.stringify(updated));
    localStorage.setItem('smp_grades', JSON.stringify(updatedGrades));

    fetch(`/api/assignments/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error("Error deleting assignment:", err));
  };

  // Student Actions: Submission of assignments
  const submitAssignment = (
    studentId: string, 
    assignmentId: string, 
    submissionLink: string, 
    subjectId: string, 
    classId: string
  ) => {
    const existingIndex = grades.findIndex(g => g.studentId === studentId && g.assignmentId === assignmentId);
    
    const submittedGrade: Grade = {
      id: existingIndex >= 0 ? grades[existingIndex].id : `GRAD_${studentId}_${assignmentId}`,
      studentId,
      assignmentId,
      subjectId,
      classId,
      grade: existingIndex >= 0 ? grades[existingIndex].grade : undefined,
      feedback: existingIndex >= 0 ? grades[existingIndex].feedback : undefined,
      submissionLink: submissionLink.trim(),
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString()
    };

    let updated: Grade[];
    if (existingIndex >= 0) {
      updated = grades.map((g, idx) => idx === existingIndex ? submittedGrade : g);
    } else {
      updated = [...grades, submittedGrade];
    }
    
    setGrades(updated);
    localStorage.setItem('smp_grades', JSON.stringify(updated));

    fetch('/api/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submittedGrade)
    }).catch(err => console.error("Error submitting assignment grade data:", err));

    return submittedGrade;
  };

  // Teacher Action: Grading & feedback
  const gradeAssignment = (gradeId: string, gradeValue: number, feedback: string) => {
    const updated = grades.map(g => {
      if (g.id === gradeId) {
        const updatedG = {
          ...g,
          grade: gradeValue,
          feedback: feedback.trim(),
          status: 'GRADED' as const,
          gradedAt: new Date().toISOString()
        };
        fetch(`/api/grades/${gradeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade: gradeValue,
            feedback: feedback.trim(),
            status: 'GRADED',
            gradedAt: updatedG.gradedAt
          })
        }).catch(err => console.error("Error grading assignment:", err));
        return updatedG;
      }
      return g;
    });
    setGrades(updated);
    localStorage.setItem('smp_grades', JSON.stringify(updated));
  };

  // Teacher Action: Reset grade so student can submit / do again
  const resetAssignmentValue = (gradeId: string) => {
    const updated = grades.map(g => {
      if (g.id === gradeId) {
        const updatedG: Grade = {
          ...g,
          grade: undefined,
          feedback: undefined,
          submissionLink: undefined,
          status: 'RESET' as const,
          submittedAt: undefined,
          gradedAt: undefined
        };
        fetch(`/api/grades/${gradeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade: null,
            feedback: null,
            submissionLink: null,
            status: 'RESET',
            submittedAt: null,
            gradedAt: null
          })
        }).catch(err => console.error("Error resetting assignment grade:", err));
        return updatedG;
      }
      return g;
    });
    setGrades(updated);
    localStorage.setItem('smp_grades', JSON.stringify(updated));
  };

  return (
    <DbContext.Provider value={{
      classes,
      subjects,
      teachers,
      students,
      materials,
      assignments,
      grades,
      adminPassword,
      currentUser,
      isLoading,
      login,
      logout,
      updateAdminPassword,
      updateTeacherPassword,
      updateStudentPassword,
      addClass,
      editClass,
      deleteClass,
      addSubject,
      editSubject,
      deleteSubject,
      addTeacher,
      editTeacher,
      deleteTeacher,
      addStudent,
      editStudent,
      deleteStudent,
      importStudentsBulk,
      addMaterial,
      editMaterial,
      deleteMaterial,
      addAssignment,
      editAssignment,
      deleteAssignment,
      submitAssignment,
      gradeAssignment,
      resetAssignmentValue
    }}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (context === undefined) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
