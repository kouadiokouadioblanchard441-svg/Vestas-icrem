import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Volume2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

/* ── Segments ──────────────────────────────────────────────── */
const SEGMENTS = [
  { label: "Cash",          color: "#315aab", dark: "#1e3d7a", prize: "10 USDT" },
  { label: "2 lucky\ndraws", color: "#16a34a", dark: "#0d6b31", prize: "2 Tirages" },
  { label: "Special\nBonus",color: "#dc2626", dark: "#991b1b", prize: "Special Bonus" },
  { label: "Cash\nRewards", color: "#7c3aed", dark: "#4c1d95", prize: "50 USDT" },
  { label: "Grand\nPrize",  color: "#ea580c", dark: "#9a3412", prize: "100 USDT" },
  { label: "5 lucky\ndraws",color: "#ca8a04", dark: "#854d0e", prize: "5 Tirages" },
  { label: "Cash",          color: "#0891b2", dark: "#0c4a6e", prize: "10 USDT" },
  { label: "Cash\nRewards", color: "#db2777", dark: "#831843", prize: "20 USDT" },
];
const N = SEGMENTS.length;
const ARC = (2 * Math.PI) / N;

/* ── Draw wheel ─────────────────────────────────────────────── */
function drawWheel(canvas: HTMLCanvasElement, rotation: number) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const cx = W / 2;
  const cy = W / 2;
  const outerR = cx - 6;
  const rimR    = outerR - 22;
  const segR    = outerR - 32;
  const innerR  = segR * 0.30;

  ctx.clearRect(0, 0, W, W);

  /* gold outer ring */
  const goldGrad = ctx.createRadialGradient(cx, cy, rimR, cx, cy, outerR);
  goldGrad.addColorStop(0,   "#b8860b");
  goldGrad.addColorStop(0.4, "#ffd700");
  goldGrad.addColorStop(0.7, "#ffec6e");
  goldGrad.addColorStop(1,   "#b8860b");
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
  ctx.fillStyle = goldGrad;
  ctx.fill();

  /* coin dots on outer ring */
  const dotCount = 20;
  for (let i = 0; i < dotCount; i++) {
    const a = rotation + (i / dotCount) * 2 * Math.PI;
    const dr = (outerR + rimR) / 2;
    const dx = cx + Math.cos(a) * dr;
    const dy = cy + Math.sin(a) * dr;
    ctx.beginPath();
    ctx.arc(dx, dy, 8, 0, 2 * Math.PI);
    const cg = ctx.createRadialGradient(dx - 2, dy - 2, 0, dx, dy, 8);
    cg.addColorStop(0, "#fffde4");
    cg.addColorStop(0.5, "#ffd700");
    cg.addColorStop(1, "#b8860b");
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = "#8B6914";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* segments */
  for (let i = 0; i < N; i++) {
    const seg = SEGMENTS[i];
    const start = rotation + i * ARC - Math.PI / 2;
    const end   = start + ARC;

    /* segment fill */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, segR, start, end);
    ctx.closePath();

    const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, segR);
    sg.addColorStop(0,   seg.dark);
    sg.addColorStop(0.5, seg.color);
    sg.addColorStop(1,   seg.dark);
    ctx.fillStyle = sg;
    ctx.fill();
    ctx.strokeStyle = "#FFD70099";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* coin icon on segment */
    const coinA = start + ARC / 2;
    const coinD = segR * 0.72;
    const coinX = cx + Math.cos(coinA) * coinD;
    const coinY = cy + Math.sin(coinA) * coinD;
    ctx.beginPath();
    ctx.arc(coinX, coinY, 11, 0, 2 * Math.PI);
    const ic = ctx.createRadialGradient(coinX - 3, coinY - 3, 0, coinX, coinY, 11);
    ic.addColorStop(0, "#fff8c0");
    ic.addColorStop(0.5, "#ffd700");
    ic.addColorStop(1, "#b8860b");
    ctx.fillStyle = ic;
    ctx.fill();
    ctx.strokeStyle = "#8B6914";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#8B6914";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", coinX, coinY);

    /* label text */
    const midA = start + ARC / 2;
    const textD = segR * 0.42;
    ctx.save();
    ctx.translate(cx + Math.cos(midA) * textD, cy + Math.sin(midA) * textD);
    ctx.rotate(midA + Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 3;
    const lines = seg.label.split("\n");
    lines.forEach((line, li) => {
      ctx.fillText(line, 0, (li - (lines.length - 1) / 2) * 13);
    });
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* inner rim */
  const rimGrad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, segR * 0.32);
  rimGrad.addColorStop(0, "#b8860b");
  rimGrad.addColorStop(0.5, "#ffd700");
  rimGrad.addColorStop(1, "#b8860b");
  ctx.beginPath();
  ctx.arc(cx, cy, segR * 0.32, 0, 2 * Math.PI);
  ctx.fillStyle = rimGrad;
  ctx.fill();

  /* center GO sphere */
  const sphGrad = ctx.createRadialGradient(cx - innerR * 0.3, cy - innerR * 0.3, 0, cx, cy, innerR);
  sphGrad.addColorStop(0, "#f0abfc");
  sphGrad.addColorStop(0.4, "#d946ef");
  sphGrad.addColorStop(0.8, "#7c3aed");
  sphGrad.addColorStop(1, "#4c1d95");
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = sphGrad;
  ctx.fill();

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
  "050****414 a retiré avec succès 2 040 XOF",
  "067****821 a retiré avec succès 5 200 XOF",
  "055****113 a gagné Special Bonus",
  "078****990 a retiré avec succès 1 500 XOF",
  "091****357 a gagné Grand Prize",
  "066****442 a retiré avec succès 3 780 XOF",
];

