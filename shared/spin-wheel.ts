export interface SpinWheelSegment {
  id: number;
  label: string;
  amount: number;
  color: string;
  dark: string;
  canWin: boolean;
}

export const DEFAULT_SPIN_WHEEL_SEGMENTS: SpinWheelSegment[] = [
  { id: 1, label: "Petit gain", amount: 10, color: "#315aab", dark: "#1e3d7a", canWin: true },
  { id: 2, label: "Tirage bonus", amount: 0, color: "#16a34a", dark: "#0d6b31", canWin: false },
  { id: 3, label: "Bonus spécial", amount: 0, color: "#dc2626", dark: "#991b1b", canWin: false },
  { id: 4, label: "Belle récompense", amount: 50, color: "#7c3aed", dark: "#4c1d95", canWin: true },
  { id: 5, label: "Grand prix", amount: 100, color: "#ea580c", dark: "#9a3412", canWin: true },
  { id: 6, label: "Tirages bonus", amount: 0, color: "#ca8a04", dark: "#854d0e", canWin: false },
  { id: 7, label: "Petit gain", amount: 10, color: "#0891b2", dark: "#0c4a6e", canWin: true },
  { id: 8, label: "Récompense", amount: 20, color: "#db2777", dark: "#831843", canWin: true },
];

export const SPIN_WHEEL_SETTING_KEY = "spinWheelConfig";

export function parseSpinWheelSegments(value: string | null | undefined): SpinWheelSegment[] {
  if (!value) return DEFAULT_SPIN_WHEEL_SEGMENTS;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_SPIN_WHEEL_SEGMENTS.length) {
      return DEFAULT_SPIN_WHEEL_SEGMENTS;
    }

    return parsed.map((segment, index) => ({
      ...DEFAULT_SPIN_WHEEL_SEGMENTS[index],
      ...segment,
      id: index + 1,
      label: typeof segment.label === "string" && segment.label.trim()
        ? segment.label.trim()
        : DEFAULT_SPIN_WHEEL_SEGMENTS[index].label,
      amount: Number.isFinite(Number(segment.amount)) && Number(segment.amount) >= 0
        ? Number(segment.amount)
        : DEFAULT_SPIN_WHEEL_SEGMENTS[index].amount,
      canWin: Boolean(segment.canWin),
    }));
  } catch {
    return DEFAULT_SPIN_WHEEL_SEGMENTS;
  }
}