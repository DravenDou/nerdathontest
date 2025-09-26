// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold">Acceso Denegado</h1>
      <p className="text-muted-foreground">
        No tienes los permisos necesarios para ver esta página.
      </p>
    </div>
  );
}