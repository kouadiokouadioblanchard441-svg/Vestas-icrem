import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Volume2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import WheelRulesModal from "@/components/wheel-rules-modal";
import WheelHistoryModal from "@/components/wheel-history-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  DEFAULT_SPIN_WHEEL_SEGMENTS,
  type SpinWheelSegment,
} from "@shared/spin-wheel";

/* ── Segments ──────────────────────────────────────────────── */
const N = DEFAULT_SPIN_WHEEL_SEGMENTS.length;
const ARC = (2 * Math.PI) / N;

/* ── Draw wheel ─────────────────────────────────────────────── */
function drawWheel(
  canvas: HTMLCanvasElement,
  rotation: number,
  segments: SpinWheelSegment[],
  lightPhase = 0,
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const cx = W / 2;
  const cy = W / 2;
  const outerR = cx - 7;
  const rimR    = outerR - 25;
  const segR    = outerR - 37;
  const innerR  = segR * 0.30;
  const lightAngle = -Math.PI / 2 + Math.sin(lightPhase) * 0.35;
  const lightX = cx + Math.cos(lightAngle) * outerR;
  const lightY = cy + Math.sin(lightAngle) * outerR;

  ctx.clearRect(0, 0, W, W);

  /* Soft cast shadow under the wheel. */
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy + 7, outerR - 1, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(20, 0, 0, 0.55)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  ctx.fill();
  ctx.restore();

  /* Brushed gold outer ring with a moving studio-light highlight. */
  const goldGrad = ctx.createLinearGradient(
    cx - Math.cos(lightAngle) * outerR,
    cy - Math.sin(lightAngle) * outerR,
    lightX,
    lightY,
  );
  goldGrad.addColorStop(0, "#6f4305");
  goldGrad.addColorStop(0.12, "#b8790b");
  goldGrad.addColorStop(0.28, "#fff1a1");
  goldGrad.addColorStop(0.42, "#ffd22e");
  goldGrad.addColorStop(0.58, "#fff8bd");
  goldGrad.addColorStop(0.76, "#c98a12");
  goldGrad.addColorStop(0.92, "#7a4b05");
  goldGrad.addColorStop(1, "#e6ad24");
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
  ctx.fillStyle = goldGrad;
  ctx.fill();
  ctx.strokeStyle = "#4b2a03";
  ctx.lineWidth = 3;
  ctx.stroke();

  /* Raised inner lip of the gold ring. */
  ctx.beginPath();
  ctx.arc(cx, cy, rimR + 4, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255, 247, 178, 0.95)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, rimR - 2, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(92, 49, 2, 0.9)";
  ctx.lineWidth = 4;
  ctx.stroke();

  /* Small embossed studs around the metallic ring. */
  const dotCount = 20;
  for (let i = 0; i < dotCount; i++) {
    const a = rotation + (i / dotCount) * 2 * Math.PI;
    const dr = (outerR + rimR) / 2;
    const dx = cx + Math.cos(a) * dr;
    const dy = cy + Math.sin(a) * dr;
    ctx.beginPath();
    ctx.arc(dx, dy, 7.5, 0, 2 * Math.PI);
    const cg = ctx.createRadialGradient(dx - 3, dy - 3, 0, dx, dy, 8);
    cg.addColorStop(0, "#ffffff");
    cg.addColorStop(0.18, "#fffbd0");
    cg.addColorStop(0.52, "#f5c52b");
    cg.addColorStop(1, "#6b3e03");
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = "#3b2101";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* segments */
  for (let i = 0; i < N; i++) {
    const seg = segments[i];
    const start = rotation + i * ARC - Math.PI / 2;
    const end   = start + ARC;

    /* segment fill */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, segR, start, end);
    ctx.closePath();

    const segmentLight = ctx.createLinearGradient(
      cx - Math.cos(lightAngle) * segR,
      cy - Math.sin(lightAngle) * segR,
      lightX,
      lightY,
    );
    segmentLight.addColorStop(0, "#09030d");
    segmentLight.addColorStop(0.18, seg.dark);
    segmentLight.addColorStop(0.48, seg.color);
    segmentLight.addColorStop(0.72, seg.color);
    segmentLight.addColorStop(0.92, seg.dark);
    segmentLight.addColorStop(1, "#08020b");
    const sg = ctx.createRadialGradient(cx, cy, innerR * 0.4, cx, cy, segR);
    sg.addColorStop(0, "rgba(255,255,255,0.10)");
    sg.addColorStop(0.34, "rgba(255,255,255,0)");
    sg.addColorStop(0.84, "rgba(0,0,0,0.12)");
    sg.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = segmentLight;
    ctx.fill();
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = sg;
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "#FFD70099";
    ctx.lineWidth = 2;
    ctx.stroke();

    /* Fine bevel on both sides of every slice makes the wheel feel solid. */
    ctx.beginPath();
    ctx.arc(cx, cy, segR - 2, start + 0.012, end - 0.012);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, segR - 2, start + 0.012, start + 0.055);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 3;
    ctx.stroke();

    /*
     * Keep every amount and label inside its own section. Text is measured
     * against the available arc width before it is drawn, so long admin
     * labels shrink/wrap instead of crossing into another section.
     */
    const midA = start + ARC / 2;
    const textRadius = segR * 0.60;
    const maxTextWidth = segR * 0.42;
    const fitFontSize = (text: string, weight: string, preferred: number, minimum: number) => {
      let size = preferred;
      while (size > minimum) {
        ctx.font = `${weight} ${size}px sans-serif`;
        if (ctx.measureText(text).width <= maxTextWidth) return size;
        size -= 0.5;
      }
      return minimum;
    };
    const wrapLabel = (text: string, fontSize: number) => {
      ctx.font = `bold ${fontSize}px sans-serif`;
      const lines: string[] = [];
      let line = "";
      for (const word of text.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > maxTextWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
      return lines.slice(0, 2);
    };

    ctx.save();
    ctx.translate(cx + Math.cos(midA) * textRadius, cy + Math.sin(midA) * textRadius);
    let textRotation = midA + Math.PI / 2;
    if (textRotation > Math.PI / 2 && textRotation < Math.PI * 1.5) {
      textRotation += Math.PI;
    }
    ctx.rotate(textRotation);
    ctx.fillStyle = "#fffde7";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.95)";
    ctx.shadowBlur = 6;
    const amountText = `${seg.amount} USDT`;
    const amountFontSize = fitFontSize(amountText, "900", 16, 10);
    ctx.font = `900 ${amountFontSize}px sans-serif`;
    ctx.fillText(amountText, 0, -8);

    const label = seg.canWin ? seg.label : `${seg.label} · indisponible`;
    const labelFontSize = fitFontSize(label, "bold", 9, 7);
    const labelLines = wrapLabel(label, labelFontSize);
    ctx.font = `bold ${labelFontSize}px sans-serif`;
    labelLines.forEach((line, li) => ctx.fillText(line, 0, 7 + li * (labelFontSize + 2)));
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* Deep inner bevel separates the segments from the center mechanism. */
  const rimGrad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, segR * 0.34);
  rimGrad.addColorStop(0, "#3f2202");
  rimGrad.addColorStop(0.35, "#d69b18");
  rimGrad.addColorStop(0.56, "#fff09a");
  rimGrad.addColorStop(0.78, "#b36d06");
  rimGrad.addColorStop(1, "#4a2702");
  ctx.beginPath();
  ctx.arc(cx, cy, segR * 0.34, 0, 2 * Math.PI);
  ctx.fillStyle = rimGrad;
  ctx.fill();
  ctx.strokeStyle = "#2b1600";
  ctx.lineWidth = 3;
  ctx.stroke();

  /* Glossy 3D center button. */
  const sphGrad = ctx.createRadialGradient(
    cx - innerR * 0.38,
    cy - innerR * 0.44,
    innerR * 0.04,
    cx + innerR * 0.22,
    cy + innerR * 0.25,
    innerR * 1.15,
  );
  sphGrad.addColorStop(0, "#fff5ff");
  sphGrad.addColorStop(0.12, "#f0abfc");
  sphGrad.addColorStop(0.34, "#d946ef");
  sphGrad.addColorStop(0.68, "#7c3aed");
  sphGrad.addColorStop(0.9, "#4c1d95");
  sphGrad.addColorStop(1, "#1d0b4a");
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = sphGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx - innerR * 0.28, cy - innerR * 0.36, innerR * 0.32, innerR * 0.13, -0.45, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.shadowColor = "rgba(255,255,255,0.7)";
  ctx.shadowBlur = 9;
  ctx.fill();
  ctx.restore();

  /* GO text */
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(innerR * 0.6)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 4;
  ctx.fillText("GO", cx, cy);
  ctx.shadowBlur = 0;
}

