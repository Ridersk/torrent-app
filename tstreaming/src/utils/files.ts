import RNFS from "react-native-fs";

export function getFilesFromPath(filePath: string) {
  return RNFS.readDir(filePath);
}

export function getFilesByExtensionTypes(
  folderPath: string,
  extensionTypes: string[],
) {
  return RNFS.readDir(folderPath).then(files => {
    return files.filter(file => {
      const extension = getExtensionFromFilename(file.name);
      return extensionTypes.includes(extension);
    });
  });
}

export function getFilesByExtensionTypesRecursive(
  folderPath: string,
  extensionTypes: string[],
): Promise<RNFS.ReadDirItem[]> {
  return RNFS.readDir(folderPath).then((files: RNFS.ReadDirItem[]) => {
    return files.filter((file: RNFS.ReadDirItem) => {
      if (file.isDirectory()) {
        return getFilesByExtensionTypesRecursive(file.path, extensionTypes);
      }
      const extension = getExtensionFromFilename(file.name);
      return extensionTypes.includes(extension);
    });
  });
}

export function getFilesByPattern(
  folderPath: string,
  pattern: RegExp,
): Promise<RNFS.ReadDirItem[]> {
  return RNFS.readDir(folderPath).then(files => {
    return files.filter(file => {
      return pattern.test(file.name);
    });
  });
}

export function checkIfFileExists(filePath: string): Promise<boolean> {
  return RNFS.exists(filePath);
}

export function getFilenameFromPath(filePath: string): string {
  return filePath.split("/").pop() || "";
}

export function getExtensionFromFilename(filename: string): string {
  return filename.split(".").pop() as string;
}

export function getFilenameWithoutExtension(filename: string): string {
  return filename.split(".").shift() as string;
}

export function getParentFromFilePath(filePath: string): string {
  return filePath.split("/").slice(0, -1).join("/");
}
