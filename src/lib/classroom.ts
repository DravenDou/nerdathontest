// src/lib/classroom.ts
import { auth } from "./auth";

// Definimos un tipo para la estructura de un curso
export interface Course {
  id: string;
  name: string;
  section: string;
  descriptionHeading: string;
  room: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode: string;
  courseState: "ACTIVE" | "ARCHIVED" | "PROVISIONED" | "DECLINED" | "SUSPENDED";
  alternateLink: string;
}

// Respuesta de la API para la lista de cursos
interface ListCoursesResponse {
  courses: Course[];
}

export async function listCourses(): Promise<Course[]> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("No autenticado");
  }

  const url = "https://classroom.googleapis.com/v1/courses";
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error fetching courses:", error);
    throw new Error("No se pudieron obtener los cursos de Google Classroom.");
  }

  const data = (await response.json()) as ListCoursesResponse;
  return data.courses || [];
}

// --- NUEVOS TIPOS ---
export interface Student {
  courseId: string;
  userId: string;
  profile: {
    name: {
      fullName: string;
      givenName?: string;
      familyName?: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

interface ListStudentsResponse {
  students: Student[];
}
// --- FIN DE NUEVOS TIPOS ---

// --- NUEVAS FUNCIONES ---

export async function getCourse(courseId: string): Promise<Course> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No autenticado");

  const url = `https://classroom.googleapis.com/v1/courses/${courseId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la información del curso.");
  }
  return response.json();
}

export async function listStudentsForCourse(
  courseId: string
): Promise<Student[]> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No autenticado");

  const url = `https://classroom.googleapis.com/v1/courses/${courseId}/students`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los alumnos del curso.");
  }

  const data = (await response.json()) as ListStudentsResponse;
  return data.students || [];
}

// --- NUEVOS TIPOS PARA TAREAS ---
export interface CourseWork {
  id: string;
  title: string;
  description?: string;
  state: "PUBLISHED" | "DRAFT" | "DELETED";
  creationTime: string;
  updateTime?: string;
  maxPoints?: number;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
}

interface ListCourseWorkResponse {
  courseWork: CourseWork[];
}
// --- FIN DE NUEVOS TIPOS ---

// --- NUEVA FUNCIÓN PARA TAREAS ---
export async function listCourseWork(courseId: string): Promise<CourseWork[]> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No autenticado");

  const url = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?orderBy=dueDate asc`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener las tareas del curso.");
  }

  const data = (await response.json()) as ListCourseWorkResponse;
  return data.courseWork || [];
}

// --- NUEVOS TIPOS PARA ENTREGAS ---
export interface StudentSubmission {
  id: string;
  userId: string;
  state: "NEW" | "CREATED" | "TURNED_IN" | "RETURNED" | "RECLAIMED_BY_STUDENT";
  late?: boolean;
  assignedGrade?: number;
  updateTime?: string;
  creationTime?: string;
}

interface ListSubmissionsResponse {
  studentSubmissions: StudentSubmission[];
}
// --- FIN DE NUEVOS TIPOS ---

// --- NUEVAS FUNCIONES PARA ENTREGAS ---

export async function getCourseWorkDetails(
  courseId: string,
  courseWorkId: string
): Promise<CourseWork> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No autenticado");

  const url = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el detalle de la tarea.");
  }
  return response.json();
}

export async function listSubmissionsForCourseWork(
  courseId: string,
  courseWorkId: string
): Promise<StudentSubmission[]> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No autenticado");

  const url = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener las entregas de los alumnos.");
  }

  const data = (await response.json()) as ListSubmissionsResponse;
  return data.studentSubmissions || [];
}

// --- NUEVOS TIPOS PARA PROFESORES ---
export interface Teacher {
  userId: string;
  profile: {
    name: {
      fullName: string;
    };
    emailAddress: string;
  };
}

interface ListTeachersResponse {
  teachers: Teacher[];
}
// --- FIN DE NUEVOS TIPOS ---

// --- NUEVA FUNCIÓN PARA PROFESORES ---
export async function listTeachersForCourse(
  courseId: string
): Promise<Teacher[]> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No autenticado");

  const url = `https://classroom.googleapis.com/v1/courses/${courseId}/teachers`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!response.ok) {
    console.error(`Error fetching teachers for course ${courseId}`);
    // Devuelve un array vacío en caso de error para no bloquear la carga de otros cursos
    return [];
  }

  const data = (await response.json()) as ListTeachersResponse;
  return data.teachers || [];
}

// --- AÑADE ESTAS DOS NUEVAS FUNCIONES ---

// Obtiene los cursos donde el usuario autenticado es profesor
export async function listCoursesAsTeacher(): Promise<Course[]> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No autenticado");

  // Usamos 'me' como un alias para el ID del usuario autenticado
  const url = `https://classroom.googleapis.com/v1/courses?teacherId=me&courseStates=ACTIVE`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los cursos impartidos.");
  }

  const data = (await response.json()) as ListCoursesResponse; // Reutilizamos el tipo existente
  return data.courses || [];
}

// Obtiene los cursos donde el usuario autenticado es alumno
export async function listCoursesAsStudent(): Promise<Course[]> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No autenticado");

  const url = `https://classroom.googleapis.com/v1/courses?studentId=me&courseStates=ACTIVE`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      "No se pudieron obtener los cursos en los que está inscrito."
    );
  }

  const data = (await response.json()) as ListCoursesResponse;
  return data.courses || [];
}
