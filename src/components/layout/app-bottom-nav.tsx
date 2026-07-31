"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon3D, type Icon3DName } from "@/components/icons/icon-3d";
import { cn } from "@/lib/utils";

const items: {
  href: string;
  label: string;
  icon: Icon3DName;
  primary?: boolean;
}[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/progress", label: "Progress", icon: "progress" },
  { href: "/log-food/photo", label: "Scan", icon: "scan", primary: true },
  { href: "/diet-chart", label: "Plan", icon: "plan" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2"
    >
      <ul className="mx-auto flex h-[4.5rem] max-w-lg items-end justify-around rounded-[1.75rem] border border-white/50 bg-white/80 px-2 pb-2 pt-1 shadow-[var(--shadow-lg)] backdrop-blur-2xl dark:border-[hsl(150_14%_24%)] dark:bg-[hsl(158_18%_10%/0.88)] dark:shadow-[var(--shadow-md)]">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          if (item.primary) {
            return (
              <li key={item.href} className="-mt-8">
                <Link
                  href={item.href}
                  aria-label="Scan meal"
                  aria-current={isActive ? "page" : undefined}
                  className="relative flex h-[3.85rem] w-[3.85rem] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent"
                  />
                  <Icon3D
                    name={item.icon}
                    size={30}
                    className="relative"
                    alt=""
                  />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-2xl transition-all",
                    isActive && "bg-primary/10"
                  )}
                >
                  <Icon3D name={item.icon} size={22} alt="" />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
