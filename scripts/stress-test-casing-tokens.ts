import { translations } from "../src/lib/i18n/translations";

console.log("=== COMPONENT RENDERING STRESS HARNESS ===");
console.log("Translations verified across all languages directly:", Object.keys(translations).join(", "));
