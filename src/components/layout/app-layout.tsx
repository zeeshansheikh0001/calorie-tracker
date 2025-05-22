
"use client";

import type { PropsWithChildren } from "react";
import BottomNavigationBar from "./bottom-navigation";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <>
      <main className="flex-1 bg-background pb-20 md:pb-0"> {/* Added padding-bottom for bottom nav, remove for md screens */}
        {children}
      </main>
      <BottomNavigationBar />
    </>
  );
}
