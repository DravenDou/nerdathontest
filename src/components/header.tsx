// src/components/header.tsx
import { UserButton } from "./auth/user-button";

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex flex-1">
          <a href="/dashboard" className="-m-1.5 p-1.5 font-bold">
            Semillero Digital
          </a>
        </div>
        <div className="flex items-center gap-x-4">
          <UserButton />
        </div>
      </nav>
    </header>
  );
}