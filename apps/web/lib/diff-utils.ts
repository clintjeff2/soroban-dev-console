export interface DiffResult {
  key: string;
  oldValue: string | null;
  newValue: string | null;
  type: "added" | "modified" | "deleted";
}

export function computeStateDiff(
  oldState: Record<string, string>,
  newState: Record<string, string>,
): DiffResult[] {
  const diffs: DiffResult[] = [];
  const allKeys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);

  allKeys.forEach((key) => {
    const oldVal = oldState[key];
    const newVal = newState[key];

    if (!oldVal && newVal) {
      diffs.push({ key, oldValue: null, newValue: newVal, type: "added" });
    } else if (oldVal && !newVal) {
      diffs.push({ key, oldValue: oldVal, newValue: null, type: "deleted" });
    } else if (oldVal !== newVal) {
      diffs.push({ key, oldValue: oldVal, newValue: newVal, type: "modified" });
    }
  });

  return diffs;
}
