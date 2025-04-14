"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  gradientColors?: string[];
  className?: string;
}

export function GradientBackground({
  children,
  gradientColors = [
    "rgba(var(--color-primary), 0.2)",
    "rgba(var(--color-primary), 0.1)",
    "rgba(var(--color-primary), 0.05)",
  ],
  className,
  ...props
}: GradientBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col overflow-hidden bg-background",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Background gradient circles */}
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-radial from-[#8f99fb] to-transparent opacity-20 blur-2xl" />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-radial from-[#a3a0fb] to-transparent opacity-20 blur-2xl" />
        <div className="absolute bottom-[10%] left-[30%] h-[400px] w-[400px] rounded-full bg-gradient-radial from-[#c4b5fd] to-transparent opacity-20 blur-2xl" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Content with glass effect */}
      <div className="relative z-10 flex h-full w-full flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}