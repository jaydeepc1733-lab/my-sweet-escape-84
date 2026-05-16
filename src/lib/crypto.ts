// SHA-256 hashing for the offline app lock. Uses Web Crypto (client only).

export function randomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashSecret(secret: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}::${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifySecret(secret: string, salt: string, hash: string): Promise<boolean> {
  const h = await hashSecret(secret, salt);
  return h === hash;
}
