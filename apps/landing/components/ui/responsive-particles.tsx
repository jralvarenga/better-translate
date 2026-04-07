"use client";

import { useEffect, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";

import { Particles } from "@/components/ui/particles";

type Props = ComponentPropsWithoutRef<typeof Particles>;

// Only render particles on devices with a fine pointer (mouse/trackpad).
// Touch-only devices skip the canvas RAF loop entirely.
export function ResponsiveParticles(props: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setShow(mq.matches);
  }, []);

  if (!show) return null;
  return <Particles {...props} />;
}
