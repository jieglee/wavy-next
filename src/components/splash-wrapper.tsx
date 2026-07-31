"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/splash-screen";

export default function SplashWrapper({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <SplashScreen isVisible={showSplash} />
            {children}
        </>
    );
}