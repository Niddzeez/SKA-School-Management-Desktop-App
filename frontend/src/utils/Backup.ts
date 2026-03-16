export function exportBackup() {
  throw new Error("Local backup is deprecated. Use server backups.");
}

export function importBackup(_file: File): Promise<void> {
  throw new Error("Local backup is deprecated. Use server backups.");
}
