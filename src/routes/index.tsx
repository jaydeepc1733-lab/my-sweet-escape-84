import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppLock } from "@/context/AppLockContext";
import { AppLogo } from "@/components/AppLogo";

export const Route = createFileRoute("/")({
  component: Gatekeeper,
});

function Gatekeeper() {
  const { hydrated, onboarded, hasLock, unlocked } = useAppLock();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!onboarded) navigate({ to: "/onboarding", replace: true });
    else if (!hasLock) navigate({ to: "/setup-lock", replace: true });
    else if (!unlocked) navigate({ to: "/lock", replace: true });
    else navigate({ to: "/app/lists", replace: true });
  }, [hydrated, onboarded, hasLock, unlocked, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">
        <AppLogo size="lg" />
      </div>
    </div>
  );
}
