import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, MoreVertical, Trash2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { storage, uid, type Note } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notes")({
  component: NotesPage,
});

function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => { setNotes(storage.getNotes()); }, []);
  const persist = (next: Note[]) => {
    const sorted = [...next].sort((a, b) => b.updatedAt - a.updatedAt);
    setNotes(sorted);
    storage.setNotes(sorted);
  };

  const newNote = () => {
    const n: Note = { id: uid(), title: "", body: "", updatedAt: Date.now() };
    setEditing(n);
  };

  const saveNote = (n: Note) => {
    if (!n.title.trim() && !n.body.trim()) { setEditing(null); return; }
    const exists = notes.some((x) => x.id === n.id);
    const updated = { ...n, updatedAt: Date.now() };
    persist(exists ? notes.map((x) => (x.id === n.id ? updated : x)) : [updated, ...notes]);
    setEditing(null);
  };

  const deleteNote = (id: string) => {
    persist(notes.filter((n) => n.id !== id));
    toast.success("Note deleted");
  };

  if (editing) {
    return (
      <div className="flex min-h-[70vh] flex-col">
        <button
          onClick={() => saveNote(editing)}
          className="mb-4 inline-flex items-center self-start text-sm text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Save & back
        </button>
        <Input
          autoFocus
          placeholder="Title"
          value={editing.title}
          onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          className="h-12 rounded-2xl border-border/70 bg-card/80 font-display text-xl"
        />
        <Textarea
          placeholder="Write what's on your mind…"
          value={editing.body}
          onChange={(e) => setEditing({ ...editing, body: e.target.value })}
          className="mt-3 min-h-[50vh] flex-1 rounded-2xl border-border/70 bg-card/80 text-base leading-relaxed"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl">Your notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Private. Saved on this device only.</p>
        </div>
        <Button onClick={newNote} className="h-11 rounded-2xl px-4">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {notes.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center">
            <p className="font-display text-xl">Nothing yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap + to write your first note.</p>
          </div>
        )}
        {notes.map((n) => (
          <div key={n.id} className="flex gap-3 rounded-2xl bg-card/80 p-4 ring-1 ring-border/60">
            <button onClick={() => setEditing(n)} className="min-w-0 flex-1 text-left">
              <p className="truncate font-medium text-foreground">
                {n.title || "Untitled"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {n.body || "—"}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                {new Date(n.updatedAt).toLocaleDateString(undefined, {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-fit rounded-full p-2 text-muted-foreground hover:bg-secondary">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setConfirmId(n.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The note is permanently removed from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground"
              onClick={() => { if (confirmId) deleteNote(confirmId); setConfirmId(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
