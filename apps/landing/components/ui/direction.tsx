"use client"

import { Direction } from "radix-ui"

export function DirectionProvider({
  direction,
  children,
}: {
  direction: "ltr" | "rtl"
  children: React.ReactNode
}) {
  return (
    <Direction.DirectionProvider dir={direction}>
      {children}
    </Direction.DirectionProvider>
  )
}
