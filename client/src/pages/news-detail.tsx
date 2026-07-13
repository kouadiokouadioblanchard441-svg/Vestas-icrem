import { useLocation, useParams } from "wouter";
import { ChevronLeft } from "lucide-react";

import img1 from "@assets/Philippines-Exhibition-May-19-2026-2_1783947359298.webp";
import img2 from "@assets/vestas_112v_closeup_1783210181172.jpg";
import img3 from "@assets/vestas_112v_closeup_(1)_1783210181118.jpg";

export const NEWS_ARTICLES = [
  {
    id: "1",
    title: "SpolarPV — Exposition Philippines 2026",
    summary:
      "L'exposition de mai 2026 aux Philippines a été un succès retentissant pour SpolarPV. Des milliers de visiteurs ont découvert nos dernières innovations en énergie solaire.",
    body: `L'exposition internationale de mai 2026 aux Philippines a marqué un tournant majeur pour SpolarPV sur le marché asiatique.

Pendant 5 jours, nos équipes ont présenté les toutes dernières solutions photovoltaïques de la gamme SpolarPV, capables de produire jusqu'à 3,45 MW d'énergie propre par installation.

Les investisseurs présents ont été particulièrement intéressés par notre programme de rendement journalier, qui garantit des revenus stables et prévisibles sur une période de 90 jours.

Cette exposition confirme la position de SpolarPV comme leader mondial de l'énergie solaire durable, avec plus de 100 GW de capacité installée dans le monde entier.

Rejoignez-nous dans cette aventure et commencez dès aujourd'hui à investir dans un avenir plus vert et plus rentable.`,
    image: img1,
    date: "19 Mai 2026",
  },
  {
    id: "2",
    title: "Nouvelle gamme SpolarPV — Performances record en 2026",
    summary:
      "SpolarPV établit de nouveaux records de production d'énergie solaire. Découvrez comment cette technologie révolutionne le secteur et booste vos investissements.",
    body: `SpolarPV a établi en 2026 un nouveau record mondial de production d'énergie solaire en conditions réelles.

Avec un rendement moyen de 48 %, bien au-dessus de la moyenne du secteur (35 %), nos panneaux représentent l'état de l'art en matière d'ingénierie photovoltaïque.

Nos modules à haute densité capturent la lumière solaire de manière optimale, même par faible ensoleillement. Le système de contrôle intelligent ajuste automatiquement l'orientation des panneaux pour maximiser la production.

Pour nos investisseurs, cela se traduit directement par des revenus quotidiens fiables et une rentabilité accrue sur toute la durée du cycle d'investissement.

Investir dans SpolarPV, c'est choisir la technologie la plus avancée au monde au service de votre patrimoine financier.`,
    image: img2,
    date: "10 Juin 2026",
  },
  {
    id: "3",
    title: "Expansion SpolarPV en Afrique francophone — Plan 2026–2027",
    summary:
      "SpolarPV accélère son développement en Afrique de l'Ouest et Centrale. Un plan ambitieux pour apporter l'énergie propre et des opportunités d'investissement à toute la région.",
    body: `SpolarPV annonce un plan d'expansion ambitieux pour l'Afrique francophone couvrant la période 2026–2027.

Ce plan prévoit l'installation de 200 nouvelles fermes solaires dans des pays clés comme le Sénégal, la Côte d'Ivoire, le Tchad, le Cameroun et le Burkina Faso, pour une capacité totale de 690 MW.

L'objectif est double : contribuer à la transition énergétique du continent africain et offrir à nos investisseurs locaux des opportunités de rendement exceptionnelles, directement liées à la performance de nos installations.

Les investisseurs qui rejoignent notre plateforme bénéficient de revenus quotidiens issus directement de la production d'énergie de nos parcs solaires en exploitation.

Ensemble, nous construisons un avenir énergétique durable pour l'Afrique tout en faisant fructifier votre épargne de façon sécurisée et transparente.`,
    image: img3,
    date: "5 Juillet 2026",
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
    <div className="flex flex-col min-h-full pb-24" style={{ background: "#f0f2f5" }}>

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
        <div className="w-12 h-1 rounded-full mb-4" style={{ background: "#00A651" }} />
        {article.body.split("\n\n").map((paragraph, i) => (
          <p key={i} className="text-gray-600 text-sm leading-relaxed mb-3">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
