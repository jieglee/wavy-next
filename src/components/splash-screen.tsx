"use client";

import { motion, AnimatePresence } from "motion/react";

interface SplashScreenProps {
    isVisible: boolean;
    onExitComplete?: () => void;
}

export default function SplashScreen({ isVisible, onExitComplete }: SplashScreenProps) {
    return (
        <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
            {isVisible && (
                <motion.div
                    key="splash"
                    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-wavy-bg"
                    initial={{ y: 0 }}
                    animate={{ y: 0 }}
                    exit={{
                        y: "-100%",
                        borderBottomLeftRadius: "60%",
                        borderBottomRightRadius: "60%",
                        transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
                    }}
                >
                    <motion.svg
                        className="pointer-events-none absolute inset-x-0 bottom-10 w-full overflow-visible"
                        viewBox="0 0 400 60"
                        fill="none"
                        preserveAspectRatio="none"
                        initial={{ opacity: 0 }}
                        exit={{
                            opacity: 1,
                            transition: { duration: 0.5, ease: "easeOut" },
                        }}
                        style={{ height: 52 }}
                    >
                        <path
                            d="M0,32 C50,6 100,6 150,32 C200,58 250,58 300,32 C340,12 370,10 400,18"
                            stroke="#FF5470"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            style={{ filter: "drop-shadow(0 0 8px rgba(255,84,112,0.45))" }}
                        />
                    </motion.svg>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center gap-6 relative"
                    >
                        <svg
                            width="72"
                            height="72"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="drop-shadow-[0_4px_16px_rgba(255,84,112,0.25)]"
                        >
                            <path
                                d="M2 15 Q6 5, 10 15 T18 15 T26 15"
                                stroke="#FF5470"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <circle cx="20" cy="4.5" r="2.4" fill="#FF5470" />
                        </svg>

                        <div className="text-center">
                            <h1 className="font-display font-bold text-wavy-text-primary m-0 leading-none tracking-[-0.03em] text-[2.6rem]">
                                Wavy
                            </h1>
                            <p className="text-[0.68rem] text-wavy-text-secondary tracking-[0.18em] uppercase font-medium mt-3 mb-0">
                                Marketplace Tiket Konser
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}