import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getContent } from "@/lib/content";
import landscapeImg from "@assets/High-Efficiency-Cis-Solar-Panel-Monocrystalline-Solar-Module-_1783948797085.webp";

export default function AboutPage() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const pageTitle = getContent(settings, "content_about_pageTitle", "A propos de nous");
  const s1Title = getContent(settings, "content_about_s1Title", "Qui sommes-nous ?");
  const s1Text1 = getContent(settings, "content_about_s1Text1", "SpolarPV est le leader mondial du secteur de l'énergie solaire. L'entreprise conçoit, fabrique, installe et entretient des panneaux solaires terrestres et des solutions énergétiques dans le monde entier.");
  const s1Text2 = getContent(settings, "content_about_s1Text2", "Grâce à notre expertise et à notre réseau mondial, nous offrons à nos utilisateurs des opportunités uniques de générer des revenus quotidiens en participant au financement et à l'expansion de la marque SpolarPV à l'échelle internationale.");
  const s2Title = getContent(settings, "content_about_s2Title", "🏭 Fabrication et Installation");
  const s2Text = getContent(settings, "content_about_s2Text", "Conception de panneaux solaires : Développement de solutions photovoltaïques de haute technologie adaptées à différents climats et conditions d'ensoleillement. SpolarPV produit industriellement les modules, les onduleurs et les composants clés de chaque installation.");
  const s3Title = getContent(settings, "content_about_s3Title", "Notre héritage");
  const s3Text = getContent(settings, "content_about_s3Text", "Aujourd'hui, SpolarPV est présente dans plus de 80 pays avec des milliers d'installations solaires à travers le monde, devenant ainsi la marque référence de l'énergie renouvelable à l'échelle internationale.");
  const s4Title = getContent(settings, "content_about_s4Title", "Sécurité et Fiabilité");
  const s4Text = getContent(settings, "content_about_s4Text", "La sécurité de vos fonds et la transparence de nos opérations sont nos priorités absolues. L'empreinte de SpolarPV dans le domaine de l'énergie solaire illustre parfaitement la capacité d'une entreprise à conjuguer qualité, innovation et stratégie de marque pérenne.");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#87CEEB" }}>
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
          <p className="text-gray-600 leading-relaxed">{s1Text1}</p>
          <p className="text-gray-600 leading-relaxed">{s1Text2}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F59E0B]">{s2Title}</h2>
          <p className="text-gray-600 leading-relaxed">{s2Text}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F59E0B]">{s3Title}</h2>
          <p className="text-gray-600 leading-relaxed">{s3Text}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F59E0B]">{s4Title}</h2>
          <p className="text-gray-600 leading-relaxed">{s4Text}</p>
        </div>
      </div>
      <img src={landscapeImg} alt="SpolarPV" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
