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
import { db } from '../firebase.ts';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  where,
  limit
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'custom-e-learning-session',
      email: 'custom-session-active',
      emailVerified: true,
      isAnonymous: false,
    },
    operationType,
    path
  };
  console.error('Firestore Database Action Failed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
  isSyncing: boolean;
  lastSynced: string | null;
  refreshData: () => Promise<void>;
  
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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Fallback state loading helper from local cache for high-fidelity instant start
  useEffect(() => {
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
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && (parsedUser.role === 'TEACHER' || parsedUser.role === 'STUDENT')) {
          if (parsedUser.loginAt) {
            const elapsed = Date.now() - parsedUser.loginAt;
            // 1 hour = 3600000 ms
            if (elapsed > 3600000) {
              localStorage.removeItem('smp_current_user');
              setCurrentUser(null);
            } else {
              setCurrentUser(parsedUser);
            }
          } else {
            // If logged in under the previous build and doesn't have a loginAt, default it to now
            parsedUser.loginAt = Date.now();
            localStorage.setItem('smp_current_user', JSON.stringify(parsedUser));
            setCurrentUser(parsedUser);
          }
        } else {
          setCurrentUser(parsedUser);
        }
      } catch (e) {
        console.error("Gagal membaca data login pengguna:", e);
        localStorage.removeItem('smp_current_user');
        setCurrentUser(null);
      }
    }
    
    // Set loading to false once cache is fully loaded to prevent stalling on login
    setIsLoading(false);
  }, []);

  // Automatic logout timer for TEACHER and STUDENT accounts (> 1 hour)
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'TEACHER' && currentUser.role !== 'STUDENT')) {
      return;
    }

    const intervalId = setInterval(() => {
      if (currentUser.loginAt) {
        const elapsed = Date.now() - currentUser.loginAt;
        const ONE_HOUR = 3600000; // 1 hour in ms
        if (elapsed > ONE_HOUR) {
          console.warn("Sesi pengguna berakhir otomatis (melebihi 1 jam).");
          logout();
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(intervalId);
  }, [currentUser]);

  // Set up Firebase Real-Time Synchronization Listeners
  useEffect(() => {
    if (!db) {
      console.warn("Firestore database configuration not active/ready. Running with local caching cache mode.");
      setIsLoading(false);
      return;
    }

    // Prevent annoying full-screen blocker during live listener registration so local cache loads instantly
    const unsubscribes: (() => void)[] = [];

    let activeLoadedCollections = 0;
    const checkIsLoadComplete = () => {
      activeLoadedCollections++;
      if (activeLoadedCollections >= 8) {
        setIsLoading(false);
        setLastSynced(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    };

    // 1. Classes onSnapshot (Always active or with limit for fast reference)
    const classesQuery = currentUser?.role === 'ADMIN' 
      ? collection(db, 'classes') 
      : query(collection(db, 'classes'), limit(50));

    const unsubClasses = onSnapshot(classesQuery, (snapshot) => {
      const list: Class[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Class);
      });
      setClasses(list);
      localStorage.setItem('smp_classes', JSON.stringify(list));
      checkIsLoadComplete();
    }, (error) => {
      console.warn("Firestore listener 'classes' blocked or offline:", error);
      checkIsLoadComplete();
    });
    unsubscribes.push(unsubClasses);

    // 2. Subjects onSnapshot (Capped to optimized reads limit)
    const subjectsQuery = query(collection(db, 'subjects'), limit(100));
    const unsubSubjects = onSnapshot(subjectsQuery, (snapshot) => {
      const list: Subject[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Subject);
      });
      setSubjects(list);
      localStorage.setItem('smp_subjects', JSON.stringify(list));
      checkIsLoadComplete();
    }, (error) => {
      console.warn("Firestore listener 'subjects' blocked or offline:", error);
      checkIsLoadComplete();
    });
    unsubscribes.push(unsubSubjects);

    // 3. Teachers onSnapshot (Capped to optimized limit)
    const teachersQuery = query(collection(db, 'teachers'), limit(100));
    const unsubTeachers = onSnapshot(teachersQuery, (snapshot) => {
      const list: Teacher[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Teacher);
      });
      setTeachers(list);
      localStorage.setItem('smp_teachers', JSON.stringify(list));
      checkIsLoadComplete();
    }, (error) => {
      console.warn("Firestore listener 'teachers' blocked or offline:", error);
      checkIsLoadComplete();
    });
    unsubscribes.push(unsubTeachers);

    // 4. Students onSnapshot (Optimized using Filters depending on who is logged in!)
    let studentsQuery;
    if (currentUser?.role === 'ADMIN') {
      studentsQuery = collection(db, 'students');
    } else if (currentUser?.role === 'STUDENT') {
      // Students only need classmate peers! Extremely high cost savings!
      const studentClassId = currentUser.meta?.classId || 'default';
      studentsQuery = query(collection(db, 'students'), where('classId', '==', studentClassId));
    } else if (currentUser?.role === 'TEACHER') {
      // Get classes this teacher is assigned to from their metadata
      const classIds = currentUser.meta?.classIds || [];
      if (classIds.length > 0) {
        studentsQuery = query(collection(db, 'students'), where('classId', 'in', classIds));
      } else {
        studentsQuery = query(collection(db, 'students'), limit(30));
      }
    } else {
      // Download nothing if not logged in
      studentsQuery = query(collection(db, 'students'), where('classId', '==', 'NOT_LOGGED_IN'));
    }

    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudents(list);
      localStorage.setItem('smp_students', JSON.stringify(list));
      checkIsLoadComplete();
    }, (error) => {
      console.warn("Firestore listener 'students' blocked or offline:", error);
      checkIsLoadComplete();
    });
    unsubscribes.push(unsubStudents);

    // 5. Materials onSnapshot (Optimized!)
    let materialsQuery;
    if (currentUser?.role === 'ADMIN') {
      materialsQuery = query(collection(db, 'materials'), limit(200));
    } else if (currentUser?.role === 'TEACHER') {
      // Only download their own materials
      materialsQuery = query(collection(db, 'materials'), where('teacherId', '==', currentUser.id));
    } else if (currentUser?.role === 'STUDENT') {
      // Only download materials for their class
      const studentClassId = currentUser.meta?.classId || 'default';
      materialsQuery = query(collection(db, 'materials'), where('classId', '==', studentClassId));
    } else {
      materialsQuery = query(collection(db, 'materials'), where('classId', '==', 'NOT_LOGGED_IN'));
    }

    const unsubMaterials = onSnapshot(materialsQuery, (snapshot) => {
      const list: Material[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Material);
      });
      setMaterials(list);
      localStorage.setItem('smp_materials', JSON.stringify(list));
      checkIsLoadComplete();
    }, (error) => {
      console.warn("Firestore listener 'materials' blocked or offline:", error);
      checkIsLoadComplete();
    });
    unsubscribes.push(unsubMaterials);

    // 6. Assignments onSnapshot (Optimized!)
    let assignmentsQuery;
    if (currentUser?.role === 'ADMIN') {
      assignmentsQuery = query(collection(db, 'assignments'), limit(200));
    } else if (currentUser?.role === 'TEACHER') {
      // Only download their own assignments
      assignmentsQuery = query(collection(db, 'assignments'), where('teacherId', '==', currentUser.id));
    } else if (currentUser?.role === 'STUDENT') {
      // Only download assignments for their class
      const studentClassId = currentUser.meta?.classId || 'default';
      assignmentsQuery = query(collection(db, 'assignments'), where('classId', '==', studentClassId));
    } else {
      assignmentsQuery = query(collection(db, 'assignments'), where('classId', '==', 'NOT_LOGGED_IN'));
    }

    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      const list: Assignment[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Assignment);
      });
      setAssignments(list);
      localStorage.setItem('smp_assignments', JSON.stringify(list));
      checkIsLoadComplete();
    }, (error) => {
      console.warn("Firestore listener 'assignments' blocked or offline:", error);
      checkIsLoadComplete();
    });
    unsubscribes.push(unsubAssignments);

    // 7. Grades onSnapshot (Optimized!)
    let gradesQuery;
    if (currentUser?.role === 'ADMIN') {
      gradesQuery = query(collection(db, 'grades'), limit(500));
    } else if (currentUser?.role === 'TEACHER') {
      // Filter grades of classes they teach
      const classIds = currentUser.meta?.classIds || [];
      if (classIds.length > 0) {
        gradesQuery = query(collection(db, 'grades'), where('classId', 'in', classIds));
      } else {
        gradesQuery = query(collection(db, 'grades'), limit(30));
      }
    } else if (currentUser?.role === 'STUDENT') {
      // Students ONLY download their own grades/submissions! HUGE reduction in read operations.
      gradesQuery = query(collection(db, 'grades'), where('studentId', '==', currentUser.id));
    } else {
      gradesQuery = query(collection(db, 'grades'), where('studentId', '==', 'NOT_LOGGED_IN'));
    }

    const unsubGrades = onSnapshot(gradesQuery, (snapshot) => {
      const list: Grade[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Grade);
      });
      setGrades(list);
      localStorage.setItem('smp_grades', JSON.stringify(list));
      checkIsLoadComplete();
    }, (error) => {
      console.warn("Firestore listener 'grades' blocked or offline:", error);
      checkIsLoadComplete();
    });
    unsubscribes.push(unsubGrades);

    // 8. AdminConfigs onSnapshot (Seeding admin123 by default if empty)
    const unsubAdminConfig = onSnapshot(doc(db, 'adminConfigs', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        const pwd = snapshot.data().adminPassword;
        setAdminPassword(pwd || 'admin123');
        localStorage.setItem('smp_admin_pwd', pwd || 'admin123');
      } else {
        setDoc(doc(db, 'adminConfigs', 'config'), { id: 'config', adminPassword: 'admin123' })
          .catch(err => console.error("Initial seed of adminConfig failed in Firestore Cloud:", err));
        setAdminPassword('admin123');
        localStorage.setItem('smp_admin_pwd', 'admin123');
      }
      checkIsLoadComplete();
    }, (error) => {
      console.warn("Firestore listener 'adminConfigs' blocked or offline:", error);
      checkIsLoadComplete();
    });
    unsubscribes.push(unsubAdminConfig);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [db, currentUser]);

  // Handle manual / focus refresh pulls to synchronize state securely
  const refreshData = async () => {
    if (!db) return;
    setIsSyncing(true);
    try {
      // Opt-in queries depending on user role
      const classesQuery = currentUser?.role === 'ADMIN' 
        ? collection(db, 'classes') 
        : query(collection(db, 'classes'), limit(50));

      const subjectsQuery = query(collection(db, 'subjects'), limit(100));
      const teachersQuery = query(collection(db, 'teachers'), limit(100));

      let studentsQuery;
      if (currentUser?.role === 'ADMIN') {
        studentsQuery = collection(db, 'students');
      } else if (currentUser?.role === 'STUDENT') {
        const studentClassId = currentUser.meta?.classId || 'default';
        studentsQuery = query(collection(db, 'students'), where('classId', '==', studentClassId));
      } else if (currentUser?.role === 'TEACHER') {
        const classIds = currentUser.meta?.classIds || [];
        if (classIds.length > 0) {
          studentsQuery = query(collection(db, 'students'), where('classId', 'in', classIds));
        } else {
          studentsQuery = query(collection(db, 'students'), limit(30));
        }
      } else {
        studentsQuery = query(collection(db, 'students'), where('classId', '==', 'NOT_LOGGED_IN'));
      }

      let materialsQuery;
      if (currentUser?.role === 'ADMIN') {
        materialsQuery = query(collection(db, 'materials'), limit(200));
      } else if (currentUser?.role === 'TEACHER') {
        materialsQuery = query(collection(db, 'materials'), where('teacherId', '==', currentUser.id));
      } else if (currentUser?.role === 'STUDENT') {
        const studentClassId = currentUser.meta?.classId || 'default';
        materialsQuery = query(collection(db, 'materials'), where('classId', '==', studentClassId));
      } else {
        materialsQuery = query(collection(db, 'materials'), where('classId', '==', 'NOT_LOGGED_IN'));
      }

      let assignmentsQuery;
      if (currentUser?.role === 'ADMIN') {
        assignmentsQuery = query(collection(db, 'assignments'), limit(200));
      } else if (currentUser?.role === 'TEACHER') {
        assignmentsQuery = query(collection(db, 'assignments'), where('teacherId', '==', currentUser.id));
      } else if (currentUser?.role === 'STUDENT') {
        const studentClassId = currentUser.meta?.classId || 'default';
        assignmentsQuery = query(collection(db, 'assignments'), where('classId', '==', studentClassId));
      } else {
        assignmentsQuery = query(collection(db, 'assignments'), where('classId', '==', 'NOT_LOGGED_IN'));
      }

      let gradesQuery;
      if (currentUser?.role === 'ADMIN') {
        gradesQuery = query(collection(db, 'grades'), limit(500));
      } else if (currentUser?.role === 'TEACHER') {
        const classIds = currentUser.meta?.classIds || [];
        if (classIds.length > 0) {
          gradesQuery = query(collection(db, 'grades'), where('classId', 'in', classIds));
        } else {
          gradesQuery = query(collection(db, 'grades'), limit(30));
        }
      } else if (currentUser?.role === 'STUDENT') {
        gradesQuery = query(collection(db, 'grades'), where('studentId', '==', currentUser.id));
      } else {
        gradesQuery = query(collection(db, 'grades'), where('studentId', '==', 'NOT_LOGGED_IN'));
      }

      const responses = await Promise.all([
        getDocs(classesQuery),
        getDocs(subjectsQuery),
        getDocs(teachersQuery),
        getDocs(studentsQuery),
        getDocs(materialsQuery),
        getDocs(assignmentsQuery),
        getDocs(gradesQuery),
      ]);
      
      const [clsSnap, subSnap, tchSnap, stdSnap, matSnap, asgSnap, grdSnap] = responses;

      const clsList: Class[] = [];
      clsSnap.forEach(doc => clsList.push({ id: doc.id, ...(doc.data() as any) } as Class));
      setClasses(clsList);
      localStorage.setItem('smp_classes', JSON.stringify(clsList));

      const subList: Subject[] = [];
      subSnap.forEach(doc => subList.push({ id: doc.id, ...(doc.data() as any) } as Subject));
      setSubjects(subList);
      localStorage.setItem('smp_subjects', JSON.stringify(subList));

      const tchList: Teacher[] = [];
      tchSnap.forEach(doc => tchList.push({ id: doc.id, ...(doc.data() as any) } as Teacher));
      setTeachers(tchList);
      localStorage.setItem('smp_teachers', JSON.stringify(tchList));

      const stdList: Student[] = [];
      stdSnap.forEach(doc => stdList.push({ id: doc.id, ...(doc.data() as any) } as Student));
      setStudents(stdList);
      localStorage.setItem('smp_students', JSON.stringify(stdList));

      const matList: Material[] = [];
      matSnap.forEach(doc => matList.push({ id: doc.id, ...(doc.data() as any) } as Material));
      setMaterials(matList);
      localStorage.setItem('smp_materials', JSON.stringify(matList));

      const asgList: Assignment[] = [];
      asgSnap.forEach(doc => asgList.push({ id: doc.id, ...(doc.data() as any) } as Assignment));
      setAssignments(asgList);
      localStorage.setItem('smp_assignments', JSON.stringify(asgList));

      const grdList: Grade[] = [];
      grdSnap.forEach(doc => grdList.push({ id: doc.id, ...(doc.data() as any) } as Grade));
      setGrades(grdList);
      localStorage.setItem('smp_grades', JSON.stringify(grdList));

      const configRes = await getDoc(doc(db, 'adminConfigs', 'config'));
      if (configRes.exists()) {
        const pwd = configRes.data().adminPassword;
        setAdminPassword(pwd || 'admin123');
        localStorage.setItem('smp_admin_pwd', pwd || 'admin123');
      }

      setLastSynced(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (error) {
      console.warn("Manual DB pull synchronization reload failed: ", error);
    } finally {
      setIsSyncing(false);
    }
  };

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
      let teacher = teachers.find(t => t.nik === username);
      if (!teacher && db) {
        try {
          const teacherDoc = await getDoc(doc(db, 'teachers', username));
          if (teacherDoc.exists()) {
            teacher = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
          }
        } catch (err) {
          console.warn("Direct Firestore teacher login fetch failed, trying loaded cache:", err);
        }
      }
      
      if (teacher && teacher.password === password) {
        const classIds = Array.from(new Set(teacher.subjectsTaught?.flatMap((s: any) => s.classIds || []) || []));
        const user: SessionUser = { 
          id: teacher.id, 
          name: teacher.name, 
          role: 'TEACHER', 
          loginAt: Date.now(),
          meta: { nik: teacher.nik, classIds } 
        };
        // Inject teacher record into state list immediately if missing to avoid blank user panels on mount
        const currentTeacherCopy = teacher;
        setTeachers(prev => {
          if (!prev.some(t => t.id === currentTeacherCopy.id)) {
            const updated = [...prev, currentTeacherCopy];
            localStorage.setItem('smp_teachers', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
        setCurrentUser(user);
        localStorage.setItem('smp_current_user', JSON.stringify(user));
        return user;
      }
      throw new Error('NIK atau Password Guru salah.');
    }

    if (role === 'STUDENT') {
      let student = students.find(s => s.nis === username);
      if (!student && db) {
        try {
          const studentDoc = await getDoc(doc(db, 'students', username));
          if (studentDoc.exists()) {
            student = { id: studentDoc.id, ...studentDoc.data() } as Student;
          }
        } catch (err) {
          console.warn("Direct Firestore student login fetch failed, trying loaded cache:", err);
        }
      }

      if (student && student.password === password) {
        const user: SessionUser = { 
          id: student.id, 
          name: student.name, 
          role: 'STUDENT', 
          loginAt: Date.now(),
          meta: { nis: student.nis, classId: student.classId } 
        };
        // Inject student record into state list immediately if missing to avoid blank user panels on mount
        const currentStudentCopy = student;
        setStudents(prev => {
          if (!prev.some(s => s.id === currentStudentCopy.id)) {
            const updated = [...prev, currentStudentCopy];
            localStorage.setItem('smp_students', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
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

  const updateAdminPassword = async (newPassword: string) => {
    setAdminPassword(newPassword);
    localStorage.setItem('smp_admin_pwd', newPassword);

    try {
      await setDoc(doc(db, 'adminConfigs', 'config'), { id: 'config', adminPassword: newPassword }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'adminConfigs/config');
    }
  };

  const updateTeacherPassword = async (nik: string, newPassword: string) => {
    const updated = teachers.map(t => {
      if (t.nik === nik) {
        return { ...t, password: newPassword };
      }
      return t;
    });
    setTeachers(updated);
    localStorage.setItem('smp_teachers', JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'teachers', nik), { password: newPassword }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `teachers/${nik}`);
    }
  };

  const updateStudentPassword = async (nis: string, newPassword: string) => {
    const updated = students.map(s => {
      if (s.nis === nis) {
        return { ...s, password: newPassword };
      }
      return s;
    });
    setStudents(updated);
    localStorage.setItem('smp_students', JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'students', nis), { password: newPassword }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `students/${nis}`);
    }
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

    setDoc(doc(db, 'classes', newClass.id), newClass)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `classes/${newClass.id}`));

    return newClass;
  };

  const editClass = (id: string, name: string) => {
    const updated = classes.map(c => c.id === id ? { ...c, name: name.trim() } : c);
    setClasses(updated);
    localStorage.setItem('smp_classes', JSON.stringify(updated));

    setDoc(doc(db, 'classes', id), { name: name.trim() }, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `classes/${id}`));
  };

  const deleteClass = (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    localStorage.setItem('smp_classes', JSON.stringify(updated));

    deleteDoc(doc(db, 'classes', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `classes/${id}`));
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

    setDoc(doc(db, 'subjects', newSub.id), newSub)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `subjects/${newSub.id}`));

    return newSub;
  };

  const editSubject = (id: string, name: string) => {
    const updated = subjects.map(s => s.id === id ? { ...s, name: name.trim() } : s);
    setSubjects(updated);
    localStorage.setItem('smp_subjects', JSON.stringify(updated));

    setDoc(doc(db, 'subjects', id), { name: name.trim() }, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `subjects/${id}`));
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    localStorage.setItem('smp_subjects', JSON.stringify(updated));

    deleteDoc(doc(db, 'subjects', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `subjects/${id}`));
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

    setDoc(doc(db, 'teachers', newTeacher.id), newTeacher)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `teachers/${newTeacher.id}`));

    return newTeacher;
  };

  const editTeacher = (id: string, name: string, subjectsTaught: any[], password?: string) => {
    const updated = teachers.map(t => {
      if (t.id === id) {
        const pwd = password && password.trim() ? password.trim() : t.password;
        const updatedT = { 
          ...t, 
          name: name.trim(), 
          subjectsTaught,
          password: pwd
        };
        setDoc(doc(db, 'teachers', id), { 
          name: name.trim(), 
          subjectsTaught,
          password: pwd 
        }, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `teachers/${id}`));
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

    deleteDoc(doc(db, 'teachers', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `teachers/${id}`));
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

    setDoc(doc(db, 'students', newStudent.id), newStudent)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `students/${newStudent.id}`));

    return newStudent;
  };

  const editStudent = (id: string, name: string, classId: string, password?: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        const pwd = password && password.trim() ? password.trim() : s.password;
        const updatedS = { 
          ...s, 
          name: name.trim(), 
          classId,
          password: pwd
        };
        setDoc(doc(db, 'students', id), { 
          name: name.trim(), 
          classId,
          password: pwd 
        }, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `students/${id}`));
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

    deleteDoc(doc(db, 'students', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `students/${id}`));
  };

  // Bulk Import
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
      
      let matchedClass = classList.find(c => c.id.toLowerCase() === normalized);
      if (matchedClass) return matchedClass.id;

      matchedClass = classList.find(c => c.name.toLowerCase() === normalized);
      if (matchedClass) return matchedClass.id;

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

      try {
        const batch = writeBatch(db);
        newClassesToCreate.forEach(cls => {
          batch.set(doc(db, 'classes', cls.id), cls);
        });
        newStudentsToCreate.forEach(std => {
          batch.set(doc(db, 'students', std.id), std);
        });
        await batch.commit();
      } catch (err) {
        console.error("Firestore batch commit failed, performing sequential writes:", err);
        for (const cls of newClassesToCreate) {
          await setDoc(doc(db, 'classes', cls.id), cls).catch(e => console.error(e));
        }
        for (const std of newStudentsToCreate) {
          await setDoc(doc(db, 'students', std.id), std).catch(e => console.error(e));
        }
      }
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

    setDoc(doc(db, 'materials', newMat.id), newMat)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `materials/${newMat.id}`));

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
        setDoc(doc(db, 'materials', id), { 
          title: title.trim(), 
          description: description.trim(), 
          link: link.trim(), 
          classId, 
          subjectId 
        }, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `materials/${id}`));
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

    deleteDoc(doc(db, 'materials', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `materials/${id}`));
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

    setDoc(doc(db, 'assignments', newAsg.id), newAsg)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `assignments/${newAsg.id}`));

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
        setDoc(doc(db, 'assignments', id), { 
          title: title.trim(), 
          description: description.trim(), 
          dueDate, 
          link: link.trim(), 
          classId, 
          subjectId,
          formEnabled,
          previewEnabled: previewEnabled ?? true
        }, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `assignments/${id}`));
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
    
    const updatedGrades = grades.filter(g => g.assignmentId !== id);
    setGrades(updatedGrades);

    localStorage.setItem('smp_assignments', JSON.stringify(updated));
    localStorage.setItem('smp_grades', JSON.stringify(updatedGrades));

    deleteDoc(doc(db, 'assignments', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `assignments/${id}`));

    const gradesToDelete = grades.filter(g => g.assignmentId === id);
    gradesToDelete.forEach(g => {
      deleteDoc(doc(db, 'grades', g.id))
        .catch(err => console.error("Error deleting grade item in Firestore:", err));
    });
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

    setDoc(doc(db, 'grades', submittedGrade.id), submittedGrade, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `grades/${submittedGrade.id}`));

    return submittedGrade;
  };

  // Teacher Action: Grading & feedback
  const gradeAssignment = (gradeId: string, gradeValue: number, feedback: string) => {
    const updated = grades.map(g => {
      if (g.id === gradeId) {
        const gradedAtTime = new Date().toISOString();
        const updatedG = {
          ...g,
          grade: gradeValue,
          feedback: feedback.trim(),
          status: 'GRADED' as const,
          gradedAt: gradedAtTime
        };
        setDoc(doc(db, 'grades', gradeId), {
          grade: gradeValue,
          feedback: feedback.trim(),
          status: 'GRADED',
          gradedAt: gradedAtTime
        }, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `grades/${gradeId}`));
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
        setDoc(doc(db, 'grades', gradeId), {
          grade: null,
          feedback: null,
          submissionLink: null,
          status: 'RESET',
          submittedAt: null,
          gradedAt: null
        }, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `grades/${gradeId}`));
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
      isSyncing,
      lastSynced,
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
      resetAssignmentValue,
      refreshData
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
