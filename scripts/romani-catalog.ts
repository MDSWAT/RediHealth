import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { extractRomaniMessages, validateRomaniCatalog, type RomaniCatalog } from "./lib/romani-catalog";

const root = process.cwd();
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? files(absolute) : /\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name) ? [absolute] : [];
  });
}
function currentCatalog(): RomaniCatalog {
  return {
    format: "redihealth-translations-v1", sourceLanguage: "en", targetLanguage: "rom",
    variety: "Standard written Romani used in Romania",
    messages: files(path.join(root, "src")).flatMap(file => extractRomaniMessages(path.relative(root, file).replaceAll("\\", "/"), readFileSync(file, "utf8"))),
  };
}

const [command = "export", input] = process.argv.slice(2);
const expected = currentCatalog();
const directory = path.join(root, "localization", "romani");
if (command === "export") {
  const destination = path.join(directory, "catalog.json");
  if (existsSync(destination)) {
    const previous = JSON.parse(readFileSync(destination, "utf8")) as RomaniCatalog;
    if (previous.variety !== expected.variety || !Array.isArray(previous.messages)) throw new Error("Existing catalog is invalid; refusing to overwrite it.");
    const translations = new Map(previous.messages.map(message => [message.id, message]));
    expected.messages = expected.messages.map(message => {
      const old = translations.get(message.id);
      return old?.source === message.source ? { ...message, translation: old.translation, status: old.status, reviewer: old.reviewer } : message;
    });
  }
  mkdirSync(directory, { recursive: true });
  writeFileSync(destination, JSON.stringify(expected, null, 2) + "\n");
  console.log(`Exported ${expected.messages.length} messages from ${new Set(expected.messages.map(message => message.file)).size} files to localization/romani/catalog.json.`);
} else if (command === "check" || command === "import") {
  if (!input) throw new Error(`Usage: npm run romani:${command} -- <translated-catalog.json>`);
  const candidate: unknown = JSON.parse(readFileSync(path.resolve(input), "utf8"));
  const errors = validateRomaniCatalog(expected, candidate);
  if (errors.length) {
    console.error(errors.slice(0, 15).join("\n"));
    console.error(`${errors.length} validation errors. No translations imported.`);
    process.exitCode = 1;
  } else {
    if (command === "import") {
      mkdirSync(directory, { recursive: true });
      writeFileSync(path.join(directory, "reviewed.json"), JSON.stringify(candidate, null, 2) + "\n");
    }
    console.log(`${expected.messages.length} reviewed messages validated.${command === "import" ? " Saved the reviewed handoff bundle; this does not publish a website locale." : ""}`);
  }
} else throw new Error("Choose export, check or import.");
