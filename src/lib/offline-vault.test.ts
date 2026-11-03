import { describe, expect, it } from "vitest";
import { createDemoData } from "./demo-panel";
import { deriveOfflineKey, openOfflineData, sealOfflineData } from "./offline-vault";
import type { OfflineData } from "./offline-types";

function data(): OfflineData {
  const demo = createDemoData();
  return { version: 1, deviceId: "test", identity: { email: "doctor@example.test", workerId: "2", workerName: "Dr. Demo", role: "Doctor", country: "RO" }, authorizedAt: Date.now(), expiresAt: Date.now() + 100000, revisions: {}, queue: [], patients: demo.patients, requests: demo.requests };
}
describe("offline vault cryptography", () => {
  it("opens a structured-cloned device key without a password and rejects damaged ciphertext", async () => {
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    const original = data();
    original.queue.push({ operationId: "pending", entity: "patient", id: "1", create: false, revision: "base", changes: { phone: "000" } });
    const saved = structuredClone({ ...await sealOfflineData(original, key, ""), key });
    const opened = await openOfflineData(saved);
    expect(opened.data).toEqual(original);
    expect(opened.key.extractable).toBe(false);
    await expect(crypto.subtle.exportKey("raw", opened.key)).rejects.toThrow();
    expect(JSON.stringify(saved)).not.toContain(original.identity.email);
    const wrongKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    await expect(openOfflineData({ ...saved, key: wrongKey })).rejects.toThrow("Damaged");
    saved.ciphertext = (saved.ciphertext[0] === "A" ? "B" : "A") + saved.ciphertext.slice(1);
    await expect(openOfflineData(saved)).rejects.toThrow("Damaged");
  });
  it("requires a legacy passphrase once and preserves pending work through key migration", async () => {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const salt = btoa(String.fromCharCode(...saltBytes));
    const key = await deriveOfflineKey("test-offline-passphrase", saltBytes);
    const original = data();
    original.queue.push({ operationId: "pending", entity: "request", id: "1", create: false, revision: "base", changes: { status: "resolved" } });
    const legacy = await sealOfflineData(original, key, salt);
    await expect(openOfflineData(legacy)).rejects.toThrow("existing offline passphrase");
    const unlocked = await openOfflineData(legacy, "test-offline-passphrase");
    const migrated = structuredClone({ ...await sealOfflineData(unlocked.data, unlocked.key, unlocked.salt), key: unlocked.key });
    expect((await openOfflineData(migrated)).data).toEqual(original);
  });
  it("encrypts attachments and identifiers, round-trips with a non-extractable key and fresh IVs", async () => {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const salt = btoa(String.fromCharCode(...saltBytes));
    const key = await deriveOfflineKey("test-offline-passphrase", saltBytes);
    const sealed = await sealOfflineData(data(), key, salt);
    expect(key.extractable).toBe(false);
    expect(JSON.stringify(sealed)).not.toContain("Maria Demo");
    expect(JSON.stringify(sealed)).not.toContain("data:image");
    expect((await openOfflineData(sealed, "test-offline-passphrase")).data.patients[0].intake?.documents[0].name).toBe("demo-document.png");
    expect((await sealOfflineData(data(), key, salt)).iv).not.toBe(sealed.iv);
  });
  it("rejects weak passphrases, wrong keys and tampering", async () => {
    const salt = new Uint8Array(16);
    await expect(deriveOfflineKey("short", salt)).rejects.toThrow("12");
    const key = await deriveOfflineKey("test-offline-passphrase", salt);
    const sealed = await sealOfflineData(data(), key, btoa(String.fromCharCode(...salt)));
    await expect(openOfflineData(sealed, "wrong-offline-passphrase")).rejects.toThrow("Incorrect");
    sealed.ciphertext = (sealed.ciphertext[0] === "A" ? "B" : "A") + sealed.ciphertext.slice(1);
    await expect(openOfflineData(sealed, "test-offline-passphrase")).rejects.toThrow("Incorrect");
  });
});
