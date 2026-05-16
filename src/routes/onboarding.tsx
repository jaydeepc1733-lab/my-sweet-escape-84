import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ShoppingBag, NotebookPen, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogo } from "@/components/AppLogo";
import { storage } from "@/lib/storage";
import { useAppLock } from "@/context/AppLockContext";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

type Slide = {
  icon: typeof Sparkles;
  title: string;
  body: string;
};

const slides: Slide[] = [
  { icon: Sparkles, title: "Welcome", body: "Your quiet space for everything you need to remember." },
  { icon: ShoppingBag, title: "Shopping, simplified", body: "Build lists you can check off as you go — no clutter." },
  { icon: NotebookPen, title: "Private notes", body: "Jot down ideas and feelings. They stay on your device." },
  { icon: ShieldCheck, title: "Locked, just for you", body: "Set a PIN, password, or pattern. Everything stays offline." },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { refresh } = useAppLock();

  const isLast = step === slides.length - 1;

  const next = () => {
    if (step === 0) {
      storage.setNickname(name.trim() || "Friend");
    }
    if (isLast) {
      storage.setOnboarded(true);
      refresh();
      navigate({ to: "/setup-lock", replace: true });
    } else {
      setStep(step + 1);
    }
  };

  const Icon = slides[step].icon;

  return (
    <div className="flex min-h-screen flex-col px-6 py-10">
      <header className="flex justify-center">
        <AppLogo />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-3xl pastel-gradient shadow-md ring-1 ring-border/60">
          <Icon size={40} strokeWidth={1.5} className="text-plum" />
        </div>

        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          {slides[step].title}
        </h1>
        <p className="mt-3 max-w-sm text-base text-muted-foreground">{slides[step].body}</p>

        {step === 0 && (
          <div className="mt-8 w-full max-w-xs text-left">
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              What should we call you?
            </Label>
            <Input
              id="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your nickname"
              className="mt-2 h-12 rounded-2xl border-border/70 bg-card/80 text-base"
            />
          </div>
        )}
      </main>

      <footer className="space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
        <Button
          onClick={next}
          size="lg"
          className="h-14 w-full rounded-2xl bg-primary text-base font-medium shadow-md hover:opacity-90"
        >
          {isLast ? "Set up lock" : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {!isLast && (
          <button
            onClick={() => {
              storage.setNickname("Friend");
              storage.setOnboarded(true);
              refresh();
              navigate({ to: "/setup-lock", replace: true });
            }}
            className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        )}
      </footer>
    </div>
  );
}
