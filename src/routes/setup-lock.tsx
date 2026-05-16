import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppLogo } from "@/components/AppLogo";
import { PinPad } from "@/components/PinPad";
import { PatternLock } from "@/components/PatternLock";
import { hashSecret, randomSalt } from "@/lib/crypto";
import { storage, type LockMethod } from "@/lib/storage";
import { useAppLock } from "@/context/AppLockContext";
import { toast } from "sonner";

export const Route = createFileRoute("/setup-lock")({
  component: SetupLock,
});

function SetupLock() {
  const navigate = useNavigate();
  const { refresh, unlock } = useAppLock();
  const [method, setMethod] = useState<LockMethod>("pin");
  const [step, setStep] = useState<"enter" | "confirm">("enter");

  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pat, setPat] = useState<number[]>([]);
  const [pat2, setPat2] = useState<number[]>([]);

  const reset = () => {
    setStep("enter");
    setPin(""); setPin2(""); setPw(""); setPw2(""); setPat([]); setPat2([]);
  };

  const save = async (secret: string) => {
    const salt = randomSalt();
    const hash = await hashSecret(secret, salt);
    storage.setLock({ method, salt, hash });
    refresh();
    unlock();
    toast.success("Lock set. Welcome in.");
    navigate({ to: "/app/lists", replace: true });
  };

  const onContinue = async () => {
    if (method === "pin") {
      if (pin.length < 4) return toast.error("PIN must be 4–6 digits");
      if (step === "enter") return setStep("confirm");
      if (pin !== pin2) { toast.error("PINs don't match"); return reset(); }
      await save(pin);
    } else if (method === "password") {
      if (pw.length < 4) return toast.error("Use at least 4 characters");
      if (step === "enter") return setStep("confirm");
      if (pw !== pw2) { toast.error("Passwords don't match"); return reset(); }
      await save(pw);
    } else {
      if (pat.length < 4) return toast.error("Connect at least 4 dots");
      if (step === "enter") { setStep("confirm"); return; }
      if (pat.join("-") !== pat2.join("-")) { toast.error("Patterns don't match"); return reset(); }
      await save(pat.join("-"));
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <button
          onClick={() => (step === "confirm" ? reset() : navigate({ to: "/onboarding" }))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card/60 ring-1 ring-border/60"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <AppLogo size="sm" />
        <div className="w-10" />
      </header>

      <div className="mt-8 text-center">
        <h1 className="font-display text-3xl">{step === "enter" ? "Create your lock" : "Confirm it"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "enter"
            ? "Pick how you'd like to unlock the app."
            : "Enter it once more to make sure."}
        </p>
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center">
        <Tabs
          value={method}
          onValueChange={(v) => { setMethod(v as LockMethod); reset(); }}
          className="w-full max-w-xs"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-card/60 p-1">
            <TabsTrigger value="pin" className="rounded-xl">PIN</TabsTrigger>
            <TabsTrigger value="password" className="rounded-xl">Password</TabsTrigger>
            <TabsTrigger value="pattern" className="rounded-xl">Pattern</TabsTrigger>
          </TabsList>

          <TabsContent value="pin" className="mt-8 flex flex-col items-center">
            <PinPad value={step === "enter" ? pin : pin2} onChange={step === "enter" ? setPin : setPin2} />
          </TabsContent>

          <TabsContent value="password" className="mt-8 w-full">
            <Input
              type="password"
              autoFocus
              placeholder="Enter password"
              value={step === "enter" ? pw : pw2}
              onChange={(e) => (step === "enter" ? setPw : setPw2)(e.target.value)}
              className="h-14 rounded-2xl border-border/70 bg-card/80 text-center text-base"
            />
          </TabsContent>

          <TabsContent value="pattern" className="mt-8 flex flex-col items-center">
            <PatternLock
              value={step === "enter" ? pat : pat2}
              onChange={step === "enter" ? setPat : setPat2}
            />
            <button
              onClick={() => (step === "enter" ? setPat([]) : setPat2([]))}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>If you forget your {method}, your data cannot be recovered. Everything stays on this device.</p>
      </div>

      <Button
        onClick={onContinue}
        size="lg"
        className="mt-4 h-14 rounded-2xl bg-primary text-base font-medium shadow-md"
      >
        {step === "enter" ? "Continue" : "Confirm & save"}
      </Button>
    </div>
  );
}
