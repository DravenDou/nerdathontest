// src/app/me/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listCoursesAsTeacher, listCoursesAsStudent, Course } from "@/lib/classroom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Un componente reutilizable para mostrar una lista de cursos
function CoursesSection({ title, courses }: { title: string; courses: Course[] }) {
  if (courses.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/dashboard/course/${course.id}`}>
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="truncate">{course.name}</CardTitle>
                <CardDescription>{course.section || "Sin sección"}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function MyDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  try {
    const [teachingCourses, enrolledCourses] = await Promise.all([
      listCoursesAsTeacher(),
      listCoursesAsStudent(),
    ]);

    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Mi Dashboard
          </h1>
          <p className="text-muted-foreground">
            Bienvenido, {session.user.name}. Aquí están tus cursos.
          </p>
        </div>
        
        <CoursesSection title="Cursos que imparto" courses={teachingCourses} />
        <CoursesSection title="Cursos en los que estoy inscrito" courses={enrolledCourses} />

        {teachingCourses.length === 0 && enrolledCourses.length === 0 && (
          <p>No estás inscrito en ningún curso como profesor o alumno.</p>
        )}

      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-destructive">Error al cargar tus cursos.</p>
      </div>
    );
  }
}