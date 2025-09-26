// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listCourses, listTeachersForCourse, Course } from "@/lib/classroom";
import { CourseList } from "@/components/dashboard/course-list"; // <-- Importa el nuevo componente
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CourseWithTeachers = Course & { teachers: { fullName: string }[] };

export default async function DashboardPage() {
  const session = await auth();

  // 1. Proteger la ruta por sesión
  if (!session?.user) {
    redirect("/");
  }

  // 2. Proteger la ruta por ROL
  if (session.user.role !== 'coordinator') {
    redirect("/me"); // <-- Cambiar a "/me"
  }

  let coursesWithTeachers: CourseWithTeachers[] = [];
  let error: string | null = null;
  
  try {
    const courses = await listCourses();
    coursesWithTeachers = await Promise.all(
      courses.map(async (course) => {
        const teachers = await listTeachersForCourse(course.id);
        return { ...course, teachers: teachers.map(t => ({ fullName: t.profile.name.fullName })) };
      })
    );
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard del Coordinador
        </h1>
        <p className="text-muted-foreground">
          Selecciona un curso para ver el detalle de alumnos y tareas.
        </p>
      </div>

      {error ? (
         <Card className="bg-destructive/10 border-destructive">
          <CardHeader><CardTitle>Error al cargar los cursos</CardTitle><CardDescription>{error}</CardDescription></CardHeader>
        </Card>
      ) : (
        <CourseList courses={coursesWithTeachers} /> // <-- Usa el nuevo componente aquí
      )}
    </div>
  );
}