export function exportBackup() {
  const keys = [
    "academicYear",
    "students",
    "teachers",
    "classes",
    "sections",
    "feeStructures",
    "ledgers",
    "adjustments",
    "payments",
    "expenses",
  ];

  const data: Record<string, unknown> = {};

  keys.forEach((key) => {
    const raw = localStorage.getItem(key);
    data[key] = raw ? JSON.parse(raw) : null;
  });

  const backup = {
    meta: {
      app: "SKA-School-Management",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
    },
    data,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `SKA-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  a.click();
  URL.revokeObjectURL(url);
}


export function importBackup(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);

        if (!parsed.meta || !parsed.data) {
          throw new Error("Invalid backup file");
        }

        const allowedKeys = [
          "academicYear",
          "students",
          "teachers",
          "classes",
          "sections",
          "feeStructures",
          "ledgers",
          "adjustments",
          "payments",
          "expenses",
        ];

        allowedKeys.forEach((key) => {
          if (key in parsed.data) {
            localStorage.setItem(
              key,
              JSON.stringify(parsed.data[key])
            );
          }
        });

        resolve();
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsText(file);
  });
}
