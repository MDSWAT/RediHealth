import type { OfflineData } from "./offline-types";

type Envelope = { version: 1; salt: string; iv: string; ciphertext: string; key?: CryptoKey };
const DB_NAME = "redihealth-offline-v1";
const STORE = "vault";
const VAULT_ID = "device";
const encode = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};
const decode = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

export async function deriveOfflineKey(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  if (passphrase.length < 12) throw new Error("Use an offline passphrase of at least 12 characters.");
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 600_000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function sealOfflineData(data: OfflineData, key: CryptoKey, salt: string): Promise<Envelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode("redihealth-offline-v1") }, key, new TextEncoder().encode(JSON.stringify(data)));
  return { version: 1, salt, iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) };
}

export async function openOfflineData(envelope: Envelope, passphrase?: string) {
  if (envelope.version !== 1) throw new Error("Unsupported offline data version.");
  if (!envelope.key && !passphrase) throw new Error("Enter the existing offline passphrase once to migrate this device.");
  const key = envelope.key || await deriveOfflineKey(passphrase || "", decode(envelope.salt));
  if (key.type !== "secret" || key.algorithm.name !== "AES-GCM" || key.extractable) throw new Error("Invalid offline device key.");
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode(envelope.iv), additionalData: new TextEncoder().encode("redihealth-offline-v1") }, key, decode(envelope.ciphertext));
  } catch {
    throw new Error(envelope.key ? "Damaged encrypted storage or device key." : "Incorrect offline passphrase or damaged encrypted storage.");
  }
  const data = JSON.parse(new TextDecoder().decode(plaintext)) as OfflineData;
  if (data.version !== 1 || !data.identity || !Array.isArray(data.queue) || !Array.isArray(data.patients) || !Array.isArray(data.requests) || !Number.isFinite(data.expiresAt)) throw new Error("Invalid encrypted offline data.");
  return { data, key, salt: envelope.salt };
}

async function vaultRequest<T>(action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Cannot open encrypted device storage."));
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const request = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(new Error("Could not save encrypted device data. Check free disk space and browser storage permissions."));
    });
  } finally { db.close(); }
}

export const readOfflineEnvelope = () => vaultRequest<Envelope | undefined>((store) => store.get(VAULT_ID));
export const hasOfflineVault = async () => Boolean(await readOfflineEnvelope());
export const deleteOfflineVault = () => vaultRequest((store) => store.delete(VAULT_ID));

export async function createOfflineVault(data: OfflineData) {
  if (await hasOfflineVault()) throw new Error("This device already has an encrypted vault. Unlock or remove it first.");
  const salt = "";
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await saveOfflineVault(data, key, salt);
  return { key, salt };
}
export async function saveOfflineVault(data: OfflineData, key: CryptoKey, salt: string) {
  const envelope = await sealOfflineData(data, key, salt);
  await vaultRequest((store) => store.put({ ...envelope, key }, VAULT_ID));
}
