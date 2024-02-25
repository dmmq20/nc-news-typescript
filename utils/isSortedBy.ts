type Comparator<T> = (a: T, b: T) => number;

const defaultCompare: Comparator<any> = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

export const isSortedBy = <T, K extends keyof T>(
  arr: T[],
  sort_by: K,
  options: { descending: boolean }
): boolean => {
  const { descending } = options;
  for (let i = 0; i < arr.length - 1; i++) {
    const a = arr[i][sort_by];
    const b = arr[i + 1][sort_by];
    const cmp = descending ? defaultCompare(a, b) : defaultCompare(b, a);
    if (cmp === -1) return false;
  }
  return true;
};
