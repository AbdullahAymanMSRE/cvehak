export const MAX_FILE_SIZE_MB = process.env.MAX_FILE_SIZE_MB
  ? parseInt(process.env.MAX_FILE_SIZE_MB)
  : 10;

export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
