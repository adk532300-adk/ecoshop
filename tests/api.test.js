/**
 * EcoShop – API Test Cases
 * 
 * Tests for /api/products and /api/products/[slug] endpoints.
 * 
 * Run with: node tests/api.test.js
 * (Requires dev server running at http://localhost:3000)
 */

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  const json = await res.json();
  return { status: res.status, data: json };
}

// ─── TEST SUITE 1: GET /api/products ──────────────────────────────────────

async function testGetAllProducts() {
  console.log("\n📦 Test Suite 1: GET /api/products (All Products)");
  const { status, data } = await fetchJSON(`${BASE_URL}/api/products`);

  assert(status === 200, "Response status is 200");
  assert(Array.isArray(data), "Response is an array");
  assert(data.length >= 1, "At least 1 product returned");

  if (data.length > 0) {
    const p = data[0];
    assert(typeof p.id === "string", "Product has string id");
    assert(typeof p.name === "string", "Product has string name");
    assert(typeof p.slug === "string", "Product has string slug");
    assert(typeof p.price === "number", "Product has numeric price");
    assert(typeof p.ecoScore === "number", "Product has numeric ecoScore");
    assert(p.ecoScore >= 0 && p.ecoScore <= 10, "EcoScore is between 0 and 10");
    assert(typeof p.category === "string", "Product has string category");
    assert(typeof p.imageUrl === "string", "Product has imageUrl");
  }
}

// ─── TEST SUITE 2: GET /api/products?q=bamboo ─────────────────────────────

async function testSearchProducts() {
  console.log("\n🔍 Test Suite 2: GET /api/products?q=bamboo (Search)");
  const { status, data } = await fetchJSON(`${BASE_URL}/api/products?q=bamboo`);

  assert(status === 200, "Response status is 200");
  assert(Array.isArray(data), "Response is an array");

  if (data.length > 0) {
    const hasBamboo = data.some(
      (p) =>
        p.name.toLowerCase().includes("bamboo") ||
        p.category.toLowerCase().includes("bamboo") ||
        p.description?.toLowerCase().includes("bamboo") ||
        p.material?.toLowerCase().includes("bamboo")
    );
    assert(hasBamboo, "Search results contain bamboo-related product");
    assert(data.length <= 20, "Results capped at reasonable limit");
  }
}

// ─── TEST SUITE 3: GET /api/products?q=nonexistentproductxyz ─────────────

async function testSearchNoResults() {
  console.log("\n🚫 Test Suite 3: GET /api/products?q=nonexistentxyz (No Results)");
  const { status, data } = await fetchJSON(
    `${BASE_URL}/api/products?q=nonexistentproductxyz12345`
  );

  assert(status === 200, "Response status is 200 even for empty results");
  assert(Array.isArray(data), "Response is still an array");
  assert(data.length === 0, "Empty array returned for no matches");
}

// ─── TEST SUITE 4: GET /api/products/bamboo-toothbrush (Valid Slug) ───────

async function testGetProductBySlug() {
  console.log("\n🪥 Test Suite 4: GET /api/products/bamboo-toothbrush (By Slug)");
  const { status, data } = await fetchJSON(
    `${BASE_URL}/api/products/bamboo-toothbrush`
  );

  assert(status === 200, "Response status is 200");
  assert(data.slug === "bamboo-toothbrush", "Correct slug returned");
  assert(data.name.toLowerCase().includes("bamboo"), "Product name includes 'bamboo'");
  assert(typeof data.price === "number", "Price is numeric");
  assert(data.price > 0, "Price is positive");
  assert(typeof data.ecoScore === "number", "EcoScore is numeric");
  assert(typeof data.material === "string", "Material field exists");
}

// ─── TEST SUITE 5: GET /api/products/invalid-slug-xyz (404) ──────────────

async function testGetProductInvalidSlug() {
  console.log("\n❓ Test Suite 5: GET /api/products/invalid-slug-xyz (Not Found)");
  const { status, data } = await fetchJSON(
    `${BASE_URL}/api/products/invalid-slug-xyz-404`
  );

  assert(status === 404, "Response status is 404 for missing product");
  assert(data.error !== undefined, "Error message present in response");
}

// ─── TEST SUITE 6: EcoScore Validation ────────────────────────────────────

async function testEcoScoreRange() {
  console.log("\n🌿 Test Suite 6: EcoScore Range Validation (All Products)");
  const { status, data } = await fetchJSON(`${BASE_URL}/api/products`);

  assert(status === 200, "Products fetch successful");

  if (data.length > 0) {
    const allValidScores = data.every(
      (p) => p.ecoScore >= 1.0 && p.ecoScore <= 10.0
    );
    assert(allValidScores, "All products have EcoScore between 1.0 and 10.0");

    const highEco = data.filter((p) => p.ecoScore >= 8.0);
    assert(highEco.length >= 1, "At least one product has EcoScore ≥ 8.0");
  }
}

// ─── RUNNER ───────────────────────────────────────────────────────────────

async function runAllTests() {
  console.log("=".repeat(60));
  console.log("  🌿 EcoShop API Test Suite");
  console.log(`  Base URL: ${BASE_URL}`);
  console.log("=".repeat(60));

  try {
    await testGetAllProducts();
    await testSearchProducts();
    await testSearchNoResults();
    await testGetProductBySlug();
    await testGetProductInvalidSlug();
    await testEcoScoreRange();
  } catch (err) {
    console.error("\n⚠️  Test runner error:", err.message);
    console.error("  Make sure the dev server is running: npm run dev");
  }

  console.log("\n" + "=".repeat(60));
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
