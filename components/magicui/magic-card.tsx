"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import React, { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  // Store latest handlers in refs to avoid re-subscription
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>(() => {});
  const handleMouseOutRef = useRef<(e: MouseEvent) => void>(() => {});
  const handleMouseEnterRef = useRef<() => void>(() => {});

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (cardRef.current) {
        const { left, top } = cardRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
      }
    },
    [mouseX, mouseY],
  );

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      if (!e.relatedTarget) {
        document.removeEventListener("mousemove", handleMouseMoveRef.current);
        mouseX.set(-gradientSize);
        mouseY.set(-gradientSize);
      }
    },
    [mouseX, gradientSize, mouseY],
  );

  const handleMouseEnter = useCallback(() => {
    document.addEventListener("mousemove", handleMouseMoveRef.current);
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, gradientSize, mouseY]);

  // Update refs whenever handlers change
  useEffect(() => {
    handleMouseMoveRef.current = handleMouseMove;
    handleMouseOutRef.current = handleMouseOut;
    handleMouseEnterRef.current = handleMouseEnter;
  });

  // Stable subscription — only runs once on mount
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMouseMoveRef.current(e);
    const onMouseOut = (e: MouseEvent) => handleMouseOutRef.current(e);
    const onMouseEnter = () => handleMouseEnterRef.current();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []); // ← empty deps! no re-subscription

  // Initialize position when gradientSize changes
  useEffect(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  return (
    <div
      ref={cardRef}
      className={cn("group relative rounded-[inherit]", className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-border duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
          ${gradientFrom}, 
          ${gradientTo}, 
          hsl(var(--border)) 100%
          )
          `,
        }}
      />
      <div className="absolute inset-px rounded-[inherit] dark:bg-[#1e1e1f] bg-[#F9F9FA]" />
      <motion.div
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
          `,
          opacity: gradientOpacity,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}