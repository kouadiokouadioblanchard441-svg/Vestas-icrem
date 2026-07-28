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

function RealisticWheel({ size = 40 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 1;
  const innerR = outerR - 4;
  const hubR = size / 7;
  const n = SEGMENTS.length;

  const paths = SEGMENTS.map(({ color }, i) => {
    const arc = (2 * Math.PI) / n;
    const a1 = i * arc - Math.PI / 2;
    const a2 = a1 + arc;
    const x1 = cx + Math.cos(a1) * innerR;
    const y1 = cy + Math.sin(a1) * innerR;
    const x2 = cx + Math.cos(a2) * innerR;
    const y2 = cy + Math.sin(a2) * innerR;
    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${innerR} ${innerR} 0 0 1 ${x2} ${y2} Z`}
        fill={color}
      />
    );
  });

  // Divider lines
  const dividers = SEGMENTS.map((_, i) => {
    const angle = i * (2 * Math.PI / n) - Math.PI / 2;
    const x = cx + Math.cos(angle) * innerR;
    const y = cy + Math.sin(angle) * innerR;
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#ffd700" strokeWidth="0.8" />;
  });

  // Outer decorative pegs (small circles around the rim)
  const pegCount = 24;
  const pegs = Array.from({ length: pegCount }).map((_, i) => {
    const angle = (i / pegCount) * 2 * Math.PI - Math.PI / 2;
    const r = outerR - 1.5;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    return <circle key={i} cx={px} cy={py} r="1.2" fill={i % 2 === 0 ? "#ffd700" : "#fff"} />;
  });

  // Small text labels in each segment
  const labels = SEGMENTS.map(({ label }, i) => {
    const arc = (2 * Math.PI) / n;
    const mid = i * arc + arc / 2 - Math.PI / 2;
    const lr = innerR * 0.62;
    const lx = cx + Math.cos(mid) * lr;
    const ly = cy + Math.sin(mid) * lr;
    return (
      <text
        key={i}
        x={lx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size / 13}
        fontWeight="bold"
        fill="white"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
      >
        {label}
      </text>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {/* Outer gold ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="#b8860b" />
      <circle cx={cx} cy={cy} r={outerR - 3} fill="#ffd700" />

      {/* Segments */}
      {paths}
      {dividers}

      {/* Gold outer border over segments */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#ffd700" strokeWidth="1" />

      {/* Decorative pegs */}
      {pegs}

      {/* Labels */}
      {labels}

      {/* Center hub — metallic */}
      <circle cx={cx} cy={cy} r={hubR + 1} fill="#ffd700" />
      <circle cx={cx} cy={cy} r={hubR} fill="url(#hubGrad)" />
      <defs>
        <radialGradient id="hubGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="60%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#b8860b" />
        </radialGradient>
      </defs>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size / 10}
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
          background: "radial-gradient(circle at 35% 35%, #1a0a00, #3b1005)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 14px rgba(255,215,0,0.5)",
          overflow: "hidden",
          touchAction: "none",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {/* Pointer triangle fixed at top */}
        <div style={{
          position: "absolute",
          top: 2,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "9px solid #ffd700",
          zIndex: 2,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
        }} />

        {/* Spinning wheel */}
        <div style={{
          animation: "floatWheelSpin 4s linear infinite",
          transformOrigin: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 6,
        }}>
          <RealisticWheel size={48} />
        </div>
      </button>
    </>
  );
}
