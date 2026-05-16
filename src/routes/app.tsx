import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppLock } from "@/context/AppLockContext";
import { AppLogo } from "@/components/AppLogo";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { hydrated, onboarded, hasLock, unlocked } = useAppLock();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!onboarded) navigate({ to: "/onboarding", replace: true });
    else if (!hasLock) navigate({ to: "/setup-lock", replace: true });
    else if (!unlocked) navigate({ to: "/lock", replace: true });
  }, [hydrated, onboarded, hasLock, unlocked, navigate]);

  if (!hydrated || !unlocked) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-center border-b border-border/40 bg-background/85 px-6 py-4 backdrop-blur-md">
        <AppLogo />
      </header>
      <main className="flex-1 px-5 pb-24 pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
