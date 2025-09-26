# Copilot Instructions - Semillero Digital Dashboard

## 🎯 Contexto del Proyecto

**Proyecto:** Complemento para Google Classroom (NO reemplazo)  
**Cliente:** Semillero Digital (ONG capacitación digital jóvenes)  
**Objetivo:** Dashboard consolidado para seguimiento, comunicación y métricas de cursos

**Usuarios objetivo:** Coordinadores, profesores y alumnos **NO técnicos** - la usabilidad es criterio crítico de evaluación.

## 🏗️ Arquitectura y Stack

```
Framework: Next.js 15.5.4 (App Router) + TypeScript
Autenticación: NextAuth.js v5.0.0-beta.29 con Google OAuth 2.0
UI: Tailwind CSS v4 + Shadcn/ui (Stone theme, componentes accesibles)
Dashboards: Tremor React v3.18.7 (reportes y gráficos)
Gestor: pnpm (no npm/yarn)
API Principal: Google Classroom API
```

```
src/
├── app/                 # App Router (Next.js 14+)
│   ├── api/auth/       # NextAuth.js endpoints
│   ├── dashboard/      # Páginas principales
│   ├── globals.css     # Tailwind + Shadcn variables
│   ├── layout.tsx      # Layout global con auth
│   └── page.tsx        # Página de inicio
├── components/
│   ├── ui/            # Shadcn/ui components
│   ├── dashboard/     # Tremor dashboards
│   └── auth/          # Componentes de autenticación
├── lib/
│   ├── auth.ts        # Configuración NextAuth.js
│   ├── classroom.ts   # Cliente Google Classroom API
│   └── utils.ts       # Utilidades (cn, etc.)
└── types/
    └── google.ts      # Tipos para API responses
```

## 🔑 Configuración Crítica

### 1. Google OAuth 2.0 + Classroom API

```typescript
// lib/auth.ts - Configuración NextAuth.js
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        scope:
          "openid email profile https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
      },
    },
  }),
];
```

### 2. Variables de Entorno Requeridas

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## 📊 Funcionalidades MVP

### Dashboard Principal

- **Listas de alumnos/profesores** por curso
- **Estado de entregas:** entregado ✅, atrasado 🔴, pendiente ⏳
- **Filtros:** curso, profesor, estado de entrega
- **Identificación:** email de Google como ID único

### Componentes Tremor Clave

```typescript
// Usar estos componentes para dashboards:
import { Card, Title, AreaChart, DonutChart, BarList } from "@tremor/react";

// Patrones de datos para visualizaciones:
interface AssignmentStatus {
  course: string;
  submitted: number;
  late: number;
  pending: number;
}
```

## 🎨 Principios de UX/UI

### Diseño para Usuarios NO Técnicos

- **Navegación simple:** máximo 3 niveles
- **Colores intuitivos:** verde=completado, rojo=atrasado, gris=pendiente
- **Texto claro:** evitar jerga técnica
- **Loading states:** siempre mostrar feedback visual

### Componentes Shadcn/ui Preferidos

```bash
# Instalación típica de componentes
pnpx shadcn@latest add button card table badge select
```

## � Próximos Pasos de Desarrollo

1. **Setup inicial:** Next.js + NextAuth.js + Google OAuth
2. **API Integration:** Cliente para Google Classroom API
3. **Dashboard básico:** Lista de cursos y estudiantes
4. **Filtros y visualizaciones:** Tremor charts para métricas
5. **Polish UX:** Testing con usuarios no técnicos

## 🎨 Componentes UI Disponibles

```typescript
// Shadcn/ui instalados:
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Tremor para dashboards:
import {
  Card as TremorCard,
  Title,
  AreaChart,
  DonutChart,
  BarList,
} from "@tremor/react";
```

## � Comandos de Desarrollo

```bash
# Inicialización del proyecto
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Instalación de dependencias principales
pnpm add next-auth@beta @tremor/react @radix-ui/react-icons
pnpx shadcn@latest init

# Desarrollo
pnpm dev

# Build
pnpm build

# Agregar más componentes Shadcn
pnpx shadcn@latest add [component-name]
```

## ⚠️ Consideraciones Importantes

- **Autenticación:** Toda la app requiere login con Google
- **API Limits:** Google Classroom tiene rate limits - implementar caching
- **Roles:** Diferenciar permisos entre coordinador/profesor/alumno
- **Responsive:** Diseño mobile-first (usuarios usan tablets/móviles)
- **Performance:** Lazy loading para listas grandes de estudiantes
