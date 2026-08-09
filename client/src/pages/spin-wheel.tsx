import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import WheelRulesModal from "@/components/wheel-rules-modal";
import WheelHistoryModal from "@/components/wheel-history-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import {
  DEFAULT_SPIN_WHEEL_SEGMENTS,
  type SpinWheelSegment,
} from "@shared/spin-wheel";

/* ── Palette ────────────────────────────────────────────────── */
const BG_TOP    = "#3d4e1a";
const BG_MID    = "#2d3816";
const BG_BOT    = "#1a2208";

/* ── Segments ──────────────────────────────────────────────── */
const N   = DEFAULT_SPIN_WHEEL_SEGMENTS.length;
const ARC = (2 * Math.PI) / N;

/* ── Coin stack helper (draws 3 stacked coin circles) ─────── */
function drawCoinStack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
) {
  for (let i = 2; i >= 0; i--) {
    const oy = -i * r * 0.55;
    // Edge shadow
    ctx.beginPath();
    ctx.ellipse(x, y - oy + r * 0.28, r, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#A07200";
    ctx.fill();
    // Coin face gradient
    const g = ctx.createRadialGradient(x - r * 0.3, y - oy - r * 0.3, 0, x, y - oy, r);
    g.addColorStop(0, "#FFF9A0");
    g.addColorStop(0.45, "#FFD700");
    g.addColorStop(1, "#C89A05");
    ctx.beginPath();
    ctx.arc(x, y - oy, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#A07200";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

/* ── Draw wheel ─────────────────────────────────────────────── */
function drawWheel(
  canvas: HTMLCanvasElement,
  rotation: number,
  segments: SpinWheelSegment[],
  images: Record<number, HTMLImageElement | null> = {},
) {
  const ctx = canvas.getContext("2d")!;
  const W   = canvas.width;
  const cx  = W / 2;
  const cy  = W / 2;

  const outerR  = cx - 5;          // outer gold ring edge
  const segR    = outerR - 26;     // segment outer radius
  const sepR    = segR * 0.30;     // inner separator ring radius
  const centerR = sepR * 0.82;     // GO button radius

  ctx.clearRect(0, 0, W, W);

  /* ── Drop shadow ── */
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy + 10, outerR - 2, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  ctx.fill();
  ctx.restore();

  /* ── Outer gold ring ── */
  const ringGrad = ctx.createLinearGradient(cx - outerR, cy - outerR, cx + outerR, cy + outerR);
  ringGrad.addColorStop(0,    "#C89A05");
  ringGrad.addColorStop(0.25, "#FFD700");
  ringGrad.addColorStop(0.50, "#FFF8A0");
  ringGrad.addColorStop(0.75, "#FFD700");
  ringGrad.addColorStop(1,    "#C89A05");
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
  ctx.fillStyle = ringGrad;
  ctx.fill();
  ctx.strokeStyle = "#A07200";
  ctx.lineWidth = 2;
  ctx.stroke();

  /* ── Draw 8 segments ── */
  for (let i = 0; i < N; i++) {
    const seg   = segments[i];
    const start = rotation + i * ARC - Math.PI / 2;
    const end   = start + ARC;
    const midA  = start + ARC / 2;

    // Use admin-configured colors (fallback to classic alternating if not set)
    const DEFAULT_FILLS = ["#F5C518", "#FFFDE7"];
    const DEFAULT_TEXTS = ["#5C3D00", "#7C5200"];
    const fillColor = seg.color || DEFAULT_FILLS[i % 2];
    const textColor = seg.dark  || DEFAULT_TEXTS[i % 2];

    /* Segment fill */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, segR, start, end);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = "#D4A800";
    ctx.lineWidth = 2;
    ctx.stroke();

    /* ── Image or coin stack — at ~40% from center (inner icon zone) ── */
    const coinDist = segR * 0.40;
    const coinR    = segR * 0.085;
    const coinCx   = cx + Math.cos(midA) * coinDist;
    const coinCy   = cy + Math.sin(midA) * coinDist;

    const img = (images as Record<number, HTMLImageElement | null>)[seg.id];
    if (img && img.complete && img.naturalWidth > 0) {
      const imgSize = segR * 0.20;
      ctx.save();
      ctx.beginPath();
      ctx.arc(coinCx, coinCy, imgSize * 0.85, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, coinCx - imgSize, coinCy - imgSize, imgSize * 2, imgSize * 2);
      ctx.restore();
    } else {
      drawCoinStack(ctx, coinCx, coinCy, coinR);
    }

    /* ── Amount / label text — outer zone at ~68% from center ── */
    const textDist = segR * 0.68;
    ctx.save();
    ctx.translate(
      cx + Math.cos(midA) * textDist,
      cy + Math.sin(midA) * textDist,
    );
    let tRot = midA + Math.PI / 2;
    if (tRot > Math.PI / 2 && tRot < Math.PI * 1.5) tRot += Math.PI;
    ctx.rotate(tRot);
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = textColor;
    ctx.shadowColor  = "rgba(255,255,255,0.8)";
    ctx.shadowBlur   = 4;

    // Format: "100f", "1 000f", "😊" for non-winnable
    let displayText: string;
    if (!seg.canWin) {
      displayText = "😊";
    } else if (seg.amount > 0) {
      displayText = seg.amount >= 1000
        ? `${(seg.amount / 1000).toLocaleString("fr-FR")}kf`
        : `${seg.amount}f`;
    } else {
      displayText = seg.label;
    }

    const fontSize = Math.max(10, Math.min(15, segR * 0.118));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillText(displayText, 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* ── Inner separator gold ring ── */
  const sepGrad = ctx.createRadialGradient(cx, cy, centerR, cx, cy, sepR);
  sepGrad.addColorStop(0,    "#FFF8A0");
  sepGrad.addColorStop(0.45, "#FFD700");
  sepGrad.addColorStop(1,    "#C89A05");
  ctx.beginPath();
  ctx.arc(cx, cy, sepR, 0, 2 * Math.PI);
  ctx.fillStyle = sepGrad;
  ctx.fill();
  ctx.strokeStyle = "#A07200";
  ctx.lineWidth = 2;
  ctx.stroke();

  /* ── Flame / teardrop pointer (fixed at 12-o'clock) ── */
  const flameBase = cy - sepR + 2;
  const flameTop  = flameBase - sepR * 0.70;
  const flameW    = sepR * 0.38;
  const flameG    = ctx.createLinearGradient(cx, flameTop, cx, flameBase);
  flameG.addColorStop(0,   "#FF9820");
  flameG.addColorStop(0.6, "#E63946");
  flameG.addColorStop(1,   "#C0392B");
  ctx.beginPath();
  ctx.moveTo(cx, flameTop);
  ctx.bezierCurveTo(
    cx + flameW * 1.1, flameTop + (flameBase - flameTop) * 0.45,
    cx + flameW * 0.9, flameBase,
    cx, flameBase,
  );
  ctx.bezierCurveTo(
    cx - flameW * 0.9, flameBase,
    cx - flameW * 1.1, flameTop + (flameBase - flameTop) * 0.45,
    cx, flameTop,
  );
  ctx.fillStyle = flameG;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth   = 1;
  ctx.stroke();

  /* ── Center GO button ── */
  const btnG = ctx.createRadialGradient(
    cx - centerR * 0.3, cy - centerR * 0.3, 0,
    cx, cy, centerR,
  );
  btnG.addColorStop(0,   "#FF9820");
  btnG.addColorStop(0.4, "#E63946");
  btnG.addColorStop(1,   "#A01E28");
  ctx.beginPath();
  ctx.arc(cx, cy, centerR, 0, 2 * Math.PI);
  ctx.fillStyle = btnG;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  /* GO text */
  ctx.fillStyle    = "#FFF";
  ctx.font         = `bold ${Math.round(centerR * 0.62)}px sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor  = "rgba(0,0,0,0.6)";
  ctx.shadowBlur   = 5;
  ctx.fillText("GO", cx, cy);
  ctx.shadowBlur = 0;
}

/* ── Recent spin entry type ──────────────────────────────── */
interface RecentSpin {
  phone: string;
  amount: string;
  description: string;
}

/* ── Page ───────────────────────────────────────────────────── */
export default function SpinWheelPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rotRef     = useRef(0);
  const animRef    = useRef<number | null>(null);
  const rafRef     = useRef<number | null>(null);
  const spinning   = useRef(false);

  const [rotation,    setRotation]   = useState(0);
  const [spinning2,   setSpinning2]  = useState(false);
  const [spinTokens,  setSpinTokens] = useState(() => user?.spinTokens ?? 0);
  const [showRules,   setShowRules]  = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  /* Personal spin history — for "Balance" (total winnings on the wheel) */
  const { data: spinHistory = [] } = useQuery<{ amount: string }[]>({
    queryKey: ["/api/spin-wheel/history"],
  });
  const wheelTotalWon = useMemo(
    () => spinHistory.reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0),
    [spinHistory],
  );

  const [segments, setSegments] = useState<SpinWheelSegment[]>(DEFAULT_SPIN_WHEEL_SEGMENTS);
  const rotDrawRef   = useRef(rotation);
  const segDrawRef   = useRef(segments);
  const imagesRef    = useRef<Record<number, HTMLImageElement | null>>({});

  /* Sync spinTokens when user refreshes */
  useEffect(() => { setSpinTokens(user?.spinTokens ?? 0); }, [user?.spinTokens]);

  /* Load admin-configured segments */
  const { data: configuredSegments } = useQuery<SpinWheelSegment[]>({
    queryKey: ["/api/spin-wheel/config"],
  });
  useEffect(() => {
    if (configuredSegments?.length === N) setSegments(configuredSegments);
  }, [configuredSegments]);

  /* Pre-load segment images whenever segments change */
  useEffect(() => {
    const cache: Record<number, HTMLImageElement | null> = {};
    segments.forEach((seg) => {
      if (seg.imageUrl) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = seg.imageUrl;
        cache[seg.id] = img;
      } else {
        cache[seg.id] = null;
      }
    });
    imagesRef.current = cache;
  }, [segments]);

  /* Recent global spins */
  const { data: recentSpins } = useQuery<RecentSpin[]>({
    queryKey: ["/api/spin-wheel/recent"],
    refetchInterval: 15000,
  });

  /* Keep draw refs in sync */
  useEffect(() => {
    rotDrawRef.current = rotation;
    segDrawRef.current = segments;
  }, [rotation, segments]);

  /* Animate wheel on canvas every frame */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const loop = () => {
      drawWheel(canvas, rotDrawRef.current, segDrawRef.current, imagesRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  /* Spin mutation */
  const spinMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/spin-wheel/spin", {});
      return r.json() as Promise<{ segmentId: number; amount: number; label: string }>;
    },
  });

  const handleSpin = useCallback(() => {
    if (spinning.current || spinTokens <= 0 || spinMutation.isPending) return;
    spinning.current = true;
    setSpinning2(true);

    spinMutation.mutate(undefined, {
      onSuccess: (result) => {
        const winIdx   = Math.max(0, segments.findIndex((s) => s.id === result.segmentId));
        const extra    = Math.PI * 2 * (6 + Math.random() * 4);
        const targetRot = rotRef.current + extra + (Math.PI * 2 - winIdx * ARC);
        const duration  = 3500;
        const startTime = performance.now();
        const startRot  = rotRef.current;

        function ease(p: number) {
          return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        }
        function tick(now: number) {
          const p = Math.min((now - startTime) / duration, 1);
          const c = startRot + (targetRot - startRot) * ease(p);
          rotRef.current = c;
          setRotation(c);
          if (p < 1) {
            animRef.current = requestAnimationFrame(tick);
          } else {
            spinning.current = false;
            setSpinning2(false);
            setSpinTokens((prev) => Math.max(0, prev - 1));
            refreshUser();
            toast({
              title: t.wheelCongrats,
              description: t.wheelWonDesc.replace("{0}", String(result.amount)),
            });
          }
        }
        animRef.current = requestAnimationFrame(tick);
      },
      onError: (error: Error) => {
        spinning.current = false;
        setSpinning2(false);
        toast({ title: error.message || t.wheelErrUnavailable, variant: "destructive" });
      },
    });
  }, [spinTokens, segments, spinMutation, toast, t, refreshUser]);

  /* Cleanup */
  useEffect(() => () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
  }, []);

  // balance kept for reference but we display wheelTotalWon in the UI

  /* Masked display list — prefer API data, fall back to demo rows */
  const historyRows: RecentSpin[] = useMemo(() => {
    if (recentSpins && recentSpins.length > 0) return recentSpins;
    return [];
  }, [recentSpins]);

  return (
    <>
      <div
        className="min-h-screen flex flex-col overflow-x-hidden pb-20"
        style={{
          background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 45%, ${BG_BOT} 100%)`,
        }}
      >
          {/* ── Header with back button ── */}
        <header className="flex items-center px-4 pt-4 pb-2">
          <Link href="/account">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-90"
              style={{ background: "rgba(255,255,255,0.15)" }}
              data-testid="button-back"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <span
            className="ml-3 font-bold text-base"
            style={{ color: "#FFD700" }}
          >
            Roue de la fortune
          </span>
        </header>

        {/* ── Wheel ── */}
        <div className="flex flex-col items-center pt-2 px-4 mb-5">
          <div
            style={{
              borderRadius: "50%",
              boxShadow: "0 0 32px rgba(255,215,0,0.25), 0 10px 36px rgba(0,0,0,0.5)",
            }}
          >
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              style={{
                display: "block",
                width:  "min(88vw, 340px)",
                height: "min(88vw, 340px)",
                borderRadius: "50%",
                cursor: spinning2 ? "not-allowed" : "pointer",
              }}
              onClick={(e) => {
                /* Only spin when clicking the centre GO button */
                const canvas = canvasRef.current;
                if (!canvas) return;
                const rect   = canvas.getBoundingClientRect();
                const scaleX = canvas.width  / rect.width;
                const scaleY = canvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top)  * scaleY;
                const cx = canvas.width  / 2;
                const cy = canvas.height / 2;
                const outerR  = cx - 5;
                const segR    = outerR - 26;
                const centerR = segR * 0.30 * 0.82;
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                if (dist <= centerR) handleSpin();
              }}
            />
          </div>
        </div>

        {/* ── Rules bar ── */}
        <div className="mx-4 mb-3">
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}
          >
            <span className="text-sm text-gray-600">
              Consultez les règles du jeu
            </span>
            <button
              onClick={() => setShowRules(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0 active:scale-90 transition-transform"
              style={{ background: "#E63946" }}
            >
              ?
            </button>
          </div>
        </div>

        {/* ── Balance / Gratuit row ── */}
        <div className="mx-4 mb-3">
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}
          >
            {/* Total gagné sur la roue */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium">Balance</span>
              <span
                className="px-3 py-0.5 rounded-full text-sm font-bold text-white"
                style={{ background: "#3d8a40" }}
              >
                {wheelTotalWon.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Gratuit */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium">Gratuit</span>
              <span
                className="px-3 py-0.5 rounded-full text-sm font-bold text-white"
                style={{ background: "#3d8a40" }}
              >
                {spinTokens}
              </span>
              <button
                onClick={() => setShowHistory(true)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0 active:scale-90 transition-transform"
                style={{ background: "#E63946" }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* ── Recent activity list ── */}
        <div className="mx-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}
          >
            {historyRows.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Aucune activité récente
              </div>
            ) : (
              historyRows.slice(0, 10).map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderBottom: idx < Math.min(historyRows.length, 10) - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                  }}
                >
                  <span className="text-sm text-gray-700 font-medium">
                    {row.phone}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: parseFloat(row.amount) > 0 ? "#3d8a40" : "#888" }}
                  >
                    {parseFloat(row.amount) > 0
                      ? `+ ${parseFloat(row.amount).toLocaleString()}`
                      : `+ ${row.description}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <WheelRulesModal open={showRules}   onClose={() => setShowRules(false)} />
      <WheelHistoryModal open={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}
