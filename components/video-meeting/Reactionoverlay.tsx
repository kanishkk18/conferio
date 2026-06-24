'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reaction {
  id: string;
  emoji: string;
  name: string;
  image?: string;
  x: number; // 15–80 percent from left
}

interface Props {
  reactions: Reaction[];
}

export default function ReactionOverlay({ reactions }: Props) {
  return (
    // FIXED: was `w-64` which clipped reactions — must be full inset-0 with overflow-hidden
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            // FIXED: Start at the very bottom of the screen (y=0 relative to `bottom:0`)
            // and animate straight up using translateY in pixels, not vh units
            style={{
              position: 'absolute',
              bottom: 80, // sit just above the control bar
              left: `${r.x}%`,
              x: '-50%',
            }}
            initial={{ opacity: 0, y: 0, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 1, 1, 0],
              y: [0, -60, -160, -260, -320],
              scale: [0.4, 1.15, 1.05, 1, 0.85],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3.4,
              ease: 'easeOut',
              times: [0, 0.08, 0.35, 0.75, 1],
            }}
            className="flex flex-col items-center gap-1.5"
          >
            {/* Emoji */}
            <div
              className="text-5xl leading-none"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
              }}
            >
              {r.emoji}
            </div>

            {/* Avatar + name tag — sits BELOW emoji so it reads naturally */}
            <div className="flex items-center gap-1.5 bg-black/65 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap shadow-lg">
              {r.image ? (
                <img
                  src={r.image}
                  alt={r.name}
                  className="size-4 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="size-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[8px] font-bold leading-none">
                    {r.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
              )}
              <span className="leading-none">{r.name}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
