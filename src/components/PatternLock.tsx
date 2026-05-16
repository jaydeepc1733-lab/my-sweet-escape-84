import { useEffect, useMemo, useRef, useState } from "react";

interface PatternLockProps {
  value: number[];
  onChange: (pattern: number[]) => void;
  onComplete?: (pattern: number[]) => void;
  size?: number;
}

// 3x3 dot grid pattern input. Touch + mouse.
export function PatternLock({ value, onChange, onComplete, size = 260 }: PatternLockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const dots = useMemo(() => {
    const pts: { id: number; x: number; y: number }[] = [];
    const step = size / 4;
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        pts.push({ id: r * 3 + c, x: step * (c + 1), y: step * (r + 1) });
    return pts;
  }, [size]);

  const pointFromEvent = (e: PointerEvent | React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const tryAdd = (p: { x: number; y: number }) => {
    const HIT = (size / 4) * 0.45;
    const hit = dots.find((d) => Math.hypot(d.x - p.x, d.y - p.y) < HIT);
    if (hit && !value.includes(hit.id)) onChange([...value, hit.id]);
  };

  useEffect(() => {
    if (!drawing) return;
    const move = (e: PointerEvent) => {
      const p = pointFromEvent(e);
      setCursor(p);
      tryAdd(p);
    };
    const up = () => {
      setDrawing(false);
      setCursor(null);
      if (value.length > 0) onComplete?.(value);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drawing, value, onComplete]);

  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onChange([]);
    setDrawing(true);
    const p = pointFromEvent(e);
    setCursor(p);
    tryAdd(p);
  };

  return (
    <div
      ref={ref}
      onPointerDown={handleDown}
      className="relative touch-none select-none rounded-3xl bg-card/60 ring-1 ring-border/60"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="pointer-events-none absolute inset-0">
        {value.map((id, i) => {
          if (i === 0) return null;
          const a = dots[value[i - 1]];
          const b = dots[id];
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" />;
        })}
        {drawing && cursor && value.length > 0 && (
          <line
            x1={dots[value[value.length - 1]].x}
            y1={dots[value[value.length - 1]].y}
            x2={cursor.x}
            y2={cursor.y}
            stroke="var(--primary)"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.5}
          />
        )}
      </svg>
      {dots.map((d) => {
        const active = value.includes(d.id);
        return (
          <div
            key={d.id}
            className={`absolute rounded-full transition-all ${
              active ? "bg-primary scale-110" : "bg-border"
            }`}
            style={{
              left: d.x - 10,
              top: d.y - 10,
              width: 20,
              height: 20,
              boxShadow: active ? "0 0 0 8px color-mix(in oklab, var(--primary) 18%, transparent)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
