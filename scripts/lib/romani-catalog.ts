import { createHash } from "node:crypto";
import ts from "typescript";

export type RomaniMessage = {
  id: string;
  file: string;
  context: string;
  line: number;
  source: string;
  placeholders: string[];
  translation: string;
  status: "needs_translation" | "translated" | "reviewed";
  reviewer: string;
};

export type RomaniCatalog = {
  format: "redihealth-translations-v1";
  sourceLanguage: "en";
  targetLanguage: "rom";
  variety: "Standard written Romani used in Romania";
  messages: RomaniMessage[];
};

export function placeholders(text: string): string[] {
  return [...text.matchAll(/\{[A-Za-z_][A-Za-z0-9_]*\}/g)].map(match => match[0]).sort();
}

const technicalKeys = new Set([
  "id", "slug", "categorySlug", "relatedTopicSlug", "href", "url", "icon", "glyph", "key", "code", "type",
  "partId", "regionId", "systemId", "tissue", "kind", "applicableSex", "actionHref", "assistantHref", "mediatorHref",
  "image", "src", "color", "className", "lang", "locale", "openGraphLocale", "country_code", "unit", "units",
  "phonePlaceholder", "path", "accent", "tone",
]);
const configContexts = /(?:LANG_TO_COUNTRY|LANG_TO_LOCALE|responseLanguageLabel|VOICE_LOCALES|SPEECH_LANG|LANGS|LOCALE_DATE_MAP|DEVICE_VOICE_LANG|PREFERRED_REGIONAL_TAGS|TERMS_LINKS|langToLocale|offlineDateLocale)/;

function propertyName(node: ts.Node, source: ts.SourceFile): string | undefined {
  const named = node as ts.NamedDeclaration;
  if (!named.name) return undefined;
  return ts.isIdentifier(named.name) || ts.isStringLiteral(named.name) || ts.isNumericLiteral(named.name)
    ? named.name.text : named.name.getText(source);
}

/** Extracts messages, never evaluating components, importing application code, or loading environment files. */
export function extractRomaniMessages(file: string, text: string): RomaniMessage[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const variables = new Map<string, ts.Expression>();
  const messages: RomaniMessage[] = [];
  const seen = new Set<number>();
  function collectVariables(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) variables.set(node.name.text, node.initializer);
    ts.forEachChild(node, collectVariables);
  }
  collectVariables(source);

  function resolve(expression: ts.Expression): ts.Expression {
    return ts.isIdentifier(expression) ? variables.get(expression.text) ?? expression : expression;
  }

  function contextOf(node: ts.Node): string {
    const parts: string[] = [];
    for (let current: ts.Node | undefined = node; current && current !== source; current = current.parent) {
      const name = propertyName(current, source);
      if (name) parts.unshift(name);
      else if (ts.isArrayLiteralExpression(current.parent)) parts.unshift(String(current.parent.elements.indexOf(current as ts.Expression)));
    }
    return parts.join(".") || "message";
  }

  function add(node: ts.Node, value: string, key: string) {
    if (seen.has(node.pos) || !/[A-Za-z]/.test(value) || technicalKeys.has(key)) return;
    if (/^(?:https?:|\/|#|mailto:|tel:)/.test(value) || /\S+@\S+\.\S+/.test(value)) return;
    if (/^(?:[a-z]{2,3}[-_][A-Za-z]{2,4}|[a-z]+(?:[-_][a-z0-9]+)+|[A-Z_]{2,})$/.test(value)) return;
    const context = contextOf(node);
    if (configContexts.test(context)) return;
    seen.add(node.pos);
    messages.push({
      id: createHash("sha256").update(`${file}\n${context}\n${value}`).digest("hex").slice(0, 24),
      file, context, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      source: value, placeholders: placeholders(value), translation: "", status: "needs_translation", reviewer: "",
    });
  }

  function scan(node: ts.Node, key = "") {
    if (ts.isPropertyAssignment(node)) { scan(node.initializer, propertyName(node, source) ?? key); return; }
    if (ts.isTemplateExpression(node)) {
      let value = node.head.text;
      node.templateSpans.forEach((span, index) => { value += `{__slot_${index}}${span.literal.text}`; });
      add(node, value, key);
      // Nested conditional messages still need their own translations.
      for (const span of node.templateSpans) findEnglishRoots(span.expression);
      return;
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      if (ts.isBinaryExpression(parent) || ts.isElementAccessExpression(parent) || ts.isPropertyAccessExpression(parent) || ts.isCallExpression(parent)) return;
      add(node, node.text, key);
      return;
    }
    ts.forEachChild(node, child => scan(child, key));
  }

  function isEnglishCondition(node: ts.Expression): boolean {
    return ts.isBinaryExpression(node) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(node.operatorToken.kind)
      && ts.isStringLiteral(node.right) && node.right.text === "en";
  }

  function findEnglishRoots(node: ts.Node) {
    if (ts.isObjectLiteralExpression(node)) {
      const props = new Map(node.properties.map(prop => [propertyName(prop, source), prop]));
      const english = props.get("en");
      if (english && (props.has("ro") || (props.has("sq") && props.has("it")))) {
        if (ts.isPropertyAssignment(english)) scan(resolve(english.initializer));
        else if (ts.isShorthandPropertyAssignment(english)) {
          const expression = variables.get("en");
          if (expression) scan(expression);
        }
        return;
      }
    }
    if (ts.isConditionalExpression(node) && isEnglishCondition(node.condition)) scan(node.whenTrue);
    if (ts.isIfStatement(node) && isEnglishCondition(node.expression)) scan(node.thenStatement);
    if (ts.isCaseClause(node) && ts.isStringLiteral(node.expression) && node.expression.text === "en") node.statements.forEach(statement => scan(statement));
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && /_EN$/.test(node.name.text) && node.initializer) scan(node.initializer);
    // These English email templates are the final branch after explicit locale checks.
    if (file.endsWith("/QuickTemplatesModal.tsx") && ts.isReturnStatement(node) && node.expression && node.expression.getText(source).includes('greet("Hello"')) scan(node.expression);
    ts.forEachChild(node, findEnglishRoots);
  }
  findEnglishRoots(source);
  return messages;
}

