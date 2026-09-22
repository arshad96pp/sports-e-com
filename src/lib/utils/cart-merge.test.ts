import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canonicalizeGuestLines,
  cartLineKey,
  mergeCartLines,
  toGuestCartPayload,
  type CartLine,
  type CatalogVariant,
} from "./cart-merge";

const A = "product-a";
const B = "product-b";
const variantM = "variant-m";
const variantL = "variant-l";
const variantS = "variant-s";

const variants = new Map<string, CatalogVariant>([
  [variantS, { id: variantS, productId: A, size: "S", color: null }],
  [variantM, { id: variantM, productId: A, size: "M", color: null }],
  [variantL, { id: variantL, productId: A, size: "L", color: null }],
]);
const products = new Set([A, B]);

function line(
  productId: string,
  quantity: number,
  variantId: string | null = null,
  size: string | null = null
): CartLine {
  return { productId, variantId, quantity, size, color: null };
}

test("TEST 1: distinct products union", () => {
  const merged = mergeCartLines([line(B, 1)], [line(A, 1)]);
  assert.deepEqual(
    merged.map((l) => [l.productId, l.quantity]).sort(),
    [
      [A, 1],
      [B, 1],
    ]
  );
});

test("TEST 2: same product quantities add, no duplicate row", () => {
  const merged = mergeCartLines([line(A, 1)], [line(A, 2)]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0]?.quantity, 3);
});

test("TEST 3: same variant quantities add", () => {
  const merged = mergeCartLines([line(A, 1, variantM, "M")], [line(A, 2, variantM, "M")]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0]?.quantity, 3);
  assert.equal(merged[0]?.variantId, variantM);
});

test("TEST 4: different variants stay separate", () => {
  const merged = mergeCartLines([line(A, 1, variantL, "L")], [line(A, 1, variantM, "M")]);
  assert.equal(merged.length, 2);
  const byVariant = Object.fromEntries(merged.map((l) => [l.variantId, l.quantity]));
  assert.equal(byVariant[variantM], 1);
  assert.equal(byVariant[variantL], 1);
});

test("TEST 5: guest items land in an empty DB cart", () => {
  const merged = mergeCartLines([], [line(A, 1)]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0]?.productId, A);
});

test("TEST 6: empty guest cart leaves DB cart unchanged", () => {
  const db = [line(A, 1)];
  const merged = mergeCartLines(db, []);
  assert.deepEqual(merged, db);
});

test("TEST 8: re-merging after success would double — callers must clear guest cart first", () => {
  const afterLogin = mergeCartLines([line(A, 2, variantM, "M")], [line(A, 1, variantM, "M")]);
  assert.equal(afterLogin[0]?.quantity, 3);
  const mistakenRetry = mergeCartLines(afterLogin, [line(A, 1, variantM, "M")]);
  assert.equal(mistakenRetry[0]?.quantity, 4);
});

test("TEST 9: every guest product/variant survives", () => {
  const merged = mergeCartLines(
    [line(A, 1, variantM, "M"), line(B, 1, variantL, "L")],
    [line(A, 1, variantS, "S"), line(A, 2, variantM, "M")]
  );
  const byKey = Object.fromEntries(merged.map((l) => [cartLineKey(l), l.quantity]));
  assert.equal(byKey[cartLineKey(line(A, 0, variantS, "S"))], 1);
  assert.equal(byKey[cartLineKey(line(A, 0, variantM, "M"))], 3);
  assert.equal(byKey[cartLineKey(line(B, 0, variantL, "L"))], 1);
});

test("TEST 10: deleted/non-existent variant is skipped, no crash", () => {
  const guest = canonicalizeGuestLines(
    [line(A, 1, variantM, "M"), line(A, 1, "missing-variant", "XL")],
    products,
    variants
  );
  assert.equal(guest.length, 1);
  assert.equal(guest[0]?.variantId, variantM);
});

test("TEST 11: variant belonging to a different product is skipped", () => {
  const guest = canonicalizeGuestLines([line(B, 1, variantM, "M")], products, variants);
  assert.equal(guest.length, 0);
});

test("canonical variant size wins over a stale guest size string", () => {
  const guest = canonicalizeGuestLines([line(A, 2, variantM, "medium")], products, variants);
  assert.equal(guest[0]?.size, "M");
  assert.equal(guest[0]?.quantity, 2);
});

test("same variant with different size strings still collapses", () => {
  const merged = mergeCartLines(
    [line(A, 1, variantM, "M")],
    [line(A, 2, variantM, "medium")]
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0]?.quantity, 3);
});

test("missing product is skipped", () => {
  const guest = canonicalizeGuestLines([line("gone", 1)], products, variants);
  assert.equal(guest.length, 0);
});

test("price on the guest payload is ignored", () => {
  const payload = toGuestCartPayload([
    { productId: A, variantId: variantM, quantity: 1, size: "M", color: null, price: 1 },
  ]);
  assert.equal(payload.length, 1);
  assert.equal("price" in payload[0]!, false);
});

test("invalid quantities are dropped", () => {
  const guest = canonicalizeGuestLines(
    [line(A, 0), line(A, -2), line(A, 1.8, variantM, "M")],
    products,
    variants
  );
  assert.equal(guest.length, 1);
  assert.equal(guest[0]?.quantity, 1);
});
