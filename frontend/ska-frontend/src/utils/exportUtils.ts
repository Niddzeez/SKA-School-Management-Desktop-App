export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((value) =>
          typeof value === "string"
            ? `"${value.replace(/"/g, '""')}"`
            : value
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
