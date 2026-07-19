import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
};

export function PageContainer({
  children,
  className,
  narrow = true,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 pb-10 pt-6 sm:px-6",
        narrow ? "max-w-lg" : "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}
