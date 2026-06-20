function cleanText(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function normalizeEmail(value) {
  return cleanText(value).toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(value));
}

function isValidMoney(value, { min = 0, max = 999999 } = {}) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

function toMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function isValidStock(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 99999;
}

function normalizeCouponCode(value) {
  return cleanText(value).toUpperCase().replace(/\s+/g, '');
}

function isValidCouponCode(value) {
  return /^[A-Z0-9_-]{3,24}$/.test(normalizeCouponCode(value));
}

function parseOptionalDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function boolValue(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

function safeJson(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

module.exports = {
  cleanText,
  normalizeEmail,
  isValidEmail,
  isValidMoney,
  toMoney,
  isValidStock,
  normalizeCouponCode,
  isValidCouponCode,
  parseOptionalDate,
  boolValue,
  safeJson
};
