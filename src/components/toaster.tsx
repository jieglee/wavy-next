"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error";

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

let toasts: ToastItem[] = [];
let listeners: Array<(toasts: ToastItem[]) => void> = [];
let nextId = 1;

function emit() {
    listeners.forEach((l) => l([...toasts]));
}

function push(type: ToastType, message: string) {
    const id = nextId++;
    toasts = [...toasts, { id, type, message }];
    emit();
    setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id);
        emit();
    }, 3200);
}

export const toast = {
    success: (message: string) => push("success", message),
    error: (message: string) => push("error", message),
};

export function Toaster() {
    const [items, setItems] = useState<ToastItem[]>([]);

    useEffect(() => {
        listeners.push(setItems);
        return () => {
            listeners = listeners.filter((l) => l !== setItems);
        };
    }, []);

    return (
        <div className="fixed left-1/2 top-5 z-[9999] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
            {items.map((t) => (
                <div
                    key={t.id}
                    className={`w-full rounded-lg px-4 py-2.5 text-[11px] font-medium shadow-lg ${
                        t.type === "success"
                            ? "bg-[#1D1B24] text-white"
                            : "bg-[#FF5470] text-white"
                    }`}
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
}
