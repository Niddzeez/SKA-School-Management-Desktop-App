export function exportToCSV(
  rows: Record<string, string | number>[],
  filename: string
) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","), // header row
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
