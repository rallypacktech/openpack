// Shared DOM text walking used by both the runtime translator and the
// pre-translation collector. Only text nodes are ever touched — markup,
// attributes, URLs and identifiers are left exactly as written.

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "CODE",
  "PRE",
  "SVG",
  "CANVAS",
  "IFRAME",
]);

function isSkippable(node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  if (parent.closest("[data-no-translate]")) return true;
  return false;
}

function textNodesIn(root) {
  const nodes = [];
  if (!root) return nodes;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (isSkippable(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }
  return nodes;
}

/**
 * Replaces every text node whose trimmed text matches a dictionary key.
 * Surrounding whitespace is preserved so layout never shifts.
 * Returns how many nodes were changed.
 */
export function applyTranslations(root, dictionary) {
  if (!dictionary || dictionary.size === 0) return 0;
  let applied = 0;
  for (const node of textNodesIn(root)) {
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    const translated = dictionary.get(trimmed);
    if (!translated) continue;
    const start = raw.indexOf(trimmed);
    const next = raw.slice(0, start) + translated + raw.slice(start + trimmed.length);
    if (next !== raw) {
      node.nodeValue = next;
      applied += 1;
    }
  }
  return applied;
}

/** Unique translatable strings currently on screen, in document order. */
export function collectSourceStrings(root) {
  const found = new Map();
  for (const node of textNodesIn(root)) {
    const trimmed = node.nodeValue.trim();
    if (trimmed.length < 2 || trimmed.length > 1200) continue;
    if (!/[A-Za-z\u00C0-\u024F]/.test(trimmed)) continue;
    if (!found.has(trimmed)) found.set(trimmed, true);
  }
  return Array.from(found.keys());
}