/** Rejects stale, missing, unreviewed or damaged translations before producing a handoff bundle. */
export function validateRomaniCatalog(expected: RomaniCatalog, candidate: unknown): string[] {
  if (!candidate || typeof candidate !== "object") return ["Catalog must be an object."];
  const catalog = candidate as Partial<RomaniCatalog>;
  if (catalog.format !== expected.format || catalog.targetLanguage !== "rom" || catalog.sourceLanguage !== "en" || catalog.variety !== expected.variety) return ["Catalog format, language or Romani variety does not match."];
  if (!Array.isArray(catalog.messages)) return ["Catalog messages must be an array."];
  const errors: string[] = [];
  const entries = new Map<string, RomaniMessage>();
  const expectedIds = new Set(expected.messages.map(message => message.id));
  for (const entry of catalog.messages) {
    if (!entry || typeof entry.id !== "string") { errors.push("Invalid message entry."); continue; }
    if (entries.has(entry.id)) errors.push(`Duplicate message: ${entry.id}`);
    if (!expectedIds.has(entry.id)) errors.push(`Unknown or stale message: ${entry.id}`);
    entries.set(entry.id, entry);
  }
  for (const message of expected.messages) {
    const entry = entries.get(message.id);
    if (!entry) { errors.push(`Missing message: ${message.id}`); continue; }
    if (entry.source !== message.source || entry.file !== message.file || entry.context !== message.context) errors.push(`Source changed: ${message.id}`);
    if (typeof entry.translation !== "string" || !entry.translation.trim()) { errors.push(`Missing translation: ${message.id}`); continue; }
    if (entry.status !== "reviewed" || typeof entry.reviewer !== "string" || !entry.reviewer.trim()) errors.push(`Review required: ${message.id}`);
    if (JSON.stringify(placeholders(entry.translation)) !== JSON.stringify(message.placeholders)) errors.push(`Placeholders changed: ${message.id}`);
    const numbers = (text: string) => [...text.matchAll(/\d+(?:[.,]\d+)*/g)].map(match => match[0]).sort();
    // Ignore numbers in generated placeholder names, which translators may reorder.
    const withoutSlots = (text: string) => text.replace(/\{[A-Za-z_][A-Za-z0-9_]*\}/g, "");
    if (JSON.stringify(numbers(withoutSlots(entry.translation))) !== JSON.stringify(numbers(withoutSlots(message.source)))) errors.push(`Numbers changed: ${message.id}`);
    const links = (text: string) => [...text.matchAll(/(?:https?:\/\/|mailto:|tel:)[^\s<>"']+/g)].map(match => match[0]).sort();
    if (JSON.stringify(links(entry.translation)) !== JSON.stringify(links(message.source))) errors.push(`Links changed: ${message.id}`);
  }
  return errors;
}
