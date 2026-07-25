import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getContent } from "@/lib/content";

export default function AboutPage() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const pageTitle = getContent(settings, "content_about_pageTitle", "A propos de nous");
  const s1Title = getContent(settings, "content_about_s1Title", "Qui sommes-nous ?");
  const s1Text1 = getContent(settings, "content_about_s1Text1", "Power Add Inc. a été fondée en 1996 comme unité indépendante du groupe Tekman. L’entreprise est spécialisée dans les solutions d’alimentation électrique et dispose de capacités de recherche et développement à New Taipei City, à Taïwan.");
  const s1Text2 = getContent(settings, "content_about_s1Text2", "Power Add réalise la recherche et la fabrication pilote à Taïwan, tandis que la production de masse est réalisée à Taïwan et en Chine.");
  const s2Title = getContent(settings, "content_about_s2Title", "Produits et solutions");
  const s2Text = getContent(settings, "content_about_s2Text", "La gamme comprend des adaptateurs, des alimentations open frame, des alimentations en U, des alimentations box, des convertisseurs DC/DC et des conceptions sur mesure de 1 W à 500 W.");
  const s3Title = getContent(settings, "content_about_s3Title", "Capacités de fabrication");
  const s3Text = getContent(settings, "content_about_s3Text", "Power Add présente deux sites de fabrication : un site à Taïwan pour la recherche et la production pilote, et un site à Guangdong, en Chine, pour la production de masse.");
  const s4Title = getContent(settings, "content_about_s4Title", "Qualité et engagement");
  const s4Text = getContent(settings, "content_about_s4Text", "Power Add indique être certifiée ISO 9001 depuis 1997 et ISO 14001 depuis 2006. L’entreprise met en avant l’amélioration continue, la qualité, la performance et le travail d’équipe.");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#315aab" }}>
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">{pageTitle}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F59E0B]">{s1Title}</h2>
          <p className="text-white/90 leading-relaxed">{s1Text1}</p>
          <p className="text-white/90 leading-relaxed">{s1Text2}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F59E0B]">{s2Title}</h2>
          <p className="text-white/90 leading-relaxed">{s2Text}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F59E0B]">{s3Title}</h2>
          <p className="text-white/90 leading-relaxed">{s3Text}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F59E0B]">{s4Title}</h2>
          <p className="text-white/90 leading-relaxed">{s4Text}</p>
        </div>
      </div>
      <img src="/poweradd/poweradd-about-dark.jpg" alt="Power Add — composants électroniques" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
