import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, LogOut, RefreshCw, ShieldAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { storage } from "@/lib/storage";
import { useAppLock } from "@/context/AppLockContext";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { refresh, lock } = useAppLock();
  const [name, setName] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => { setName(storage.getNickname()); }, []);

  const saveName = () => {
    storage.setNickname(name.trim() || "Friend");
    refresh();
    toast.success("Saved");
  };

  const changeLock = () => {
    storage.setLock(null);
    refresh();
    navigate({ to: "/setup-lock" });
  };

  const lockNow = () => {
    lock();
    navigate({ to: "/lock", replace: true });
  };

  const resetAll = () => {
    storage.reset();
    refresh();
    navigate({ to: "/onboarding", replace: true });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Settings</h1>

      <section className="rounded-3xl bg-card/80 p-5 ring-1 ring-border/60">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" /> Nickname
        </div>
        <Label htmlFor="name" className="sr-only">Nickname</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-2xl border-border/70 bg-background"
        />
        <Button onClick={saveName} className="mt-3 h-11 w-full rounded-2xl">Save</Button>
      </section>

      <section className="rounded-3xl bg-card/80 p-5 ring-1 ring-border/60">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Lock className="h-4 w-4" /> Security
        </div>
        <Button onClick={changeLock} variant="secondary" className="h-12 w-full rounded-2xl">
          <RefreshCw className="mr-2 h-4 w-4" /> Change lock method
        </Button>
        <Button onClick={lockNow} variant="outline" className="mt-2 h-12 w-full rounded-2xl">
          <LogOut className="mr-2 h-4 w-4" /> Lock now
        </Button>
      </section>

      <section className="rounded-3xl bg-destructive/10 p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
          <ShieldAlert className="h-4 w-4" /> Danger zone
        </div>
        <p className="text-sm text-muted-foreground">
          Wipe all lists, notes, and the lock from this device. Cannot be undone.
        </p>
        <Button
          variant="destructive"
          onClick={() => setConfirmReset(true)}
          className="mt-3 h-11 w-full rounded-2xl"
        >
          Reset app
        </Button>
      </section>

      <p className="pt-4 text-center text-xs text-muted-foreground">
        Hush keeps everything on this device. Nothing is sent anywhere.
      </p>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset everything?</AlertDialogTitle>
            <AlertDialogDescription>
              All your lists, notes, and the lock will be permanently erased from this phone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground"
              onClick={resetAll}
            >
              Erase all data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
