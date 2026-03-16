// Academic year: March → next March
export function getAcademicYearRange(ay: string) {
  if (!ay || !ay.includes("-")) {
    return {
      start: new Date(),
      end: new Date()
    };
  }

  const [startYear, endYear] = ay.split("-").map(Number);

  const start = new Date(startYear, 3, 1); // April 1
  const end = new Date(endYear, 2, 31);    // March 31

  return { start, end };
}

export function toBackendAcademicYear(year: string): string {
  if (!year || !year.includes("-")) return year;

  const [start, end] = year.split("-");
  return `${start}-${end.slice(-2)}`;
}

