export function reviewEffort(fileCount: number, hunkCount: number): 1 | 2 | 3 | 4 | 5 {
  const score = fileCount + hunkCount / 3;
  if (score <= 3) {
    return 1;
  }
  if (score <= 8) {
    return 2;
  }
  if (score <= 20) {
    return 3;
  }
  if (score <= 40) {
    return 4;
  }
  return 5;
}
