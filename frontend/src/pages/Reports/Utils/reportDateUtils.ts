export function getAcademicYearRange(ay: string) {
  if (!ay || ay.split("-").length !== 2) {
    throw new Error("Invalid academic year format");
  }

  const [startYear, endYear] = ay.split("-").map(Number);

  if (isNaN(startYear) || isNaN(endYear)) {
    throw new Error("Invalid academic year numbers");
  }

  const start = new Date(startYear, 3, 1);
  const end = new Date(endYear, 2, 31);

  return { start, end };
}


export function toShortAcademicYear(ay: string): string {
  const parts = ay.split("-");
  if (parts.length !== 2) return ay;
  return `${parts[0]}-${parts[1].slice(2)}`; // "2025-2026" → "2025-26"
}
