import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { storage } from "@/lib/storage";

interface AppLockState {
  hydrated: boolean;
  onboarded: boolean;
  hasLock: boolean;
  unlocked: boolean;
  nickname: string;
  refresh: () => void;
  unlock: () => void;
  lock: () => void;
}

const Ctx = createContext<AppLockState | null>(null);

const IDLE_MS = 2 * 60 * 1000;

export function AppLockProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [hasLock, setHasLock] = useState(false);
  const [nickname, setNickname] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [lastActive, setLastActive] = useState(Date.now());

  const refresh = () => {
    setOnboarded(storage.getOnboarded());
    setHasLock(!!storage.getLock());
    setNickname(storage.getNickname());
  };

  useEffect(() => {
    refresh();
    setHydrated(true);
  }, []);

  // Auto-lock on tab refocus after idle
  useEffect(() => {
    if (!hydrated) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastActive > IDLE_MS && hasLock) {
          setUnlocked(false);
        }
        setLastActive(Date.now());
      } else {
        setLastActive(Date.now());
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [hydrated, hasLock, lastActive]);

  const value: AppLockState = {
    hydrated,
    onboarded,
    hasLock,
    unlocked,
    nickname,
    refresh,
    unlock: () => {
      setUnlocked(true);
      setLastActive(Date.now());
    },
    lock: () => setUnlocked(false),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppLock(): AppLockState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppLock outside provider");
  return v;
}
