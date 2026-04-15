"use client";

import { useEffect, useRef, useState } from "react";
import { formatPLN } from "@/lib/utils/format";

interface CountUpProps {
  value: number;
  duration?: number;
}

export default function CountUp({ value, duration = 600 }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      setDisplay(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <>{formatPLN(Math.round(display))}</>;
}
