import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, MoreVertical, Trash2, Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { storage, uid, type ShoppingList } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/app/lists")({
  component: ListsPage,
});

function ListsPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => { setLists(storage.getLists()); }, []);
  const persist = (next: ShoppingList[]) => { setLists(next); storage.setLists(next); };

  const active = lists.find((l) => l.id === activeId) || null;

  const addList = () => {
    const name = newName.trim();
    if (!name) return;
    const list: ShoppingList = { id: uid(), name, items: [], updatedAt: Date.now() };
    persist([list, ...lists]);
    setNewName("");
    setActiveId(list.id);
  };

  const deleteList = (id: string) => {
    persist(lists.filter((l) => l.id !== id));
    if (activeId === id) setActiveId(null);
    toast.success("List deleted");
  };

  if (active) return <ListDetail list={active} onBack={() => setActiveId(null)} onChange={(l) => {
    persist(lists.map((x) => (x.id === l.id ? l : x)));
  }} />;

  return (
    <div>
      <h1 className="font-display text-3xl">Your lists</h1>
      <p className="mt-1 text-sm text-muted-foreground">Plan your trips. Check things off as you go.</p>

      <div className="mt-6 flex gap-2">
        <Input
          placeholder="New list name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addList()}
          className="h-12 rounded-2xl border-border/70 bg-card/80"
        />
        <Button onClick={addList} className="h-12 rounded-2xl px-4">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {lists.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center">
            <p className="font-display text-xl text-foreground">No lists yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add one above to get started.</p>
          </div>
        )}
        {lists.map((l) => {
          const done = l.items.filter((i) => i.done).length;
          return (
            <div
              key={l.id}
              className="flex items-center gap-3 rounded-2xl bg-card/80 p-4 ring-1 ring-border/60"
            >
              <button onClick={() => setActiveId(l.id)} className="flex-1 text-left">
                <p className="font-medium text-foreground">{l.name}</p>
                <p className="text-xs text-muted-foreground">
                  {l.items.length === 0 ? "Empty" : `${done}/${l.items.length} done`}
                </p>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setConfirmId(l.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete list
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes it from your phone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground"
              onClick={() => { if (confirmId) deleteList(confirmId); setConfirmId(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ListDetail({
  list,
  onBack,
  onChange,
}: {
  list: ShoppingList;
  onBack: () => void;
  onChange: (l: ShoppingList) => void;
}) {
  const [text, setText] = useState("");

  const addItem = () => {
    const t = text.trim();
    if (!t) return;
    onChange({
      ...list,
      items: [...list.items, { id: uid(), text: t, done: false }],
      updatedAt: Date.now(),
    });
    setText("");
  };

  const toggle = (id: string) =>
    onChange({
      ...list,
      items: list.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
      updatedAt: Date.now(),
    });

  const remove = (id: string) =>
    onChange({ ...list, items: list.items.filter((i) => i.id !== id), updatedAt: Date.now() });

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> All lists
      </button>
      <h1 className="font-display text-3xl">{list.name}</h1>

      <div className="mt-5 flex gap-2">
        <Input
          placeholder="Add item…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="h-12 rounded-2xl border-border/70 bg-card/80"
        />
        <Button onClick={addItem} className="h-12 rounded-2xl px-4">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <ul className="mt-6 space-y-2">
        {list.items.length === 0 && (
          <p className="rounded-2xl bg-card/50 p-6 text-center text-sm text-muted-foreground">
            No items yet
          </p>
        )}
        {list.items.map((i) => (
          <li
            key={i.id}
            className="flex items-center gap-3 rounded-2xl bg-card/80 p-3 ring-1 ring-border/60"
          >
            <button
              onClick={() => toggle(i.id)}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                i.done ? "bg-primary text-primary-foreground" : "ring-1 ring-border"
              }`}
              aria-label="Toggle"
            >
              {i.done && <Check className="h-4 w-4" />}
            </button>
            <span className={`flex-1 ${i.done ? "text-muted-foreground line-through" : ""}`}>
              {i.text}
            </span>
            <button
              onClick={() => remove(i.id)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
