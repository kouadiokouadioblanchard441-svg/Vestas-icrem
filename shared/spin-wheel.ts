export interface SpinWheelSegment {
  id: number;
  label: string;
  amount: number;
  color: string;      // segment background color
  dark: string;       // darker shade for stroke / text
  canWin: boolean;
  imageUrl?: string;  // optional image drawn on the segment
  weight?: number;    // relative probability weight (default 1)
}

/**
 * Fixed public game rules.
 *
 * The amounts and winning status are deliberately not configurable. The
 * server applies this layout when reading and saving the wheel config, so an
 * old database value or a modified client cannot make a non-winning prize
 * payable.
 */
const FIXED_WHEEL_RULES = [
  { label: "1000F", amount: 1000, canWin: false },
  { label: "100F",  amount: 100,  canWin: true  },
  { label: "200F",  amount: 200,  canWin: true  },
  { label: "500F",  amount: 500,  canWin: true  },
  { label: "5000F", amount: 5000, canWin: false },
  { label: "25000F", amount: 25000, canWin: false },
  { label: "90000F", amount: 90000, canWin: false },
  { label: "😊",    amount: 0,    canWin: false },
] as const;

export const DEFAULT_SPIN_WHEEL_SEGMENTS: SpinWheelSegment[] = [
  { id: 1, ...FIXED_WHEEL_RULES[0], color: "#F5C518", dark: "#5C3D00", weight: 1 },
  { id: 2, ...FIXED_WHEEL_RULES[1], color: "#FFFDE7", dark: "#7C5200", weight: 30 },
  { id: 3, ...FIXED_WHEEL_RULES[2], color: "#F5C518", dark: "#5C3D00", weight: 25 },
  { id: 4, ...FIXED_WHEEL_RULES[3], color: "#FFFDE7", dark: "#7C5200", weight: 15 },
  { id: 5, ...FIXED_WHEEL_RULES[4], color: "#F5C518", dark: "#5C3D00", weight: 1 },
  { id: 6, ...FIXED_WHEEL_RULES[5], color: "#FFFDE7", dark: "#7C5200", weight: 1 },
  { id: 7, ...FIXED_WHEEL_RULES[6], color: "#F5C518", dark: "#5C3D00", weight: 1 },
  { id: 8, ...FIXED_WHEEL_RULES[7], color: "#FFFDE7", dark: "#7C5200", weight: 1 },
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
       // These three fields are fixed game rules, never user-configurable.
       label: DEFAULT_SPIN_WHEEL_SEGMENTS[index].label,
       amount: DEFAULT_SPIN_WHEEL_SEGMENTS[index].amount,
       canWin: DEFAULT_SPIN_WHEEL_SEGMENTS[index].canWin,
      color: typeof segment.color === "string" && /^#[0-9a-f]{6}$/i.test(segment.color)
        ? segment.color
        : DEFAULT_SPIN_WHEEL_SEGMENTS[index].color,
      dark: typeof segment.dark === "string" && /^#[0-9a-f]{6}$/i.test(segment.dark)
        ? segment.dark
        : DEFAULT_SPIN_WHEEL_SEGMENTS[index].dark,
      imageUrl: typeof segment.imageUrl === "string" && segment.imageUrl.trim()
        ? segment.imageUrl.trim()
        : undefined,
      weight: Number.isFinite(Number(segment.weight)) && Number(segment.weight) > 0
        ? Number(segment.weight)
        : 1,
    }));
  } catch {
    return DEFAULT_SPIN_WHEEL_SEGMENTS;
  }
}

/** Weighted random pick among winnable segments */
export function pickWinningSegment(segments: SpinWheelSegment[]): SpinWheelSegment {
  const winnable = segments.filter((s) => s.canWin);
  if (winnable.length === 0) throw new Error("Aucune section gagnable configurée");

  const totalWeight = winnable.reduce((sum, s) => sum + (s.weight ?? 1), 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;
  for (const seg of winnable) {
    cumulative += seg.weight ?? 1;
    if (rand < cumulative) return seg;
  }
  return winnable[winnable.length - 1];
}
