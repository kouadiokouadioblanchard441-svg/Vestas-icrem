import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";

interface FloatingWheelProps {
  bottomOffset?: number;
}

const SPIN_KEYFRAMES = `
@keyframes floatWheelSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

const SEGMENTS = [
  { color: "#e63946", label: "10" },
  { color: "#f4a261", label: "50" },
  { color: "#2a9d8f", label: "5"  },
  { color: "#e9c46a", label: "20" },
  { color: "#264653", label: "100"},
  { color: "#c77dff", label: "2"  },
  { color: "#e76f51", label: "30" },
  { color: "#457b9d", label: "1"  },
];

function RealisticWheel({ size = 56 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;
  const hubR = size / 8;
  const n = SEGMENTS.length;

  const paths = SEGMENTS.map(({ color }, i) => {
    const arc = (2 * Math.PI) / n;
    const a1 = i * arc - Math.PI / 2;
    const a2 = a1 + arc;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const x2 = cx + Math.cos(a2) * r;
    const y2 = cy + Math.sin(a2) * r;
    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
        fill={color}
      />
    );
  });

  const dividers = SEGMENTS.map((_, i) => {
    const angle = i * (2 * Math.PI / n) - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="white" strokeWidth="1.2" />;
  });

  const labels = SEGMENTS.map(({ label }, i) => {
    const arc = (2 * Math.PI) / n;
    const mid = i * arc + arc / 2 - Math.PI / 2;
    const lr = r * 0.60;
    const lx = cx + Math.cos(mid) * lr;
    const ly = cy + Math.sin(mid) * lr;
    return (
      <text
        key={i}
        x={lx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size / 11}
        fontWeight="bold"
        fill="white"
      >
        {label}
      </text>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <defs>
        <radialGradient id="hubGrad2" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="60%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#b8860b" />
        </radialGradient>
        <clipPath id="wheelClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Segments clipped to circle */}
      <g clipPath="url(#wheelClip)">
        {paths}
        {dividers}
        {labels}
      </g>

      {/* Thin outer border */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeWidth="1.5" />

      {/* Center hub */}
      <circle cx={cx} cy={cy} r={hubR + 1} fill="white" />
      <circle cx={cx} cy={cy} r={hubR} fill="url(#hubGrad2)" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size / 11}
        fontWeight="bold"
        fill="#7c2d12"
      >
        GO
      </text>
    </svg>
  );
}

export function FloatingWheel({ bottomOffset = 24 }: FloatingWheelProps) {
  const [, navigate] = useLocation();
  const { t } = useI18n();
  const btnRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  const [pos, setPos] = useState<{ right: number; bottom: number } | null>(null);

  useEffect(() => {
    setPos({ right: 18, bottom: bottomOffset + 120 });
  }, [bottomOffset]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!btnRef.current || pos === null) return;
    dragging.current = true;
    didDrag.current = false;
    btnRef.current.setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    const rect = btnRef.current.getBoundingClientRect();
    startOffset.current = { x: rect.left, y: rect.top };
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || pos === null) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
    const newLeft = startOffset.current.x + dx;
    const newTop = startOffset.current.y + dy;
    const btnSize = 64;
    const clampedLeft = Math.max(0, Math.min(window.innerWidth - btnSize, newLeft));
    const clampedTop = Math.max(0, Math.min(window.innerHeight - btnSize, newTop));
    setPos({
      right: window.innerWidth - clampedLeft - btnSize,
      bottom: window.innerHeight - clampedTop - btnSize,
    });
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (!didDrag.current) {
      navigate("/spin-wheel");
    }
  };

  if (pos === null) return null;

  return (
    <>
      <style>{SPIN_KEYFRAMES}</style>
      <button
        ref={btnRef}
        aria-label={t.wheelTitle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: "fixed",
          right: pos.right,
          bottom: pos.bottom,
          zIndex: 200,
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "none",
          padding: 0,
          cursor: "grab",
          background: "transparent",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          overflow: "hidden",
          touchAction: "none",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Spinning wheel fills the button */}
        <div style={{
          animation: "floatWheelSpin 4s linear infinite",
          transformOrigin: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}>
          <RealisticWheel size={64} />
        </div>
      </button>
    </>
  );
}
