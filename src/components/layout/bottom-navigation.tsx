"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, HeartPulse, UserCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/progress", label: "Stats", icon: BarChart2 },
  { href: "/ai-features", label: "AI", icon: Sparkles },
  { href: "/goals", label: "Health", icon: HeartPulse },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export default function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-card shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-full max-w-md items-center justify-around">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center p-2 text-center"
            >
              <item.icon
                className={cn(
                  "h-6 w-6",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "mt-0.5 text-xs font-poppins",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
