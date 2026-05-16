/**
 * decibel.js
 * Pure calculation logic — no React, no DOM dependencies.
 *
 * Ported from DecibelCalculator.cpp with the following fixes:
 *   1. Input validation  — orignal gives NaN/Infinity when P0 = 0
 *   2. doublingLevels()  — original used db/3; correct divisor is 10·log10(2) ≈ 3.0103
 *   3. pressureToDb()    — original only had 10·log10 (power); added 20·log10 (field quantity)
 *   4. Inverse functions — dbToPowerRatio / dbToPressureRatio (missing from original)
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Exact dB value of one power doubling.
 * 10 · log10(2) ≈ 3.0103
 * The original C++ used the rounded value 3, which introduces a small but
 * accumulating error (e.g. 0.34% off at 30 dB).
 */
const LOG2_DB = 10 * Math.log10(2);

// ─── Forward: value → dB ─────────────────────────────────────────────────────

/**
 * Power ratio → dB  (original formula from DecibelCalculator.cpp)
 * Used for power, intensity, energy quantities.
 *   dB = 10 · log10(P1 / P0)
 *
 * @param {number} p0  Reference power (must be > 0)
 * @param {number} p1  New power (must be > 0)
 * @returns {number|null} dB value, or null if inputs are invalid
 */
function powerToDb(p0, p1) {
  if (p0 <= 0 || p1 <= 0) return null;
  return 10 * Math.log10(p1 / p0);
}

/**
 * Pressure / voltage ratio → dB  (field quantity — not in original)
 * Used for sound pressure, voltage, current, distance.
 *   dB = 20 · log10(P1 / P0)
 *
 * @param {number} p0  Reference pressure (must be > 0)
 * @param {number} p1  New pressure (must be > 0)
 * @returns {number|null} dB value, or null if inputs are invalid
 */
function pressureToDb(p0, p1) {
  if (p0 <= 0 || p1 <= 0) return null;
  return 20 * Math.log10(p1 / p0);
}

// ─── Inverse: dB → ratio ─────────────────────────────────────────────────────

/**
 * dB → power ratio  (inverse of powerToDb — not in original)
 *   ratio = 10^(dB / 10)
 *
 * @param {number} db
 * @returns {number}
 */
function dbToPowerRatio(db) {
  return Math.pow(10, db / 10);
}

/**
 * dB → pressure / voltage ratio  (inverse of pressureToDb — not in original)
 *   ratio = 10^(dB / 20)
 *
 * @param {number} db
 * @returns {number}
 */
function dbToPressureRatio(db) {
  return Math.pow(10, db / 20);
}

// ─── Derived calculations ─────────────────────────────────────────────────────

/**
 * How many power-doubling steps does a dB value represent?
 *
 * ORIGINAL C++:  level = db / 3          ← imprecise
 * FIXED:         level = db / LOG2_DB    ← exact (÷ 3.0103)
 *
 * @param {number} db
 * @returns {number}
 */
function doublingLevels(db) {
  return db / LOG2_DB;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/**
 * Format a number to fixed decimal places; returns "—" for null/NaN/Infinity.
 *
 * @param {number|null} n
 * @param {number} decimals
 * @returns {string}
 */
function fmt(n, decimals = 2) {
  if (n === null || isNaN(n) || !isFinite(n)) return "\u2014";
  return n.toFixed(decimals);
}

/**
 * Format a dB value with a leading sign (e.g. "+3.01 dB", "−6.02 dB").
 *
 * @param {number|null} n
 * @returns {string}
 */
function fmtDb(n) {
  if (n === null || isNaN(n) || !isFinite(n)) return "\u2014";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)} dB`;
}

/**
 * Pick a colour for a dB change value (for UI accenting).
 *
 * @param {number} db
 * @returns {string} CSS hex colour
 */
function dbColor(db) {
  const a = Math.abs(db);
  if (a < 10) return "#1D9E75";   /* safe / small change  */
  if (a < 20) return "#BA7517";   /* moderate             */
  if (a < 40) return "#D85A30";   /* loud                 */
  return "#E24B4A";               /* danger / large       */
}
