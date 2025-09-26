// src/components/dashboard/course-list.tsx
'use client'; // Directiva para convertirlo en un Componente Cliente

import Link from "next/link";
import { useState, useMemo } from "react";
import type { Course } from "@/lib/classroom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

type CourseWithTeachers = Course & { teachers: { fullName: string }[] };

interface CourseListProps {
  courses: CourseWithTeachers[];
}

export function CourseList({ courses }: CourseListProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');

  // Obtenemos una lista única de todos los profesores para poblar el filtro
  const allTeachers = useMemo(() => {
    const teachers = new Set<string>();
    courses.forEach(course => {
      course.teachers.forEach(teacher => teachers.add(teacher.fullName));
    });
    return Array.from(teachers);
  }, [courses]);

  // Filtramos los cursos basados en el profesor seleccionado
  const filteredCourses = useMemo(() => {
    if (selectedTeacher === 'all') {
      return courses;
    }
    return courses.filter(course => 
      course.teachers.some(teacher => teacher.fullName === selectedTeacher)
    );
  }, [courses, selectedTeacher]);

  return (
    <div>
      <div className="mb-6 max-w-xs">
        <h3 className="mb-2 text-sm font-medium">Filtrar por profesor</h3>
        <Select onValueChange={setSelectedTeacher} defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar un profesor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los profesores</SelectItem>
            {allTeachers.map(teacher => (
              <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Link key={course.id} href={`/dashboard/course/${course.id}`}>
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="truncate">{course.name}</CardTitle>
                <CardDescription>{course.section || "Sin sección"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{course.teachers.map(t => t.fullName).join(', ') || 'Sin profesor asignado'}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}