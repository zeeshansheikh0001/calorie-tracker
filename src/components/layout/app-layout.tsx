
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, BarChart2, HeartPulse, UserCircle2, Settings, LogOut, BookOpenText, Utensils, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/progress", label: "Stats", icon: BarChart2 },
  { href: "/goals", label: "Health", icon: HeartPulse },
];

const SiteLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="hsl(var(--primary))" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    <path d="M12 8.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5S13.93 8.5 12 8.5zM12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    <circle cx="12" cy="12" r="1.5" fill="hsl(var(--background))"/>
  </svg>
);


export function AppLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-3 flex justify-center">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <SiteLogo />
            <h1 className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">NourishAI</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} asChild>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <Link href="/log-food/photo" asChild>
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/log-food')}
                    tooltip="Log Meal"
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <Utensils className="h-5 w-5"/>
                    <span className="group-data-[collapsible=icon]:hidden">Log Meal</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/reminders" asChild>
                  <SidebarMenuButton
                    isActive={pathname === "/reminders"}
                    tooltip="Reminders"
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <Bell className="h-5 w-5"/>
                    <span className="group-data-[collapsible=icon]:hidden">Reminders</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/recipes" asChild>
                  <SidebarMenuButton
                    isActive={pathname === "/recipes"}
                    tooltip="Recipes"
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <BookOpenText className="h-5 w-5"/>
                    <span className="group-data-[collapsible=icon]:hidden">Recipes</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <Separator className="my-2"/>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center justify-start gap-2 w-full px-2 h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:size-10">
                <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar"/>
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Alex</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle2 className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <SiteLogo />
            <span className="font-semibold text-foreground">NourishAI</span>
          </Link>
          <SidebarTrigger />
        </header>
        <main className="flex-1 bg-background">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
