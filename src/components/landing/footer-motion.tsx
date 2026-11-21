"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const column: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

/** Grid kolom footer: kolom muncul berurutan (fade + naik sedikit) saat masuk viewport. */
export function FooterColumns({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/** Satu kolom footer. prefers-reduced-motion → langsung tampil tanpa gerak. */
export function FooterColumn({ className, children }: { className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={column}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
