
"use client";

import { usePathname } from "next/navigation";
import { Home, BarChart2, HeartPulse, UserCircle2, Sparkles, Apple } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/provider";

const bottomNavItems = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/progress", labelKey: "nav.stats", icon: BarChart2 },
  { href: "/ai-features", labelKey: "nav.ai", icon: Sparkles },
  { href: "/diet-chart", labelKey: "nav.diet", icon: Apple },
  { href: "/goals", labelKey: "nav.health", icon: HeartPulse },
  { href: "/profile", labelKey: "nav.profile", icon: UserCircle2 },
];

export default function BottomNavigationBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-card shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-full max-w-md items-center justify-around">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <button
              key={item.labelKey}
              onClick={() => handleNavigation(item.href)}
              className="flex flex-1 flex-col items-center justify-center p-2 text-center hover:bg-muted/50 transition-colors"
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "mt-0.5 text-[10px] font-poppins",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

    