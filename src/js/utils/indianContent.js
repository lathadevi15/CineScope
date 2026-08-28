// src/js/utils/indianContent.js

const INDIAN_LANGUAGES = new Set([
  "hi", "te", "ta", "kn", "ml", "bn", "mr", "gu", "pa", "or", "as", "ur"
]);

export function isIndianCredit(item) {
  const hasIndianOrigin = item.origin_country && item.origin_country.includes("IN");
  const hasIndianLanguage = INDIAN_LANGUAGES.has(item.original_language);
  return Boolean(hasIndianOrigin || hasIndianLanguage);
}

export function isIndianPerson(person) {
  const knownFor = person.known_for || [];
  return knownFor.some((item) => isIndianCredit(item));
}