/* ── Ticker messages ────────────────────────────────────────── */
const TICKER_MSGS = [
  "050****414 a gagné 2 USDT",
  "067****821 a gagné 5 USDT",
  "055****113 a gagné un bonus spécial",
  "078****990 a gagné 10 USDT",
  "091****357 a gagné le grand prix",
  "066****442 a gagné 20 USDT",
];

/* ── Page ───────────────────────────────────────────────────── */
export default function SpinWheelPage() {
  const [, navigate] = useLocation();
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef    = useRef(0);
  const animRef   = useRef<number | null>(null);
  const lightAnimRef = useRef<number | null>(null);
  const spinning  = useRef(false);

  const [rotation, setRotation]     = useState(0);
  const [spinning2, setSpinning2]   = useState(false);
  const [spinTokens, setSpinTokens] = useState(() => user?.spinTokens ?? 0);
  const [totalWon, setTotalWon]     = useState(0);
  const [showRules, setShowRules]   = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [timeLeft, setTimeLeft]   = useState(86389); // ~24h
  const [segments, setSegments] = useState<SpinWheelSegment[]>(DEFAULT_SPIN_WHEEL_SEGMENTS);
  const rotationDrawRef = useRef(rotation);
  const segmentsDrawRef = useRef(segments);

  // Keep local spinTokens in sync when user data refreshes
  useEffect(() => {
    setSpinTokens(user?.spinTokens ?? 0);
  }, [user?.spinTokens]);

  const { data: configuredSegments } = useQuery<SpinWheelSegment[]>({
    queryKey: ["/api/spin-wheel/config"],
  });

  useEffect(() => {
    if (configuredSegments?.length === N) setSegments(configuredSegments);
  }, [configuredSegments]);

  useEffect(() => {
    rotationDrawRef.current = rotation;
    segmentsDrawRef.current = segments;
  }, [rotation, segments]);

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/spin-wheel/spin", {});
      return response.json() as Promise<{
        segmentId: number;
        amount: number;
        label: string;
      }>;
    },
  });

  /* ticker */
  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_MSGS.length), 3500);
    return () => clearInterval(t);
  }, []);

  /* countdown */
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  /* Keep the canvas alive with a subtle moving studio-light reflection. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const animateLight = (time: number) => {
      drawWheel(
        canvas,
        rotationDrawRef.current,
        segmentsDrawRef.current,
        time / 1800,
      );
      lightAnimRef.current = requestAnimationFrame(animateLight);
    };
    lightAnimRef.current = requestAnimationFrame(animateLight);
    return () => {
      if (lightAnimRef.current) cancelAnimationFrame(lightAnimRef.current);
    };
  }, []);

  const handleSpin = useCallback(() => {
    if (spinning.current || spinTokens <= 0 || spinMutation.isPending) return;
    spinning.current = true;
    setSpinning2(true);

    spinMutation.mutate(undefined, {
      onSuccess: (result) => {
        const winIdx = Math.max(0, segments.findIndex((segment) => segment.id === result.segmentId));
        const extra     = Math.PI * 2 * (6 + Math.random() * 4); // 6-10 full turns
        const targetRot = rotRef.current + extra + (Math.PI * 2 - winIdx * ARC);

        const duration = 3500;
        const startTime = performance.now();
        const startRot  = rotRef.current;

        function ease(p: number) {
          return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        }

        function tick(now: number) {
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current  = startRot + (targetRot - startRot) * ease(progress);
          rotRef.current = current;
          setRotation(current);

          if (progress < 1) {
            animRef.current = requestAnimationFrame(tick);
          } else {
            spinning.current = false;
            setSpinning2(false);
            setSpinTokens(prev => Math.max(0, prev - 1));
            setTotalWon(prev => prev + result.amount);
            refreshUser();
            toast({ title: t.wheelCongrats, description: t.wheelWonDesc.replace("{0}", String(result.amount)) });
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

  useEffect(() => () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (lightAnimRef.current) cancelAnimationFrame(lightAnimRef.current);
  }, []);

  const phone = user?.phone ? user.phone : "0000000000";
  const maskedPhone = phone.length > 4 ? phone.slice(0, 4) + "****" + phone.slice(-3) : phone;

  return (
    <>
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #cc1010 0%, #8b0000 40%, #5c0000 100%)",
        backgroundImage: [
          "radial-gradient(ellipse at 50% 0%, #cc1010 0%, #8b0000 40%, #5c0000 100%)",
          "repeating-linear-gradient(90deg, transparent 0px, transparent 28px, rgba(0,0,0,0.12) 28px, rgba(0,0,0,0.12) 30px, transparent 30px, transparent 58px, rgba(255,255,255,0.04) 58px, rgba(255,255,255,0.04) 60px)",
        ].join(", "),
      }}
    >
      {/* ── Gold rope ── */}
      <div
        style={{
          height: 28,
          background: "repeating-linear-gradient(90deg, #b8860b 0px, #ffd700 6px, #ffec6e 10px, #ffd700 14px, #b8860b 20px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          flexShrink: 0,
        }}
      />

      {/* ── Header ── */}
      <div className="flex items-center px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-full mr-2"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white font-extrabold text-lg flex-1 text-center tracking-wide drop-shadow">
          {t.wheelTitle}
        </h1>
        <div className="w-9" />
      </div>

      {/* ── Scrolling ticker ── */}
      <div
        className="mx-4 mb-3 rounded-xl px-3 py-2 flex items-center gap-2 overflow-hidden"
        style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,215,0,0.3)" }}
      >
        <Volume2 className="w-4 h-4 shrink-0" style={{ color: "#ffd700" }} />
        <p
          className="text-sm truncate font-medium transition-all duration-500"
          style={{ color: "#fff" }}
        >
          {TICKER_MSGS[tickerIdx]}
        </p>
      </div>

      {/* ── User card ── */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a0a6b 0%, #2d0f9a 40%, #1a0a6b 100%)",
          border: "2px solid #ffd70066",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Mon Compte badge */}
        <div
          className="absolute top-0 right-0 px-3 py-1 text-xs font-bold"
          style={{ background: "#222", color: "#fff", borderBottomLeftRadius: 12 }}
        >
          {t.wheelMyAccount}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ background: "linear-gradient(135deg, #ffd700, #b8860b)" }}>
            🪙
          </div>
          <p className="text-white font-bold text-base">{maskedPhone}</p>
        </div>
        <p className="text-xs mb-1" style={{ color: "#a78bfa" }}>{t.wheelTotalRewardsLabel}</p>
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-2xl" style={{ color: "#ffd700", textShadow: "0 0 12px #ffd70088" }}>
            {totalWon.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
          </p>
        </div>

        {/* Spin tokens counter */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl">🎡</span>
          <span
            className="text-sm font-bold"
            style={{ color: spinTokens > 0 ? "#ffd700" : "#a78bfa" }}
          >
            {spinTokens > 0
              ? t.wheelSpinsLeft.replace("{0}", String(spinTokens))
              : t.wheelNoSpins}
          </span>
        </div>

      </div>


      {/* ── Wheel ── */}
      <div className="flex flex-col items-center px-2 mb-4">
        {/* Pointer */}
        <div className="relative mb-[-12px] z-10 flex flex-col items-center">
          <div
            style={{
              width: 0, height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderTop: "28px solid #ffd700",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}
          />
        </div>

        {/* Canvas wheel */}
        <div
          style={{
            borderRadius: "50%",
            boxShadow: "0 0 40px rgba(255,215,0,0.4), 0 12px 40px rgba(0,0,0,0.6)",
            cursor: spinning2 ? "not-allowed" : "pointer",
          }}
          onClick={handleSpin}
        >
          <canvas
            ref={canvasRef}
             width={360}
             height={360}
             style={{
               display: "block",
               width: "min(92vw, 360px)",
               height: "min(92vw, 360px)",
               borderRadius: "50%",
             }}
          />
        </div>

      </div>

      {/* ── Bottom buttons ── */}
      <div className="mx-4 mb-8 grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowRules(true)}
          className="py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg, #b8860b 0%, #ffd700 40%, #ffec6e 60%, #ffd700 80%, #b8860b 100%)",
            color: "#1a0a00",
            boxShadow: "0 4px 12px rgba(255,215,0,0.4)",
            border: "1px solid #b8860b",
          }}
        >
          {t.wheelRulesBtn}
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg, #b8860b 0%, #ffd700 40%, #ffec6e 60%, #ffd700 80%, #b8860b 100%)",
            color: "#1a0a00",
            boxShadow: "0 4px 12px rgba(255,215,0,0.4)",
            border: "1px solid #b8860b",
          }}
        >
          {t.wheelSaveBtn}
        </button>
      </div>
    </div>

    {/* ── Modals ── */}
    <WheelRulesModal open={showRules} onClose={() => setShowRules(false)} />
    <WheelHistoryModal open={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}
