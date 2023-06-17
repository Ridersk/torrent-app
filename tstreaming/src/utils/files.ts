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

export function getFilenameFromPath(filePath: string) {
  return filePath.split("/").pop();
}

export function getExtensionFromFilename(filename: string): string {
  return filename.split(".").pop() as string;
}
