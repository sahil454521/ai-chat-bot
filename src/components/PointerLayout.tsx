"use client"

import { Pointer } from "@/components/magicui/pointer"
import { motion } from "motion/react"
import { ReactNode, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

interface PointerLayoutProps {
  children: ReactNode
}

export default function PointerLayout({ children }: PointerLayoutProps) {
  const pathname = usePathname()
  const [pointerState, setPointerState] = useState<"default" | "input" | "button">("default")
  
  useEffect(() => {
    // Apply event listeners to detect interactive elements
    const handleElementEnter = (state: "input" | "button") => {
      setPointerState(state)
    }
    
    const handleElementLeave = () => {
      setPointerState("default")
    }
    
    // Add listeners for buttons and links
    const buttons = document.querySelectorAll('button, a, [role="button"]')
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => handleElementEnter("button"))
      button.addEventListener('mouseleave', handleElementLeave)
    })
    
    // Add listeners for input fields
    const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"]')
    inputs.forEach(input => {
      input.addEventListener('mouseenter', () => handleElementEnter("input"))
      input.addEventListener('mouseleave', handleElementLeave)
    })
    
    return () => {
      // Clean up listeners
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', () => handleElementEnter("button"))
        button.removeEventListener('mouseleave', handleElementLeave)
      })
      
      inputs.forEach(input => {
        input.removeEventListener('mouseenter', () => handleElementEnter("input"))
        input.removeEventListener('mouseleave', handleElementLeave)
      })
    }
  }, [])
  
  return (
    <div className="relative min-h-screen">
      {/* Animated Beam Background that fades in and stays behind content */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
          {/* Animated Beams */}
          <div className="absolute top-0 left-1/4 h-full w-px animate-beam-slide bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent opacity-70"></div>
          <div className="absolute top-0 left-2/4 h-full w-px animate-beam-slide-delayed bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent opacity-70"></div>
          <div className="absolute top-0 left-3/4 h-full w-px animate-beam-slide2 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent opacity-70"></div>
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
      
      <Pointer>
        <motion.div
          animate={{
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="flex items-center justify-center"
        >
          {pointerState === "default" && (
            <div className="h-4 w-4 rounded-full border-2 border-indigo-500 bg-transparent"></div>
          )}
          
          {pointerState === "input" && (
            <div className="h-6 w-[1px] bg-indigo-500 animate-blink"></div>
          )}
          
          {pointerState === "button" && (
            <div className="h-5 w-5 rounded-full bg-indigo-500/30 border border-indigo-500"></div>
          )}
        </motion.div>
      </Pointer>
    </div>
  )
}