// Academic year: March → next March
export function getAcademicYearRange(ay: string) {
  const [startYear] = ay.split("-").map(Number);
  return {
    start: new Date(startYear, 3, 1),   // March 1
    end: new Date(startYear + 1, 2, 31) // March 31
  };
}
