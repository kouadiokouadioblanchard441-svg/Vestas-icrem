import { useQuery } from "@tanstack/react-query";

interface SettingsLinks {
  supportLink: string;
  supportType: string;
  supportLabel: string;
}

interface FloatingSupportProps {
  /** Extra bottom offset in px — use 72 on pages with bottom nav, 24 otherwise */
  bottomOffset?: number;
}

export function FloatingSupport({ bottomOffset = 24 }: FloatingSupportProps) {
  const { data } = useQuery<SettingsLinks>({
    queryKey: ["/api/settings/links"],
    staleTime: 5 * 60 * 1000,
  });

  const link = data?.supportLink || "#";

  const handleClick = () => {
    if (link && link !== "#") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes fs-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes fs-pulse2 {
          0%   { transform: scale(1);   opacity: 0.35; }
          70%  { transform: scale(1.85); opacity: 0; }
          100% { transform: scale(1.85); opacity: 0; }
        }
        @keyframes fs-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        .fs-btn:active { transform: scale(0.92); }
      `}</style>

      <button
        className="fs-btn"
        onClick={handleClick}
        aria-label="Service client"
        style={{
          position: "fixed",
          right: 18,
          bottom: bottomOffset,
          zIndex: 200,
          width: 62,
          height: 62,
          borderRadius: "50%",
          border: "none",
          padding: 0,
          cursor: "pointer",
          background: "transparent",
          animation: "fs-bob 3s ease-in-out infinite",
          transition: "transform 0.15s ease",
        }}
      >
        {/* Pulse ring 1 */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(22,163,74,0.55)",
            animation: "fs-pulse 2.2s ease-out infinite",
            pointerEvents: "none",
          }}
        />
        {/* Pulse ring 2 */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(22,163,74,0.30)",
            animation: "fs-pulse2 2.2s ease-out infinite 0.4s",
            pointerEvents: "none",
          }}
        />

        {/* Main circle */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)",
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
            border: "2.5px solid #16A34A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Agent SVG avatar */}
          <svg
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            {/* Head */}
            <circle cx="19" cy="13.5" r="6.5" fill="#FBBF24" />
            {/* Hair */}
            <path
              d="M12.5 12C12.5 8.41 15.41 5.5 19 5.5C22.59 5.5 25.5 8.41 25.5 12V12.5C24 11.2 21.8 10.5 19 10.5C16.2 10.5 14 11.2 12.5 12.5V12Z"
              fill="#92400E"
            />
            {/* Body / shirt */}
            <path
              d="M10 30C10 24.477 14.03 20 19 20C23.97 20 28 24.477 28 30H10Z"
              fill="#16A34A"
            />
            {/* Collar */}
            <path d="M17 20L19 24L21 20" fill="white" />
            {/* Headset arc */}
            <path
              d="M11.5 14C11.5 9.306 14.91 5.5 19 5.5C23.09 5.5 26.5 9.306 26.5 14"
              stroke="#1E40AF"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left earpiece */}
            <rect x="10" y="13.5" width="3" height="5" rx="1.5" fill="#1E40AF" />
            {/* Right earpiece */}
            <rect x="25" y="13.5" width="3" height="5" rx="1.5" fill="#1E40AF" />
            {/* Mic boom */}
            <path
              d="M13 17.5 Q10 20 11.5 22.5"
              stroke="#1E40AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Mic head */}
            <circle cx="11.5" cy="23" r="1.2" fill="#1E40AF" />
          </svg>
        </span>
      </button>
    </>
  );
}
