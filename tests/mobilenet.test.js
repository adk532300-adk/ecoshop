/**
 * EcoShop – MobileNet Keyword Normalizer Test Cases
 *
 * Tests the semantic keyword mapping that fixes MobileNet misclassifications.
 *
 * Run with: node tests/mobilenet.test.js
 * (No server required — pure logic test)
 */

// ─── Keyword Normalizer (copied from scanner page logic) ──────────────────

const keywordMap = {
  // Personal Care
  toothbrush: "bamboo",
  snorkel: "bamboo",        // MobileNet misclassification fix
  brush: "bamboo",
  dental: "bamboo",
  "electric toothbrush": "bamboo",

  // Kitchen
  cup: "bottle",
  mug: "bottle",
  bowl: "coconut",
  wrap: "beeswax",
  cling: "beeswax",
  "plastic wrap": "beeswax",

  // Stationery
  notebook: "notebook",
  book: "notebook",
  pad: "notebook",
  journal: "notebook",

  // Bags & Accessories
  bag: "tote",
  purse: "tote",
  handbag: "tote",
  "shopping bag": "tote",

  // Personal Care Misc
  shampoo: "shampoo",
  soap: "shampoo",
  lipstick: "lip",
  balm: "lip",

  // Drinkware
  bottle: "bottle",
  flask: "bottle",
  "water bottle": "bottle",

  // Home
  bin: "bags",
  trash: "bags",
  garbage: "bags",
};

function normalizeKeyword(aiLabel) {
  if (!aiLabel) return null;
  const lower = aiLabel.toLowerCase().trim();

  // Direct match
  if (keywordMap[lower]) return keywordMap[lower];

  // Partial match (word-by-word)
  const words = lower.split(/\s+/);
  for (const word of words) {
    if (keywordMap[word]) return keywordMap[word];
  }

  return null;
}

// ─── Test Harness ─────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ FAIL: ${label}`);
    console.log(`         Expected: ${e.expected}`);
    console.log(`         Got:      ${e.actual}`);
    failed++;
  }
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    const err = new Error("Assertion failed");
    err.expected = expected;
    err.actual = actual;
    throw err;
  }
}

// ─── Test Cases ───────────────────────────────────────────────────────────

console.log("=".repeat(60));
console.log("  🧠 MobileNet Keyword Normalizer Tests");
console.log("=".repeat(60));

console.log("\n📌 Suite 1: Direct MobileNet Labels");
test("'toothbrush' maps to 'bamboo'", () =>
  assertEqual(normalizeKeyword("toothbrush"), "bamboo"));
test("'snorkel' maps to 'bamboo' (critical fix)", () =>
  assertEqual(normalizeKeyword("snorkel"), "bamboo"));
test("'cup' maps to 'bottle'", () =>
  assertEqual(normalizeKeyword("cup"), "bottle"));
test("'bowl' maps to 'coconut'", () =>
  assertEqual(normalizeKeyword("bowl"), "coconut"));
test("'notebook' maps to 'notebook'", () =>
  assertEqual(normalizeKeyword("notebook"), "notebook"));
test("'bag' maps to 'tote'", () =>
  assertEqual(normalizeKeyword("bag"), "tote"));
test("'shampoo' maps to 'shampoo'", () =>
  assertEqual(normalizeKeyword("shampoo"), "shampoo"));
test("'bottle' maps to 'bottle'", () =>
  assertEqual(normalizeKeyword("bottle"), "bottle"));

console.log("\n📌 Suite 2: Case Insensitivity");
test("'TOOTHBRUSH' (uppercase) maps correctly", () =>
  assertEqual(normalizeKeyword("TOOTHBRUSH"), "bamboo"));
test("'Snorkel' (mixed case) maps correctly", () =>
  assertEqual(normalizeKeyword("Snorkel"), "bamboo"));
test("'NOTEBOOK' maps correctly", () =>
  assertEqual(normalizeKeyword("NOTEBOOK"), "notebook"));

console.log("\n📌 Suite 3: Compound MobileNet Labels");
test("'electric toothbrush' maps to 'bamboo'", () =>
  assertEqual(normalizeKeyword("electric toothbrush"), "bamboo"));
test("'plastic wrap' maps to 'beeswax'", () =>
  assertEqual(normalizeKeyword("plastic wrap"), "beeswax"));
test("'water bottle' maps to 'bottle'", () =>
  assertEqual(normalizeKeyword("water bottle"), "bottle"));

console.log("\n📌 Suite 4: Partial Word Match");
test("'dental floss' partially matches 'dental' → 'bamboo'", () =>
  assertEqual(normalizeKeyword("dental floss"), "bamboo"));
test("'garbage can' partially matches 'garbage' → 'bags'", () =>
  assertEqual(normalizeKeyword("garbage can"), "bags"));

console.log("\n📌 Suite 5: Unknown Labels (No Match)");
test("'airplane' returns null (no eco match)", () =>
  assertEqual(normalizeKeyword("airplane"), null));
test("'television' returns null", () =>
  assertEqual(normalizeKeyword("television"), null));
test("null input returns null", () =>
  assertEqual(normalizeKeyword(null), null));
test("empty string returns null", () =>
  assertEqual(normalizeKeyword(""), null));

// ─── Results ──────────────────────────────────────────────────────────────

console.log("\n" + "=".repeat(60));
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(60));

if (failed > 0) process.exit(1);
