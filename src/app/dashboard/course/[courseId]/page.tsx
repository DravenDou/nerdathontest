// src/app/dashboard/course/[courseId]/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCourse, listStudentsForCourse, listCourseWork, CourseWork } from "@/lib/classroom"; // <-- Importa listCourseWork y CourseWork
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { courseId } = params;

  try {
    // Carga todos los datos en paralelo para mayor eficiencia
    const [course, students, courseWork] = await Promise.all([
      getCourse(courseId),
      listStudentsForCourse(courseId),
      listCourseWork(courseId),
    ]);

    const formatDate = (dueDate: CourseWork['dueDate']) => {
      if (!dueDate || !dueDate.day || !dueDate.month || !dueDate.year) {
        return "Sin fecha límite";
      }
      return new Date(dueDate.year, dueDate.month - 1, dueDate.day).toLocaleDateString('es-ES');
    }

    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground">{course.section}</p>
        </div>

        {/* SECCIÓN DE TAREAS */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tareas del Curso ({courseWork.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título de la Tarea</TableHead>
                  <TableHead>Fecha de Entrega</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseWork.length > 0 ? (
                  courseWork.map((cw) => (
                    <TableRow key={cw.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/course/${courseId}/work/${cw.id}`} className="block">
                          {cw.title}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(cw.dueDate)}</TableCell>
                      <TableCell>{cw.state}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No hay tareas publicadas en este curso.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SECCIÓN DE ALUMNOS (sin cambios) */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Alumnos ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[64px]">Avatar</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <TableRow key={student.userId}>
                      <TableCell>
                        <Avatar>
                          <AvatarFallback>
                            {student.profile.name.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.profile.name.fullName}
                      </TableCell>
                      <TableCell>{student.profile.emailAddress}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No hay alumnos inscritos en este curso.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-destructive">Error al cargar los datos del curso.</p>
      </div>
    );
  }
}