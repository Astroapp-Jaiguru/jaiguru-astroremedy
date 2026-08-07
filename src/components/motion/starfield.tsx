"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Animated glowing particle field.
 * Renders lightweight glowing dots that drift upward and sway — purely
 * decorative, used in hero and major banners for an immersive backdrop.
 */
const COLORS = ["#FACC15", "#D4AF37", "#A78BFA", "#34D399", "#FFFFFF"];

export function Starfield({ count = 16 }: { count?: number }) {
  const reduce = useReducedMotion();

  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 2 + ((i * 7) % 4);
        return {
          id: i,
          color: COLORS[i % COLORS.length],
          size,
          left: ((i * 61 + 13) % 100) + 1,
          duration: 9 + ((i * 5) % 11),
          delay: (i * 1.7) % 9,
          drift: ((i % 2 === 0 ? 1 : -1) * (6 + ((i * 3) % 12))) / 10,
        };
      }),
    [count]
  );

  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            bottom: "-6%",
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 12px 2px ${s.color}55`,
            opacity: 0,
          }}
          animate={{
            y: [0, -40, -88],
            x: [0, s.drift * 40, s.drift * 10],
            opacity: [0, 0.9, 0],
            scale: [0.8, 1.15, 0.7],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}