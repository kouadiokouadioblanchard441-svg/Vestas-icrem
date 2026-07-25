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
      <div className="flex flex-col min-h-full items-center justify-center" style={{ background: "#315aab" }}>
        <p className="text-white/60">Article introuvable</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#315aab" }}>

      {/* Header blanc — même style que À propos */}
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <button
          onClick={() => navigate("/")}
          className="p-1"
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6 line-clamp-1">
          {article.title}
        </h1>
      </header>

      {/* Contenu directement sur le fond bleu */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Image de l'article */}
        <img
          src={article.image}
          alt={article.title}
          className="w-full rounded-2xl object-cover shadow-md"
          style={{ height: 200 }}
        />

        {/* Titre + date */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#F59E0B]">{article.title}</h2>
          <p className="text-white/50 text-xs font-semibold">{article.date}</p>
        </div>

        {/* Corps de l'article */}
        {article.body.split("\n\n").map((paragraph, i) => (
          <p key={i} className="text-white/90 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <img src={landscapeImg} alt="Power Add — composants électroniques" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
