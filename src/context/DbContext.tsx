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
  UserRole
} from '../types';
import { 
  INITIAL_CLASSES, 
  INITIAL_SUBJECTS, 
  INITIAL_TEACHERS, 
  INITIAL_STUDENTS, 
  INITIAL_MATERIALS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_GRADES 
} from '../data/mockData';
import { db, isFirebaseConfigured } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  // Do not crash the UI, we throw error so caller can display it nice
  throw new Error(JSON.stringify(errInfo));
}

const logFirestoreSyncError = (message: string, error: unknown) => {
  const errStr = error instanceof Error ? error.message : String(error);
  if (errStr.includes("offline") || errStr.includes("Failed to get document") || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    console.warn(`${message} (Using offline-first cached database configuration): ${errStr}`);
  } else {
    console.error(`${message}: ${errStr}`);
  }
};

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

  // Helper to remove any 'undefined' property values recursively before writing to Firestore
  const sanitizeFirestoreData = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map(sanitizeFirestoreData);
    }
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined) {
          res[key] = sanitizeFirestoreData(obj[key]);
        }
      }
      return res;
    }
    return obj;
  };

  // Initial Load from LocalStorage & Firestore Sync
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    const initAndSync = async () => {
      setIsLoading(true);
      try {
        const storedClasses = localStorage.getItem('smp_classes');
        const storedSubjects = localStorage.getItem('smp_subjects');
        const storedTeachers = localStorage.getItem('smp_teachers');
        const storedStudents = localStorage.getItem('smp_students');
        const storedMaterials = localStorage.getItem('smp_materials');
        const storedAssignments = localStorage.getItem('smp_assignments');
        const storedGrades = localStorage.getItem('smp_grades');
        const storedAdminPassword = localStorage.getItem('smp_admin_pwd');
        const storedUser = localStorage.getItem('smp_current_user');

        let loadedClasses = storedClasses ? JSON.parse(storedClasses) : INITIAL_CLASSES;
        let loadedSubjects = storedSubjects ? JSON.parse(storedSubjects) : INITIAL_SUBJECTS;
        let loadedTeachers = storedTeachers ? JSON.parse(storedTeachers) : INITIAL_TEACHERS;
        let loadedStudents = storedStudents ? JSON.parse(storedStudents) : INITIAL_STUDENTS;
        let loadedMaterials = storedMaterials ? JSON.parse(storedMaterials) : INITIAL_MATERIALS;
        let loadedAssignments = storedAssignments ? JSON.parse(storedAssignments) : INITIAL_ASSIGNMENTS;
        let loadedGrades = storedGrades ? JSON.parse(storedGrades) : INITIAL_GRADES;
        let loadedAdminPassword = storedAdminPassword || 'admin123';

        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }

        // Apply offline state first for immediate UI response
        setClasses(loadedClasses);
        setSubjects(loadedSubjects);
        setTeachers(loadedTeachers);
        setStudents(loadedStudents);
        setMaterials(loadedMaterials);
        setAssignments(loadedAssignments);
        setGrades(loadedGrades);
        setAdminPassword(loadedAdminPassword);
        setIsLoading(false); // Unblock the UI instantly so the main page displays immediately without waiting for database requests

        // Fetch data from Firestore to override if configured
        if (isFirebaseConfigured && db) {
          console.log("Initializing real-time Firestore listeners for active synchronization...");

          const listenClasses = () => {
            let isFirstRun = true;
            const unsub = onSnapshot(collection(db, 'classes'), async (snapshot) => {
              if (!snapshot.empty) {
                const fsClasses: Class[] = [];
                snapshot.forEach(docSnap => {
                  const d = docSnap.data();
                  fsClasses.push({
                    id: docSnap.id,
                    name: d.name || ''
                  });
                });
                loadedClasses = fsClasses;
                setClasses(fsClasses);
                localStorage.setItem('smp_classes', JSON.stringify(fsClasses));
              } else {
                loadedClasses = [];
                setClasses([]);
                localStorage.setItem('smp_classes', JSON.stringify([]));
              }
              isFirstRun = false;
            }, (err) => {
              logFirestoreSyncError("Failed to listen list of classes from Firestore", err);
            });
            unsubscribes.push(unsub);
          };

          const listenSubjects = () => {
            let isFirstRun = true;
            const unsub = onSnapshot(collection(db, 'subjects'), async (snapshot) => {
              if (!snapshot.empty) {
                const fsSubjects: Subject[] = [];
                snapshot.forEach(docSnap => {
                  const d = docSnap.data();
                  fsSubjects.push({
                    id: docSnap.id,
                    name: d.name || ''
                  });
                });
                loadedSubjects = fsSubjects;
                setSubjects(fsSubjects);
                localStorage.setItem('smp_subjects', JSON.stringify(fsSubjects));
              } else {
                loadedSubjects = [];
                setSubjects([]);
                localStorage.setItem('smp_subjects', JSON.stringify([]));
              }
              isFirstRun = false;
            }, (err) => {
              logFirestoreSyncError("Failed to listen list of subjects from Firestore", err);
            });
            unsubscribes.push(unsub);
          };

          const listenTeachers = () => {
            let isFirstRun = true;
            const unsub = onSnapshot(collection(db, 'teachers'), async (snapshot) => {
              if (!snapshot.empty) {
                const fsTeachers: Teacher[] = [];
                snapshot.forEach(docSnap => {
                  const d = docSnap.data();
                  fsTeachers.push({
                    id: docSnap.id,
                    nik: d.nik || docSnap.id,
                    name: d.name || '',
                    password: d.password || d.nik || docSnap.id,
                    subjectsTaught: d.subjectsTaught || []
                  });
                });
                loadedTeachers = fsTeachers;
                setTeachers(fsTeachers);
                localStorage.setItem('smp_teachers', JSON.stringify(fsTeachers));

                // Sync current teacher user if details updated
                if (storedUser) {
                  const sUser = JSON.parse(storedUser);
                  if (sUser.role === 'TEACHER') {
                    const currentTeacher = fsTeachers.find(t => t.id === sUser.id);
                    if (currentTeacher) {
                      const updatedUser: SessionUser = {
                        ...sUser,
                        name: currentTeacher.name,
                        meta: { ...sUser.meta, nik: currentTeacher.nik }
                      };
                      setCurrentUser(updatedUser);
                      localStorage.setItem('smp_current_user', JSON.stringify(updatedUser));
                    }
                  }
                }
              } else {
                if (isFirstRun) {
                  console.log("Firestore 'teachers' collection is empty. Seeding...");
                  for (const tc of loadedTeachers) {
                    await setDoc(doc(db, 'teachers', tc.id), sanitizeFirestoreData(tc));
                  }
                } else {
                  loadedTeachers = [];
                  setTeachers([]);
                  localStorage.setItem('smp_teachers', JSON.stringify([]));
                }
              }
              isFirstRun = false;
            }, (err) => {
              logFirestoreSyncError("Failed to listen list of teachers from Firestore", err);
            });
            unsubscribes.push(unsub);
          };

          const listenStudents = () => {
            let isFirstRun = true;
            const unsub = onSnapshot(collection(db, 'students'), async (snapshot) => {
              if (!snapshot.empty) {
                const fsStudents: Student[] = [];
                snapshot.forEach(docSnap => {
                  const d = docSnap.data();
                  fsStudents.push({
                    id: docSnap.id,
                    nis: d.nis || docSnap.id,
                    name: d.name || '',
                    classId: d.classId || '',
                    password: d.password || d.nis || docSnap.id
                  });
                });
                loadedStudents = fsStudents;
                setStudents(fsStudents);
                localStorage.setItem('smp_students', JSON.stringify(fsStudents));

                // Sync current student user if details updated
                if (storedUser) {
                  const sUser = JSON.parse(storedUser);
                  if (sUser.role === 'STUDENT') {
                    const currentStudent = fsStudents.find(s => s.id === sUser.id);
                    if (currentStudent) {
                      const updatedUser: SessionUser = {
                        ...sUser,
                        name: currentStudent.name,
                        meta: { ...sUser.meta, nis: currentStudent.nis, classId: currentStudent.classId }
                      };
                      setCurrentUser(updatedUser);
                      localStorage.setItem('smp_current_user', JSON.stringify(updatedUser));
                    }
                  }
                }
              } else {
                if (isFirstRun) {
                  console.log("Firestore 'students' collection is empty. Seeding...");
                  for (const st of loadedStudents) {
                    await setDoc(doc(db, 'students', st.id), sanitizeFirestoreData(st));
                  }
                } else {
                  loadedStudents = [];
                  setStudents([]);
                  localStorage.setItem('smp_students', JSON.stringify([]));
                }
              }
              isFirstRun = false;
            }, (err) => {
              logFirestoreSyncError("Failed to listen list of students from Firestore", err);
            });
            unsubscribes.push(unsub);
          };

          const listenMaterials = () => {
            let isFirstRun = true;
            const unsub = onSnapshot(collection(db, 'materials'), async (snapshot) => {
              if (!snapshot.empty) {
                const fsMaterials: Material[] = [];
                snapshot.forEach(docSnap => {
                  const d = docSnap.data();
                  fsMaterials.push({
                    id: docSnap.id,
                    title: d.title || '',
                    description: d.description || '',
                    link: d.link || '',
                    classId: d.classId || '',
                    subjectId: d.subjectId || '',
                    teacherId: d.teacherId || '',
                    createdAt: d.createdAt || ''
                  });
                });
                setMaterials(fsMaterials);
                localStorage.setItem('smp_materials', JSON.stringify(fsMaterials));
              } else {
                setMaterials([]);
                localStorage.setItem('smp_materials', JSON.stringify([]));
              }
              isFirstRun = false;
            }, (err) => {
              logFirestoreSyncError("Failed to listen list of materials from Firestore", err);
            });
            unsubscribes.push(unsub);
          };

          const listenAssignments = () => {
            let isFirstRun = true;
            const unsub = onSnapshot(collection(db, 'assignments'), async (snapshot) => {
              if (!snapshot.empty) {
                const fsAssignments: Assignment[] = [];
                snapshot.forEach(docSnap => {
                  const d = docSnap.data();
                  fsAssignments.push({
                    id: docSnap.id,
                    title: d.title || '',
                    description: d.description || '',
                    dueDate: d.dueDate || '',
                    link: d.link || '',
                    classId: d.classId || '',
                    subjectId: d.subjectId || '',
                    teacherId: d.teacherId || '',
                    formEnabled: d.formEnabled !== undefined ? d.formEnabled : true,
                    previewEnabled: d.previewEnabled !== undefined ? d.previewEnabled : true,
                    createdAt: d.createdAt || ''
                  });
                });
                setAssignments(fsAssignments);
                localStorage.setItem('smp_assignments', JSON.stringify(fsAssignments));
              } else {
                setAssignments([]);
                localStorage.setItem('smp_assignments', JSON.stringify([]));
              }
              isFirstRun = false;
            }, (err) => {
              logFirestoreSyncError("Failed to listen list of assignments from Firestore", err);
            });
            unsubscribes.push(unsub);
          };

          const listenGrades = () => {
            let isFirstRun = true;
            const unsub = onSnapshot(collection(db, 'grades'), async (snapshot) => {
              if (!snapshot.empty) {
                const fsGrades: Grade[] = [];
                snapshot.forEach(docSnap => {
                  const d = docSnap.data();
                  fsGrades.push({
                    id: docSnap.id,
                    studentId: d.studentId || '',
                    assignmentId: d.assignmentId || '',
                    submissionLink: d.submissionLink || '',
                    subjectId: d.subjectId || '',
                    classId: d.classId || '',
                    status: d.status || 'SUBMITTED',
                    grade: d.grade,
                    feedback: d.feedback,
                    submittedAt: d.submittedAt || '',
                    gradedAt: d.gradedAt
                  });
                });
                setGrades(fsGrades);
                localStorage.setItem('smp_grades', JSON.stringify(fsGrades));
              } else {
                setGrades([]);
                localStorage.setItem('smp_grades', JSON.stringify([]));
              }
              isFirstRun = false;
            }, (err) => {
              logFirestoreSyncError("Failed to listen list of grades from Firestore", err);
            });
            unsubscribes.push(unsub);
          };

          const listenAdminConfig = () => {
            let isFirstRun = true;
            const unsub = onSnapshot(doc(db, 'adminConfigs', 'config'), async (docSnap) => {
              if (docSnap.exists()) {
                const adminPwdVal = docSnap.data().adminPassword;
                if (adminPwdVal) {
                  setAdminPassword(adminPwdVal);
                  localStorage.setItem('smp_admin_pwd', adminPwdVal);
                }
              } else if (isFirstRun) {
                console.log("Admin config is empty in Firestore. Seeding defaults...");
                await setDoc(doc(db, 'adminConfigs', 'config'), { adminPassword: loadedAdminPassword });
              }
              isFirstRun = false;
            }, (err) => {
              logFirestoreSyncError("Failed to listen admin config config from Firestore", err);
            });
            unsubscribes.push(unsub);
          };

          listenClasses();
          listenSubjects();
          listenTeachers();
          listenStudents();
          listenMaterials();
          listenAssignments();
          listenGrades();
          listenAdminConfig();
        }
      } catch (e) {
        logFirestoreSyncError("General error synchronizing Firestore", e);
      } finally {
        setIsLoading(false);
      }
    };

    initAndSync();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Sync state functions helper
  const syncState = (
    key: string, 
    data: any, 
    firebaseCollection?: string, 
    docId?: string
  ) => {
    localStorage.setItem(key, JSON.stringify(data));
    
    // Sync to Firestore if configured
    if (isFirebaseConfigured && db && firebaseCollection && docId) {
      try {
        const docRef = doc(db, firebaseCollection, docId);
        
        let docData = data;
        if (Array.isArray(data)) {
          // Find the specific item matching docId in the collection array
          const item = data.find((x: any) => x && (x.id === docId || x.nis === docId || x.nik === docId));
          if (item) {
            docData = { ...item };
          } else {
            console.warn(`Could not find item with ID ${docId} in array for collection ${firebaseCollection}`);
            return;
          }
        }

        setDoc(docRef, sanitizeFirestoreData(docData))
          .catch(err => {
            console.warn(`Firestore sync failed for ${firebaseCollection}/${docId}: `, err);
            const errInfo = {
              error: err instanceof Error ? err.message : String(err),
              operationType: OperationType.WRITE,
              path: `${firebaseCollection}/${docId}`
            };
            console.error('Firestore Sync Background Error: ', JSON.stringify(errInfo));
          });
      } catch (err) {
        console.error(`Synchronous Firestore path/payload error for ${firebaseCollection}/${docId}: `, err);
      }
    }
  };

  // Auth Operations
  const login = async (username: string, password: string, role: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    if (role === 'ADMIN') {
      if (username.toLowerCase() === 'admin') {
        // Quick local check first
        if (password === adminPassword) {
          const user: SessionUser = { id: 'admin', name: 'Administrator', role: 'ADMIN' };
          setCurrentUser(user);
          localStorage.setItem('smp_current_user', JSON.stringify(user));
          return user;
        }

        // Fallback: Check direct from Firestore in real-time
        if (isFirebaseConfigured && db) {
          try {
            console.log("Locally cached admin password check failed, fetching live admin config from Firestore...");
            const configSnap = await getDoc(doc(db, 'adminConfigs', 'config'));
            if (configSnap.exists()) {
              const livePassword = configSnap.data().adminPassword;
              if (livePassword && password === livePassword) {
                // Synchronize local cache and state instantly
                setAdminPassword(livePassword);
                localStorage.setItem('smp_admin_pwd', livePassword);

                const user: SessionUser = { id: 'admin', name: 'Administrator', role: 'ADMIN' };
                setCurrentUser(user);
                localStorage.setItem('smp_current_user', JSON.stringify(user));
                return user;
              }
            }
          } catch (err) {
            logFirestoreSyncError("Real-time admin config fallback check failed", err);
          }
        }
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

      // Fallback: Check teachers in Firestore
      if (isFirebaseConfigured && db) {
        try {
          console.log("Cached teacher credential check failed, fetching live teacher list from Firestore...");
          const teachersSnap = await getDocs(collection(db, 'teachers'));
          if (!teachersSnap.empty) {
            const fsTeachers: Teacher[] = [];
            teachersSnap.forEach(docSnap => {
              const d = docSnap.data();
              fsTeachers.push({
                id: docSnap.id,
                nik: d.nik || docSnap.id,
                name: d.name || '',
                password: d.password || d.nik || docSnap.id,
                subjectsTaught: d.subjectsTaught || []
              });
            });
            // Update state and local storage
            setTeachers(fsTeachers);
            localStorage.setItem('smp_teachers', JSON.stringify(fsTeachers));

            const liveTeacher = fsTeachers.find(t => t.nik === username);
            if (liveTeacher && liveTeacher.password === password) {
              const user: SessionUser = { id: liveTeacher.id, name: liveTeacher.name, role: 'TEACHER', meta: { nik: liveTeacher.nik } };
              setCurrentUser(user);
              localStorage.setItem('smp_current_user', JSON.stringify(user));
              return user;
            }
          }
        } catch (err) {
          logFirestoreSyncError("Real-time teacher login lookup failed", err);
        }
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

      // Fallback: Check students in Firestore
      if (isFirebaseConfigured && db) {
        try {
          console.log("Cached student credential check failed, fetching live student list from Firestore...");
          const studentsSnap = await getDocs(collection(db, 'students'));
          if (!studentsSnap.empty) {
            const fsStudents: Student[] = [];
            studentsSnap.forEach(docSnap => {
              const d = docSnap.data();
              fsStudents.push({
                id: docSnap.id,
                nis: d.nis || docSnap.id,
                name: d.name || '',
                classId: d.classId || '',
                password: d.password || d.nis || docSnap.id
              });
            });
            // Update state and local storage
            setStudents(fsStudents);
            localStorage.setItem('smp_students', JSON.stringify(fsStudents));

            const liveStudent = fsStudents.find(s => s.nis === username);
            if (liveStudent && liveStudent.password === password) {
              const user: SessionUser = { id: liveStudent.id, name: liveStudent.name, role: 'STUDENT', meta: { nis: liveStudent.nis, classId: liveStudent.classId } };
              setCurrentUser(user);
              localStorage.setItem('smp_current_user', JSON.stringify(user));
              return user;
            }
          }
        } catch (err) {
          logFirestoreSyncError("Real-time student login lookup failed", err);
        }
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
    
    // Full backup trigger
    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'adminConfigs', 'config'), { adminPassword: newPassword })
          .catch(err => {
            console.warn("Firestore sync failed for adminConfigs/config: ", err);
          });
      } catch (err) {
        console.error("Synchronous Firestore error for adminConfigs/config: ", err);
      }
    }
  };

  const updateTeacherPassword = (nik: string, newPassword: string) => {
    const updated = teachers.map(t => {
      if (t.nik === nik) {
        return { ...t, password: newPassword };
      }
      return t;
    });
    setTeachers(updated);
    syncState('smp_teachers', updated, 'teachers', nik);
  };

  const updateStudentPassword = (nis: string, newPassword: string) => {
    const updated = students.map(s => {
      if (s.nis === nis) {
        return { ...s, password: newPassword };
      }
      return s;
    });
    setStudents(updated);
    syncState('smp_students', updated, 'students', nis);
  };

  // Manage Classes
  const addClass = (name: string) => {
    const newClass: Class = {
      id: name.trim().toUpperCase().replace(/\s+/g, '_'),
      name: name.trim()
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    syncState('smp_classes', updated, 'classes', newClass.id);
    return newClass;
  };

  const editClass = (id: string, name: string) => {
    const updated = classes.map(c => c.id === id ? { ...c, name: name.trim() } : c);
    setClasses(updated);
    syncState('smp_classes', updated, 'classes', id);
  };

  const deleteClass = (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    localStorage.setItem('smp_classes', JSON.stringify(updated));
    if (isFirebaseConfigured && db) {
      try {
        deleteDoc(doc(db, 'classes', id))
          .catch(err => console.warn(`Firestore delete failed for classes/${id}: `, err));
      } catch (err) {
        console.error(`Synchronous Firestore delete error for classes/${id}: `, err);
      }
    }
  };

  // Manage Subjects
  const addSubject = (name: string) => {
    const newSub: Subject = {
      id: "MAPEL_" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: name.trim()
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    syncState('smp_subjects', updated, 'subjects', newSub.id);
    return newSub;
  };

  const editSubject = (id: string, name: string) => {
    const updated = subjects.map(s => s.id === id ? { ...s, name: name.trim() } : s);
    setSubjects(updated);
    syncState('smp_subjects', updated, 'subjects', id);
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    localStorage.setItem('smp_subjects', JSON.stringify(updated));
    if (isFirebaseConfigured && db) {
      try {
        deleteDoc(doc(db, 'subjects', id))
          .catch(err => console.warn(`Firestore delete failed for subjects/${id}: `, err));
      } catch (err) {
        console.error(`Synchronous Firestore delete error for subjects/${id}: `, err);
      }
    }
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
    syncState('smp_teachers', updated, 'teachers', newTeacher.id);
    return newTeacher;
  };

  const editTeacher = (id: string, name: string, subjectsTaught: any[], password?: string) => {
    const updated = teachers.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          name: name.trim(), 
          subjectsTaught,
          password: password && password.trim() ? password.trim() : t.password
        };
      }
      return t;
    });
    setTeachers(updated);
    syncState('smp_teachers', updated, 'teachers', id);
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    localStorage.setItem('smp_teachers', JSON.stringify(updated));
    if (isFirebaseConfigured && db) {
      try {
        deleteDoc(doc(db, 'teachers', id))
          .catch(err => console.warn(`Firestore delete failed for teachers/${id}: `, err));
      } catch (err) {
        console.error(`Synchronous Firestore delete error for teachers/${id}: `, err);
      }
    }
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
    syncState('smp_students', updated, 'students', newStudent.id);
    return newStudent;
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

    if (newClassesToCreate.length > 0) {
      setClasses(currentClasses);
      localStorage.setItem('smp_classes', JSON.stringify(currentClasses));
      
      // Sync setiap kelas baru ke Firestore
      if (isFirebaseConfigured && db) {
        await Promise.all(
          newClassesToCreate.map(async (cls) => {
            const docRef = doc(db, 'classes', cls.id);
            await setDoc(docRef, cls, { merge: true }).catch(err => {
              console.warn(`Firestore sync failed for classes/${cls.id}: `, err);
            });
          })
        );
      }
    }

    if (newStudentsToCreate.length > 0) {
      setStudents(currentStudents);
      localStorage.setItem('smp_students', JSON.stringify(currentStudents));
      
      // Sync setiap siswa baru ke Firestore
      if (isFirebaseConfigured && db) {
        await Promise.all(
          newStudentsToCreate.map(async (std) => {
            const docRef = doc(db, 'students', std.id);
            await setDoc(docRef, std, { merge: true }).catch(err => {
              console.warn(`Firestore sync failed for students/${std.id}: `, err);
            });
          })
        );
      }
    }

    return {
      addedStudents: newStudentsToCreate.length,
      addedClasses: newClassesToCreate.length
    };
  };

  const editStudent = (id: string, name: string, classId: string, password?: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          name: name.trim(), 
          classId,
          password: password && password.trim() ? password.trim() : s.password
        };
      }
      return s;
    });
    setStudents(updated);
    syncState('smp_students', updated, 'students', id);
  };

  const deleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem('smp_students', JSON.stringify(updated));
    if (isFirebaseConfigured && db) {
      try {
        deleteDoc(doc(db, 'students', id))
          .catch(err => console.warn(`Firestore delete failed for students/${id}: `, err));
      } catch (err) {
        console.error(`Synchronous Firestore delete error for students/${id}: `, err);
      }
    }
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
    syncState('smp_materials', updated, 'materials', newMat.id);
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
        return { 
          ...m, 
          title: title.trim(), 
          description: description.trim(), 
          link: link.trim(), 
          classId, 
          subjectId 
        };
      }
      return m;
    });
    setMaterials(updated);
    syncState('smp_materials', updated, 'materials', id);
  };

  const deleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    localStorage.setItem('smp_materials', JSON.stringify(updated));
    if (isFirebaseConfigured && db) {
      try {
        deleteDoc(doc(db, 'materials', id))
          .catch(err => console.warn(`Firestore delete failed for materials/${id}: `, err));
      } catch (err) {
        console.error(`Synchronous Firestore delete error for materials/${id}: `, err);
      }
    }
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
    syncState('smp_assignments', updated, 'assignments', newAsg.id);
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
        return { 
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
      }
      return a;
    });
    setAssignments(updated);
    syncState('smp_assignments', updated, 'assignments', id);
  };

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    
    // Also remove respective grades for cleaner DB
    const gradesToDelete = grades.filter(g => g.assignmentId === id);
    const updatedGrades = grades.filter(g => g.assignmentId !== id);
    setGrades(updatedGrades);

    localStorage.setItem('smp_assignments', JSON.stringify(updated));
    localStorage.setItem('smp_grades', JSON.stringify(updatedGrades));

    if (isFirebaseConfigured && db) {
      try {
        deleteDoc(doc(db, 'assignments', id))
          .catch(err => console.warn(`Firestore delete failed for assignments/${id}: `, err));
        
        // Delete all matching grades from Firestore too
        for (const gd of gradesToDelete) {
          deleteDoc(doc(db, 'grades', gd.id))
            .catch(err => console.warn(`Firestore delete failed for grades/${gd.id}: `, err));
        }
      } catch (err) {
        console.error(`Synchronous Firestore delete error for assignments/grades: `, err);
      }
    }
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
      grade: undefined,
      feedback: undefined,
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
    syncState('smp_grades', updated, 'grades', submittedGrade.id);
    return submittedGrade;
  };

  // Teacher Action: Grading & feedback
  const gradeAssignment = (gradeId: string, gradeValue: number, feedback: string) => {
    const updated = grades.map(g => {
      if (g.id === gradeId) {
        return {
          ...g,
          grade: gradeValue,
          feedback: feedback.trim(),
          status: 'GRADED' as const,
          gradedAt: new Date().toISOString()
        };
      }
      return g;
    });
    setGrades(updated);
    syncState('smp_grades', updated, 'grades', gradeId);
  };

  // Teacher Action: Reset grade so student can submit / do again
  const resetAssignmentValue = (gradeId: string) => {
    const updated = grades.map(g => {
      if (g.id === gradeId) {
        return {
          ...g,
          grade: undefined,
          feedback: undefined,
          submissionLink: undefined,
          status: 'RESET' as const,
          submittedAt: undefined,
          gradedAt: undefined
        };
      }
      return g;
    });
    setGrades(updated);
    syncState('smp_grades', updated, 'grades', gradeId);
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
