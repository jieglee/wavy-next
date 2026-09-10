"use client";

import { useState } from "react";
import Link from "next/link";

interface Category {
  id: string;
  label: string;
  href: string;
}

const categories: Category[] = [
  { id: "musik", label: "Musik", href: "/concerts?category=musik" },
  { id: "pameran", label: "Pameran", href: "/concerts?category=pameran" },
  { id: "teater", label: "Teater", href: "/concerts?category=teater" },
  { id: "olahraga", label: "Olahraga", href: "/concerts?category=olahraga" },
  { id: "talkshow", label: "Talkshow", href: "/concerts?category=talkshow" },
  { id: "workshop", label: "Workshop", href: "/concerts?category=workshop" },
  { id: "kompetisi", label: "Kompetisi", href: "/concerts?category=kompetisi" },
];

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF2FF] sm:h-[72px] sm:w-[72px]">
      <div className="text-[#1A4BDE]">{children}</div>
    </div>
  );
}

function CatIcon({ id }: { id: string }) {
  const cls = "h-8 w-8 sm:h-9 sm:w-9";
  switch (id) {
    case "musik":
      return (
        <IconWrap>
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <path d="M6 14l8-4 4-1-1 10" stroke="#1A4BDE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="5" cy="17" rx="2.4" ry="1.9" fill="#1A4BDE" />
            <ellipse cx="16" cy="18" rx="2.4" ry="1.9" fill="#1A4BDE" opacity="0.75" />
            <circle cx="18" cy="6" r="1.5" fill="#1A4BDE" />
          </svg>
        </IconWrap>
      );
    case "pameran":
      return (
        <IconWrap>
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <rect x="4" y="6" width="16" height="9" rx="1" fill="#1A4BDE" opacity="0.15" stroke="#1A4BDE" strokeWidth="1.4" />
            <path d="M7 9l2 2-2 2M11 13h5" stroke="#1A4BDE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 18h3M13 18h3" stroke="#1A4BDE" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="17" cy="8.5" r="1" fill="#1A4BDE" />
          </svg>
        </IconWrap>
      );
    case "teater":
      return (
        <IconWrap>
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <path d="M4 6h16v2H4z" fill="#1A4BDE" />
            <path d="M5 8v7a7 7 0 0 0 14 0V8" stroke="#1A4BDE" strokeWidth="1.5" />
            <path d="M8 12c1 2.5 2.5 3.5 4 3.5s3-1 4-3.5" stroke="#1A4BDE" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="10" cy="10.5" r="0.9" fill="#1A4BDE" />
            <circle cx="14" cy="10.5" r="0.9" fill="#1A4BDE" />
          </svg>
        </IconWrap>
      );
    case "olahraga":
      return (
        <IconWrap>
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <circle cx="12" cy="12" r="7.5" fill="white" stroke="#1A4BDE" strokeWidth="1.5" />
            <path d="M12 4.5v15M4.5 12h15" stroke="#1A4BDE" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="2" fill="none" stroke="#1A4BDE" strokeWidth="1.4" />
            <rect x="5.5" y="10" width="2" height="4" rx="1" fill="#1A4BDE" />
            <rect x="16.5" y="10" width="2" height="4" rx="1" fill="#1A4BDE" />
          </svg>
        </IconWrap>
      );
    case "talkshow":
      return (
        <IconWrap>
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <rect x="9" y="4" width="6" height="6" rx="3" fill="#1A4BDE" opacity="0.2" stroke="#1A4BDE" strokeWidth="1.4" />
            <rect x="9.5" y="10" width="5" height="4" rx="1" fill="#1A4BDE" />
            <path d="M11 14v2.5h2V14" stroke="#1A4BDE" strokeWidth="1.3" />
            <path d="M9 17.5h6" stroke="#1A4BDE" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M15.5 7.5h.01M13.5 7.5h.01" stroke="#1A4BDE" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </IconWrap>
      );
    case "workshop":
      return (
        <IconWrap>
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <rect x="4" y="8" width="16" height="8" rx="1.2" fill="white" stroke="#1A4BDE" strokeWidth="1.4" />
            <rect x="6" y="5" width="12" height="3" rx="1" fill="#1A4BDE" opacity="0.9" />
            <path d="M12 10l1.6 2.4L12 14.8l-1.6-2.4z" fill="#1A4BDE" />
            <path d="M8 12h2M14 12h2" stroke="#1A4BDE" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </IconWrap>
      );
    case "kompetisi":
      return (
        <IconWrap>
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <path d="M7 6h10v4.5a5 5 0 0 1-10 0V6z" fill="#1A4BDE" />
            <path d="M7 6H4.5A2 2 0 0 0 6.6 10M17 6h2.5A2 2 0 0 1 17.4 10" stroke="#1A4BDE" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M12 15.5V17M10 19h4l-.6-2h-2.8z" stroke="#1A4BDE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="8.8" r="1.1" fill="white" />
          </svg>
        </IconWrap>
      );
    default:
      return <IconWrap><div className="h-6 w-6 rounded bg-[#1A4BDE]" /></IconWrap>;
  }
}

export default function CategoryBar() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 sm:gap-5 lg:justify-between lg:gap-2">
          {categories.map((cat) => {
            const isActive = active === cat.id;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                onClick={() => setActive(cat.id)}
                className="flex shrink-0 flex-col items-center gap-2.5"
              >
                <CatIcon id={cat.id} />
                <span
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-center text-[11px] font-medium leading-tight transition-colors sm:px-3.5 sm:text-xs ${
                    isActive
                      ? "border-[#1A4BDE] bg-[#1A4BDE] text-white"
                      : "border-[#1A4BDE] bg-white text-[#1A4BDE] hover:bg-[#EDF2FF]"
                  }`}
                  style={{ minWidth: "fit-content", maxWidth: "110px", whiteSpace: "normal", lineHeight: "1.2" }}
                >
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
