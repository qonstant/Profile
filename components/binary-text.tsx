"use client"

import { useState, useEffect, useRef } from "react"

interface BinaryTextProps {
  text: string
  className?: string
}

export function BinaryText({ text, className = "" }: BinaryTextProps) {
  const [characters, setCharacters] = useState<string[]>(text.split(""))
  const [fixedWidth, setFixedWidth] = useState<number | null>(null)
  const isAnimatingRef = useRef(false)
  const spanRef = useRef<HTMLSpanElement>(null)
  const intervalsRef = useRef<NodeJS.Timeout[]>([])

  // Measure and lock width on mount
  useEffect(() => {
    if (spanRef.current && fixedWidth === null) {
      const width = spanRef.current.getBoundingClientRect().width
      setFixedWidth(width)
    }
  }, [fixedWidth])

  const handleMouseEnter = () => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    const originalChars = text.split("")
    const totalChars = originalChars.length
    
    // Create array of non-space indices
    const nonSpaceIndices = originalChars
      .map((char, i) => (char !== " " ? i : -1))
      .filter((i) => i !== -1)
    
    // Shuffle indices for random reveal order
    const shuffledIndices = [...nonSpaceIndices].sort(() => Math.random() - 0.5)
    
    // Track which characters are revealed
    const revealed = new Array(totalChars).fill(false)
    // Mark spaces as already revealed
    originalChars.forEach((char, i) => {
      if (char === " ") revealed[i] = true
    })

    // Start with all non-space chars as binary
    const currentChars = originalChars.map((char) =>
      char === " " ? " " : Math.random() > 0.5 ? "1" : "0"
    )
    setCharacters([...currentChars])

    // Scramble non-revealed characters
    const scrambleInterval = setInterval(() => {
      for (let i = 0; i < totalChars; i++) {
        if (!revealed[i]) {
          currentChars[i] = Math.random() > 0.5 ? "1" : "0"
        }
      }
      setCharacters([...currentChars])
    }, 50)
    intervalsRef.current.push(scrambleInterval)

    // Reveal characters one by one
    shuffledIndices.forEach((charIndex, order) => {
      const timeout = setTimeout(() => {
        revealed[charIndex] = true
        currentChars[charIndex] = originalChars[charIndex]
        setCharacters([...currentChars])

        // If all revealed, stop scrambling
        if (order === shuffledIndices.length - 1) {
          clearInterval(scrambleInterval)
          isAnimatingRef.current = false
        }
      }, 200 + order * 60) // Start revealing after 200ms, then every 60ms
      intervalsRef.current.push(timeout as unknown as NodeJS.Timeout)
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((t) => clearTimeout(t))
      intervalsRef.current.forEach((t) => clearInterval(t))
    }
  }, [])

  return (
    <span
      ref={spanRef}
      className={`cursor-pointer inline-block whitespace-nowrap ${className}`}
      style={fixedWidth ? { width: fixedWidth, textAlign: "left" } : undefined}
      onMouseEnter={handleMouseEnter}
    >
      {characters.join("")}
    </span>
  )
}
