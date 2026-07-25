import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";

import iconHome from "@assets/20260312_091332_1773307680527.png";
import iconProduit from "@assets/20251231_093102_1771507041600-D0EaRzg7_1783245289157.png";
import iconGains from "@assets/3309927_1783248791847.png";
import iconEquipe from "@assets/1244758_1783246767217.png";
import iconCompte from "@assets/téléchargement_(12)_1770815897017.png";

const greenFilter = "brightness(0) saturate(100%) invert(41%) sepia(98%) saturate(1907%) hue-rotate(133deg) brightness(94%) contrast(101%)";
const grayFilter = "brightness(0) saturate(0%) opacity(40%)";

export default function BottomNav() {
  const [location, navigate] = useLocation();
  const { t } = useI18n();
  const navItems = [
    { path: "/", label: t.home, testId: "home", icon: iconHome },
    { path: "/invest", label: t.products, testId: "products", icon: iconProduit },
    { path: "/my-products", label: t.earnings, testId: "earnings", icon: iconGains },
    { path: "/team", label: t.team, testId: "team", icon: iconEquipe },
    { path: "/account", label: t.me, testId: "me", icon: iconCompte },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16 pb-1">
        {navItems.map((item) => {
          const isActive = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (item.path === "/") {
                  window.dispatchEvent(new Event("home-tab-clicked"));
                }
              }}
              className="flex flex-col items-center justify-center flex-1 h-full"
              data-testid={`nav-${item.testId}`}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="w-8 h-8 mb-0.5"
                style={{ filter: isActive ? greenFilter : grayFilter }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#E8192C" : "#6b7280" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
