// LocalStorage helpers. Always guard with isClient() to avoid SSR crashes.

export const isClient = () => typeof window !== "undefined";

export type LockMethod = "pin" | "password" | "pattern";

export interface LockConfig {
  method: LockMethod;
  salt: string;
  hash: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

export interface ShoppingItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  updatedAt: number;
}

const KEYS = {
  onboarded: "sc.onboarded",
  nickname: "sc.nickname",
  lock: "sc.lockConfig",
  notes: "sc.notes",
  lists: "sc.lists",
} as const;

function read<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isClient()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getOnboarded: () => read<boolean>(KEYS.onboarded, false),
  setOnboarded: (v: boolean) => write(KEYS.onboarded, v),

  getNickname: () => read<string>(KEYS.nickname, ""),
  setNickname: (v: string) => write(KEYS.nickname, v),

  getLock: () => read<LockConfig | null>(KEYS.lock, null),
  setLock: (v: LockConfig | null) => write(KEYS.lock, v),

  getNotes: () => read<Note[]>(KEYS.notes, []),
  setNotes: (v: Note[]) => write(KEYS.notes, v),

  getLists: () => read<ShoppingList[]>(KEYS.lists, []),
  setLists: (v: ShoppingList[]) => write(KEYS.lists, v),

  reset: () => {
    if (!isClient()) return;
    Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  },
};

export const uid = () =>
  isClient() && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
