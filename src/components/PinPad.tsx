import { Delete } from "lucide-react";

interface PinPadProps {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}

export function PinPad({ value, onChange, maxLength = 6 }: PinPadProps) {
  const press = (k: string) => {
    if (k === "del") onChange(value.slice(0, -1));
    else if (value.length < maxLength) onChange(value + k);
  };

  return (
    <div className="w-full max-w-xs">
      <div className="mb-8 flex justify-center gap-3">
        {Array.from({ length: maxLength }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full transition-all ${
              i < value.length ? "bg-primary scale-110" : "bg-border"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k, i) =>
          k === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => press(k)}
              className="flex h-16 items-center justify-center rounded-2xl bg-card/70 text-2xl font-medium text-foreground ring-1 ring-border/60 transition active:scale-95 active:bg-secondary"
            >
              {k === "del" ? <Delete className="h-5 w-5" /> : k}
            </button>
          )
        )}
      </div>
    </div>
  );
}
