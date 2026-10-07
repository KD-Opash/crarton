"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  delay?: number
}

export function Reveal({
  children,
  className,
  stagger = 0,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px -6% 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.001, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.001, y: 18 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Exact match for --ease-reveal
        delay: delay + stagger * 0.07, // 70ms stagger increment
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
