import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";

interface SettingsLinks {
  supportLink: string;
  supportType: string;
  supportLabel: string;
}

interface FloatingSupportProps {
  bottomOffset?: number;
}

export function FloatingSupport({ bottomOffset = 24 }: FloatingSupportProps) {
  const { data } = useQuery<SettingsLinks>({
    queryKey: ["/api/settings/links"],
    staleTime: 5 * 60 * 1000,
  });

  const link = data?.supportLink || "#";

  // Drag state
  const btnRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  // Position: start at fixed bottom-right
  const [pos, setPos] = useState<{ right: number; bottom: number } | null>(null);

  // Initialise position after mount so we know window size
  useEffect(() => {
    setPos({ right: 18, bottom: bottomOffset + 40 });
  }, [bottomOffset]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!btnRef.current || pos === null) return;
    dragging.current = true;
    didDrag.current = false;
    btnRef.current.setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    // Convert right/bottom to left/top for free movement
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

    // Convert back to right/bottom
    setPos({
      right: window.innerWidth - clampedLeft - btnSize,
      bottom: window.innerHeight - clampedTop - btnSize,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (!didDrag.current && link && link !== "#") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  if (pos === null) return null;

  return (
    <button
      ref={btnRef}
      aria-label="Service client"
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
        border: "3px solid #16A34A",
        padding: 0,
        cursor: "grab",
        background: "transparent",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <img
        src="/support-avatar.png"
        alt="Service client"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          display: "block",
          pointerEvents: "none",
        }}
      />
    </button>
  );
}
