export function convertBytesToHumanReadable(bytes: number): string {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) {
    return "0 Byte";
  }
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, unitIndex)).toFixed(2))} ${
    units[unitIndex]
  }`;
}

export function convertBytesComparisonToHumanReadable(
  bytes: number,
  totalBytes: number,
): string {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) {
    return "0 Byte";
  }
  const unitIndexTotal = Math.floor(Math.log(totalBytes) / Math.log(1024));
  return `${parseFloat(
    (bytes / Math.pow(1024, unitIndexTotal)).toFixed(2),
  )} of ${parseFloat(
    (totalBytes / Math.pow(1024, unitIndexTotal)).toFixed(2),
  )} ${units[unitIndexTotal]}`;
}

export function convertBytesToHumanReadablePerSecond(bytes: number): string {
  const units = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];
  if (bytes === 0) {
    return "0 B/s";
  }
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, unitIndex)).toFixed(2))} ${
    units[unitIndex]
  }`;
}
