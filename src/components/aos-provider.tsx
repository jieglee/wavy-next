'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function AosProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-quart',
      once: true,
      offset: 60,
      delay: 0,
    })
  }, [])
  useEffect(() => { AOS.refresh() }, [pathname])

  return <>{children}</>
}
