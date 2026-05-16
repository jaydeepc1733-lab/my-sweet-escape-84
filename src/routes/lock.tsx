import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLogo } from "@/components/AppLogo";
import { PinPad } from "@/components/PinPad";
import { PatternLock } from "@/components/PatternLock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { verifySecret } from "@/lib/crypto";
import { useAppLock } from "@/context/AppLockContext";
import { toast } from "sonner";

export const Route = createFileRoute("/lock")({
  component: LockScreen,
});

function LockScreen() {
  const navigate = useNavigate();
  const { hydrated, unlock, nickname } = useAppLock();
  const [cfg, setCfg] = useState<ReturnType<typeof storage.getLock>>(null);
  const [pin, setPin] = useState("");
  const [pw, setPw] = useState("");
  const [pat, setPat] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const c = storage.getLock();
    if (!c) navigate({ to: "/setup-lock", replace: true });
    else setCfg(c);
  }, [hydrated, navigate]);

  const tryUnlock = async (secret: string) => {
    if (!cfg) return;
    const ok = await verifySecret(secret, cfg.salt, cfg.hash);
    if (ok) {
      unlock();
      navigate({ to: "/app/lists", replace: true });
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setPin(""); setPw(""); setPat([]);
      toast.error("Incorrect, try again");
    }
  };

  useEffect(() => {
    if (cfg?.method === "pin" && pin.length >= 4 && pin.length === cfg.hash.length) {
      // length unknown — only auto-submit when user reaches 6
    }
    if (cfg?.method === "pin" && pin.length === 6) tryUnlock(pin);
  }, [pin, cfg]);

  if (!cfg) return null;

  return (
    <div className={`flex min-h-screen flex-col px-6 py-10 ${shake ? "animate-shake" : ""}`}>
      <header className="flex justify-center">
        <AppLogo />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center">
        <h1 className="font-display text-3xl">Welcome back{nickname ? `, ${nickname}` : ""}</h1>
        <p className="mb-8 mt-1 text-sm text-muted-foreground">
          Enter your {cfg.method} to continue
        </p>

        {cfg.method === "pin" && (
          <>
            <PinPad value={pin} onChange={setPin} />
            <Button onClick={() => tryUnlock(pin)} className="mt-6 h-12 rounded-2xl px-8">
              Unlock
            </Button>
          </>
        )}

        {cfg.method === "password" && (
          <div className="w-full max-w-xs space-y-4">
            <Input
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tryUnlock(pw)}
              placeholder="Your password"
              className="h-14 rounded-2xl border-border/70 bg-card/80 text-center text-base"
            />
            <Button onClick={() => tryUnlock(pw)} className="h-14 w-full rounded-2xl">
              Unlock
            </Button>
          </div>
        )}

        {cfg.method === "pattern" && (
          <>
            <PatternLock
              value={pat}
              onChange={setPat}
              onComplete={(p) => p.length >= 4 && tryUnlock(p.join("-"))}
            />
            <button onClick={() => setPat([])} className="mt-3 text-xs text-muted-foreground">
              Clear
            </button>
          </>
        )}
      </main>
    </div>
  );
}
