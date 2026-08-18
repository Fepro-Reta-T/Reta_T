"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/torneos",
    label: "Torneos",
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      </svg>
    ),
  },
  {
    href: "/partidos",
    label: "Partidos",
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
      </svg>
    ),
  },
  {
    href: "/equipos",
    label: "Equipos",
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    href: "/canchas",
    label: "Canchas",
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Spacer para que el contenido no quede detrás del nav en mobile */}
      <div className="h-20 md:hidden" />

      {/* Bottom Nav — Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Fondo con blur */}
        <div className="absolute inset-0 bg-card/90 backdrop-blur-xl border-t border-secondary" />

        {/* Línea indicadora deslizante en el top del nav */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${100 / navItems.length}%`,
              left: `${(activeIndex / navItems.length) * 100}%`,
            }}
          />
        )}

        <div className="relative flex items-center justify-around px-1 py-2">
          {navItems.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 group relative"
              >
                {/* Pill de fondo activo */}
                <span
                  className={`flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary/15 text-primary scale-110"
                      : "text-muted-foreground group-hover:text-foreground group-hover:bg-secondary/50"
                  }`}
                >
                  {item.icon(isActive)}
                </span>
                {/* Label con animación fade */}
                <span
                  className={`text-[10px] font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-primary opacity-100 translate-y-0"
                      : "text-muted-foreground opacity-80 translate-y-0"
                  }`}
                >
                  {item.label}
                </span>

                {/* Punto indicador debajo del label */}
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar — Desktop */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-card/95 backdrop-blur-lg border-r border-secondary z-40 pt-20 pb-6">
        {/* Indicador activo vertical */}
        {activeIndex >= 0 && (
          <div
            className="absolute left-0 w-0.5 bg-primary rounded-r-full transition-all duration-300 ease-out"
            style={{
              height: "2.5rem",
              top: `${80 + activeIndex * 60 + 16}px`,
            }}
          />
        )}
        <div className="flex flex-col items-center gap-2 px-2 flex-1 mt-4">
          {navItems.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex flex-col items-center gap-1 w-full px-2 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <span className={`w-6 h-6 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                  {item.icon(isActive)}
                </span>
                <span className={`text-[9px] font-semibold ${isActive ? "text-primary" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
