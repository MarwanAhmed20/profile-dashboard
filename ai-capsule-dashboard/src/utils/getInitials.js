export function getInitials(name) {
  if (!name || typeof name !== "string") return "??";

  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

// Lightweight runtime "tests"
console.assert(
  getInitials("Omar Hassan") === "OH",
  "getInitials should return 'OH' for 'Omar Hassan'"
);
console.assert(
  getInitials("Single") === "S",
  "getInitials should handle single-word names"
);
console.assert(
  getInitials("Omar A. Hassan").startsWith("O"),
  "getInitials should always start with first name initial"
);
console.assert(
  getInitials(undefined) === "??",
  "getInitials should return '??' for undefined values"
);
console.assert(
  getInitials(null) === "??",
  "getInitials should return '??' for null values"
);
console.assert(
  getInitials("") === "??",
  "getInitials should return '??' for empty strings"
);
console.assert(
  getInitials(" ") === "??",
  "getInitials should return '??' for strings with just spaces"
);
