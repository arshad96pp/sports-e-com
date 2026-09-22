import assert from "node:assert/strict";
import { test } from "node:test";
import { finiteOrZero, numberInputValue, parseNumberInput } from "./number-input";

test("parseNumberInput keeps a cleared field empty instead of snapping to 0", () => {
  assert.equal(Number(""), 0);
  assert.equal(Number.isNaN(parseNumberInput("")), true);
  assert.equal(Number.isNaN(parseNumberInput("   ")), true);
  assert.equal(parseNumberInput("0"), 0);
  assert.equal(parseNumberInput("8"), 8);
  assert.equal(parseNumberInput("12.5"), 12.5);
});

test("numberInputValue renders 0 as 0 and a cleared field as empty", () => {
  assert.equal(numberInputValue(0), 0);
  assert.equal(numberInputValue(8), 8);
  assert.equal(numberInputValue(Number.NaN), "");
});

test("finiteOrZero falls back to 0 for an empty optional number", () => {
  assert.equal(finiteOrZero(3), 3);
  assert.equal(finiteOrZero(0), 0);
  assert.equal(finiteOrZero(Number.NaN), 0);
});
