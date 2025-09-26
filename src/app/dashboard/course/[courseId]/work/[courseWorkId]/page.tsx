import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCourseWorkDetails, listSubmissionsForCourseWork, getCourse, listStudentsForCourse } from "@/lib/classroom";
import { ArrowLeft, Download, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PageProps {
  params: Promise<{
    courseId: string;
    courseWorkId: string;
  }>;
}

export default async function CourseWorkDetailPage({ params }: PageProps) {
  const { courseId, courseWorkId } = await params;
  const session = await auth();

  if (!session?.accessToken) {
    return (
      <div className="p-4">
        <p>No hay sesión activa</p>
      </div>
    );
  }

  try {
    // Obtener datos en paralelo para mejorar performance
    const [courseWorkDetails, submissions, course, students] = await Promise.all([
      getCourseWorkDetails(courseId, courseWorkId),
      listSubmissionsForCourseWork(courseId, courseWorkId),
      getCourse(courseId),
      listStudentsForCourse(courseId),
    ]);

    // Crear un mapa de estudiantes para acceso rápido
    const studentsMap = new Map(
      students.map(student => [student.userId, student])
    );

    // Crear un mapa de entregas por usuario
    const submissionsMap = new Map(
      submissions.map(submission => [submission.userId, submission])
    );

    // Combinar datos de estudiantes con sus entregas
    const studentsWithSubmissions = students.map(student => {
      const submission = submissionsMap.get(student.userId);
      return {
        ...student,
        submission,
      };
    });

    // Función para determinar el estado de la entrega
    const getSubmissionStatus = (submission: any, dueDate?: { year: number; month: number; day: number }) => {
      if (!submission) {
        return { status: "MISSING", label: "Pendiente", color: "bg-gray-500" };
      }

      if (submission.state === "TURNED_IN") {
        if (submission.late) {
          return { status: "LATE", label: "Tarde", color: "bg-yellow-500" };
        }
        return { status: "SUBMITTED", label: "Entregado", color: "bg-green-500" };
      }

      if (submission.state === "RETURNED") {
        return { status: "RETURNED", label: "Calificado", color: "bg-blue-500" };
      }

      return { status: "CREATED", label: "Borrador", color: "bg-orange-500" };
    };

    // Calcular estadísticas
    const totalStudents = students.length;
    const submittedCount = studentsWithSubmissions.filter(s => 
      s.submission?.state === "TURNED_IN" || s.submission?.state === "RETURNED"
    ).length;
    const lateCount = studentsWithSubmissions.filter(s => s.submission?.late).length;
    const pendingCount = totalStudents - submittedCount;

    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/dashboard/course/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al curso
            </Button>
          </Link>
        </div>

        {/* Assignment Info Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {courseWorkDetails.title}
                </CardTitle>
                <p className="text-muted-foreground mb-4">
                  {course.name}
                </p>
                {courseWorkDetails.description && (
                  <p className="text-sm text-muted-foreground">
                    {courseWorkDetails.description}
                  </p>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {courseWorkDetails.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Fecha límite: {new Date(
                        courseWorkDetails.dueDate.year,
                        courseWorkDetails.dueDate.month - 1,
                        courseWorkDetails.dueDate.day
                      ).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-sm text-muted-foreground">Total estudiantes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{submittedCount}</div>
              <p className="text-sm text-muted-foreground">Entregados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
              <p className="text-sm text-muted-foreground">Tarde</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Estado de entregas ({totalStudents} estudiantes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de entrega</TableHead>
                  <TableHead>Calificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithSubmissions.map((student) => {
                  const statusInfo = getSubmissionStatus(
                    student.submission,
                    courseWorkDetails.dueDate
                  );

                  return (
                    <TableRow key={student.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={student.profile?.photoUrl} 
                              alt={student.profile?.name?.fullName || "Avatar"} 
                            />
                            <AvatarFallback>
                              {student.profile?.name?.givenName?.[0] || "?"}
                              {student.profile?.name?.familyName?.[0] || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.profile?.name?.fullName || "Sin nombre"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {student.profile?.emailAddress || "Sin email"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${statusInfo.color} text-white`}
                        >
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.submission?.updateTime ? (
                          <div className="text-sm">
                            {new Date(student.submission.updateTime).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.submission?.assignedGrade !== undefined ? (
                          <div className="font-medium">
                            {student.submission.assignedGrade}/{courseWorkDetails.maxPoints || 100}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin calificar</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error al cargar detalles de la tarea:", error);
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">
              Error al cargar los detalles de la tarea. Por favor, intenta de nuevo.
            </p>
            <Link href={`/dashboard/course/${courseId}`}>
              <Button className="mt-4">
                Volver al curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}