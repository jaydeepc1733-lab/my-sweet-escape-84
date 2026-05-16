import { Link } from "@tanstack/react-router";
import { ListChecks, NotebookPen, Settings } from "lucide-react";

const items = [
  { to: "/app/lists", label: "Lists", icon: ListChecks },
  { to: "/app/notes", label: "Notes", icon: NotebookPen },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-20 mt-auto border-t border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-md justify-around px-4 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeProps={{ "data-active": "true" } as never}
            className="group flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs text-muted-foreground transition data-[active=true]:text-primary"
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
