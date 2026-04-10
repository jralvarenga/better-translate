"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RiArrowRightLine } from "@remixicon/react";

interface HeroBadgeProps {
  messages: string[];
}

export function HeroBadge({ messages }: HeroBadgeProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 3000);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 overflow-hidden">
      <RiArrowRightLine className="size-3.5 shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="whitespace-nowrap"
        >
          {messages[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
