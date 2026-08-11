"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/splash-screen";

let hasShownSplash = false;

export default function SplashWrapper({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(() => !hasShownSplash);

    useEffect(() => {
        if (!showSplash) return;
        hasShownSplash = true;
        const timer = setTimeout(() => setShowSplash(false), 2200);
        return () => clearTimeout(timer);
    }, [showSplash]);

    return (
        <>
            <SplashScreen isVisible={showSplash} />
            {children}
        </>
    );
}