/* ── Page ───────────────────────────────────────────────────── */
export default function SpinWheelPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef    = useRef(0);
  const animRef   = useRef<number | null>(null);
  const spinning  = useRef(false);

  const [rotation, setRotation]   = useState(0);
  const [spinning2, setSpinning2] = useState(false);
  const [prize, setPrize]         = useState<string | null>(null);
  const [draws, setDraws]         = useState(5);
  const [totalWon, setTotalWon]   = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [timeLeft, setTimeLeft]   = useState(86389); // ~24h

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

  /* draw on each rotation change */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawWheel(canvas, rotation);
  }, [rotation]);

  /* initial draw */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawWheel(canvas, 0);
  }, []);

  const handleSpin = useCallback(() => {
    if (spinning.current || draws <= 0) return;
    spinning.current = true;
    setSpinning2(true);
    setPrize(null);

    const winIdx    = Math.floor(Math.random() * N);
    const extra     = Math.PI * 2 * (6 + Math.random() * 4); // 6-10 full turns
    const targetRot = rotRef.current + extra + (Math.PI * 2 - winIdx * ARC);

    const duration = 3500;
    const start    = performance.now();
    const startRot = rotRef.current;

    function ease(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function tick(now: number) {
      const elapsed = now - start;
      const t       = Math.min(elapsed / duration, 1);
      const current = startRot + (targetRot - startRot) * ease(t);
      rotRef.current = current;
      setRotation(current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        spinning.current = false;
        setSpinning2(false);
        const won = SEGMENTS[winIdx];
        setPrize(won.prize);
        setDraws(d => Math.max(0, d - 1));
        if (!won.prize.includes("Tirage")) {
          const amount = parseFloat(won.prize);
          if (!isNaN(amount)) setTotalWon(t => t + amount);
        }
        toast({ title: `🎉 Félicitations !`, description: `Vous avez gagné : ${won.prize}` });
      }
    }

    animRef.current = requestAnimationFrame(tick);
  }, [draws, toast]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const phone = user?.phone ? user.phone : "0000000000";
  const maskedPhone = phone.length > 4 ? phone.slice(0, 4) + "****" + phone.slice(-3) : phone;

  return (
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
          Tirage Au Sort
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
          Mon Compte
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ background: "linear-gradient(135deg, #ffd700, #b8860b)" }}>
            🪙
          </div>
          <p className="text-white font-bold text-base">{maskedPhone}</p>
        </div>
        <p className="text-xs mb-1" style={{ color: "#a78bfa" }}>Récompenses Totales :</p>
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-2xl" style={{ color: "#ffd700", textShadow: "0 0 12px #ffd70088" }}>
            XOF {(totalWon * 655).toLocaleString("fr-FR") || "0"}
          </p>
          <button
            className="px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #ffd700, #f59e0b)", color: "#1a0a00" }}
          >
            Retrait
          </button>
        </div>

      </div>


      {/* ── Wheel ── */}
      <div className="flex flex-col items-center px-4 mb-4">
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
            width={300}
            height={300}
            style={{ display: "block", borderRadius: "50%" }}
          />
        </div>

        {prize && (
          <div
            className="mt-4 px-6 py-3 rounded-2xl text-center font-extrabold text-lg shadow-xl"
            style={{
              background: "linear-gradient(135deg, #ffd700, #f59e0b)",
              color: "#1a0a00",
              boxShadow: "0 8px 24px rgba(255,215,0,0.4)",
            }}
          >
            🎉 Vous avez gagné : {prize}
          </div>
        )}
      </div>

      {/* ── Bottom buttons ── */}
      <div className="mx-4 mb-8 grid grid-cols-2 gap-3">
        <button
          className="py-3 rounded-2xl font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          Règles
        </button>
        <button
          className="py-3 rounded-2xl font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
