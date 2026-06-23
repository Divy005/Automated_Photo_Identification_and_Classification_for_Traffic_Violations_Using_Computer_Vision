import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Vertical offset (px) the element starts from. */
  y?: number;
  /** Horizontal offset (px) the element starts from. */
  x?: number;
  /** Delay before the reveal transition starts (ms). */
  delay?: number;
  as?: ElementType;
};

/** Fades + slides its children in the first time they scroll into view. */
export function Reveal({ children, className, y = 26, x = 0, delay = 0, as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={cn("reveal", inView && "reveal-in", className)}
      style={
        {
          transitionDelay: `${delay}ms`,
          "--reveal-y": `${y}px`,
          "--reveal-x": `${x}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

/** Counts up to `end` when scrolled into view. */
export function CountUp({
  end,
  duration = 1600,
  suffix = "",
  decimals = 0,
  className,
}: {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo for a punchy finish
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(end * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
