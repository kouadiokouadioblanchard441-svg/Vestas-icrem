import { useLocation, useParams } from "wouter";
import { ChevronLeft } from "lucide-react";

// Real Power Add / APD conference & factory photos.
const img1 = "/poweradd/poweradd-news-cmef.jpg";
const img2 = "/poweradd/poweradd-factory-lines.jpg";
const img3 = "/poweradd/poweradd-factory-opening.jpg";
const landscapeImg = "/poweradd/poweradd-powerbank-banner.jpg";

export const NEWS_ARTICLES = [
  {
    id: "1",
    title: "Power Add Inc. : une expertise construite depuis 1996",
    summary:
      "Fondée en 1996 comme unité indépendante du groupe Tekman, Power Add développe des solutions d’alimentation et des convertisseurs pour ses clients.",
    body: `Power Add Inc. a été fondée en 1996 comme unité indépendante du groupe Tekman.

L’entreprise est spécialisée dans le développement de solutions d’alimentation électrique et dispose de capacités de recherche et développement ainsi que de fabrication pilote à New Taipei City, à Taïwan. La production de masse est réalisée à Taïwan et en Chine.

Ces informations proviennent de la page officielle « About Us » de Power Add.`,
    image: img1,
    date: "Source officielle",
  },
  {
    id: "2",
    title: "Les solutions Power Add pour différents besoins",
    summary:
      "Power Add propose des adaptateurs, alimentations open frame, alimentations en U, modèles box, convertisseurs DC/DC et conceptions sur mesure.",
    body: `La gamme présentée par Power Add couvre plusieurs familles de produits :

- Adaptateurs muraux et de bureau de 1 W à 50 W
- Alimentations open frame de 30 W à 350 W
- Alimentations en U de 60 W à 500 W
- Alimentations box de 25 W à 150 W
- Convertisseurs DC/DC de 1 W à 30 W
- Solutions d’alimentation sur mesure de 1 W à 500 W

Ces catégories et puissances sont celles publiées sur le site officiel de Power Add.`,
    image: img2,
    date: "Produits officiels",
  },
  {
    id: "3",
    title: "Power Add : qualité, environnement et service",
    summary:
      "L’entreprise met en avant l’amélioration continue, le travail d’équipe et ses certifications ISO 9001:2015 et ISO 14001:2015.",
    body: `Power Add indique être certifiée ISO 9001 depuis 1997 et ISO 14001 depuis 2006.

Sa politique qualité vise à mobiliser ses ressources internes et externes pour fournir une production de qualité et répondre aux attentes de ses clients.

L’entreprise présente également un engagement d’amélioration continue, d’initiative, de performance et de travail d’équipe. Consultez poweradd.com pour les informations et certificats à jour.`,
    image: img3,
    date: "Qualité et service",
  },
];

export default function NewsDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const article = NEWS_ARTICLES.find((a) => a.id === params.id);

  if (!article) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center" style={{ background: "#f0f2f5" }}>
        <p className="text-gray-400">Article introuvable</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#315aab" }}>

      {/* Hero image */}
      <div className="relative w-full" style={{ height: 240 }}>
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)" }} />

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 p-2 rounded-full backdrop-blur-sm"
          style={{ background: "rgba(255,255,255,0.20)" }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Date badge */}
        <span
          className="absolute top-4 right-4 text-white text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: "rgba(0,166,81,0.85)" }}
        >
          {article.date}
        </span>
      </div>

      {/* Content card */}
      <div className="mx-3 -mt-6 relative z-10 bg-white rounded-2xl shadow-md px-4 pt-5 pb-6">
        <h1 className="text-gray-900 font-extrabold text-base leading-snug mb-3">
          {article.title}
        </h1>
        <div className="w-12 h-1 rounded-full mb-4" style={{ background: "#F59E0B" }} />
        {article.body.split("\n\n").map((paragraph, i) => (
          <p key={i} className="text-gray-600 text-sm leading-relaxed mb-3">
            {paragraph}
          </p>
        ))}
      </div>
      <img src={landscapeImg} alt="Power Add — composants électroniques" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
