"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "motion/react";
import React, { useRef, useState } from "react";

interface NavbarProps {
    children: React.ReactNode;
    className?: string;
}

interface NavBodyProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface NavItemsProps {
    items: { name: string; link: string }[];
    className?: string;
    onItemClick?: () => void;
}

interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface MobileNavHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface MobileNavMenuProps {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const [visible, setVisible] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setVisible(latest > 100);
    });

    return (
        <motion.div ref={ref} className={cn("sticky inset-x-0 top-0 z-40 w-full", className)}>
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
                    : child,
            )}
        </motion.div>
    );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(10px)" : "none",
                boxShadow: visible
                    ? "0 0 24px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset"
                    : "none",
                width: visible ? "60%" : "100%",
                y: visible ? 20 : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 50 }}
            style={{ minWidth: "800px" }}
            className={cn(
                "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex",
                visible && "border border-wavy-border bg-wavy-surface/80",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
        if (link.startsWith("#")) {
            e.preventDefault();
            document.querySelector(link)?.scrollIntoView({ behavior: "smooth" });
        }
        onItemClick?.();
    };

    return (
        <motion.div
            onMouseLeave={() => setHovered(null)}
            className={cn(
                "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-wavy-text-secondary transition duration-200 lg:flex lg:space-x-2",
                className,
            )}
        >
            {items.map((item, idx) => (
                <a
                    key={`link-${idx}`}
                    href={item.link}
                    onMouseEnter={() => setHovered(idx)}
                    onClick={(e) => handleClick(e, item.link)}
                    className="relative px-4 py-2 text-wavy-text-secondary hover:text-wavy-text-primary"
                >
                    {hovered === idx && (
                        <motion.div
                            layoutId="hovered"
                            className="absolute inset-0 h-full w-full rounded-full bg-wavy-bg"
                        />
                    )}
                    <span className="relative z-20">{item.name}</span>
                </a>
            ))}
        </motion.div>
    );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(10px)" : "none",
                boxShadow: visible ? "0 0 24px rgba(0,0,0,0.35)" : "none",
                width: visible ? "90%" : "100%",
                paddingRight: visible ? "12px" : "0px",
                paddingLeft: visible ? "12px" : "0px",
                borderRadius: visible ? "16px" : "2rem",
                y: visible ? 20 : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 50 }}
            className={cn(
                "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
                visible && "border border-wavy-border bg-wavy-surface/90",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => (
    <div className={cn("flex w-full flex-row items-center justify-between px-4", className)}>
        {children}
    </div>
);

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                    "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg border border-wavy-border bg-wavy-surface px-4 py-8 shadow-xl",
                    className,
                )}
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) =>
    isOpen ? (
        <IconX className="text-wavy-text-primary" onClick={onClick} />
    ) : (
        <IconMenu2 className="text-wavy-text-primary" onClick={onClick} />
    );

export const NavbarLogo = () => (
    <Link href="/" className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal">
        <span className="font-display text-xl font-semibold tracking-tight text-wavy-text-primary">
            Wavy
        </span>
    </Link>
);

export const NavbarButton = ({
    href,
    as: Tag = "a",
    children,
    className,
    variant = "primary",
    ...props
}: {
    href?: string;
    as?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary";
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) => {
    const baseStyles =
        "px-4 py-2 rounded-lg text-sm font-medium relative cursor-pointer transition duration-200 inline-block text-center";

    const variantStyles = {
        primary: "bg-wavy-accent text-wavy-bg hover:brightness-110",
        secondary:
            "bg-transparent border border-wavy-border text-wavy-text-secondary hover:border-wavy-text-secondary hover:text-wavy-text-primary",
    };

    return (
        <Tag href={href} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
            {children}
        </Tag>
    );
};