"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BackgroundBeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function BackgroundBeams({
  className,
  children,
  ...props
}: BackgroundBeamsProps) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (element) {
        element.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "h-full w-full overflow-hidden [--x:0] [--y:0]",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 h-full w-full bg-[radial-gradient(circle_500px_at_var(--x)_var(--y),rgba(var(--color-primary),0.15),transparent_100%)]"
        style={{
          "--x": `${mousePosition.x}px`,
          "--y": `${mousePosition.y}px`,
        } as React.CSSProperties}
      />
      {children}
    </div>
  );
}