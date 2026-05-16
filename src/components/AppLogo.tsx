import { ShoppingBag } from "lucide-react";

export function AppLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "h-9 w-9", icon: 18, text: "text-lg" },
    md: { box: "h-11 w-11", icon: 22, text: "text-xl" },
    lg: { box: "h-16 w-16", icon: 32, text: "text-3xl" },
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${sizes.box} flex items-center justify-center rounded-2xl pastel-gradient shadow-sm ring-1 ring-border/60`}
      >
        <ShoppingBag size={sizes.icon} className="text-plum" strokeWidth={1.75} />
      </div>
      <span className={`font-display ${sizes.text} text-foreground tracking-tight`}>
        Hush
      </span>
    </div>
  );
}
