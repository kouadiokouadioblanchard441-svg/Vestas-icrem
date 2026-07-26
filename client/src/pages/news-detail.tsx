import { useLocation, useParams } from "wouter";
import { ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Real Power Add / APD conference & factory photos.
const img1 = "/poweradd/poweradd-news-cmef.jpg";
const img2 = "/poweradd/poweradd-factory-lines.jpg";
const img3 = "/poweradd/poweradd-factory-opening.jpg";
const landscapeImg = "/poweradd/poweradd-powerbank-banner.jpg";

export const NEWS_ARTICLES = [
  {
    id: "1",
    title: "Power Add Inc.：自1996年以来积累的专业经验",
    summary:
      "Power Add成立于1996年，是Tekman集团旗下的独立部门，专为客户开发电源解决方案和转换器。",
    body: `Power Add Inc.于1996年作为Tekman集团的独立部门成立。

公司专注于电源解决方案的研发，在台湾新北市设有研发和试制中心，量产业务在台湾和中国大陆进行。

以上信息来源于Power Add官方"关于我们"页面。`,
    image: img1,
    date: "官方来源",
  },
  {
    id: "2",
    title: "Power Add针对不同需求提供的解决方案",
    summary:
      "Power Add提供适配器、开放式电源、U型电源、盒式电源、DC/DC转换器及定制化设计方案。",
    body: `Power Add提供的产品系列涵盖多个品类：

- 1W至50W壁插及桌面适配器
- 30W至350W开放式电源
- 60W至500W U型电源
- 25W至150W盒式电源
- 1W至30W DC/DC转换器
- 1W至500W定制化电源解决方案

以上产品类别和功率范围均来自Power Add官方网站。`,
    image: img2,
    date: "官方产品",
  },
  {
    id: "3",
    title: "Power Add：品质、环保与服务",
    summary:
      "公司致力于持续改进、团队合作，并通过ISO 9001:2015和ISO 14001:2015认证。",
    body: `Power Add表示已于1997年获得ISO 9001认证，2006年获得ISO 14001认证。

公司质量方针旨在整合内外部资源，提供高质量产品，满足客户需求。

公司同时展现了对持续改进、主动性、绩效与团队合作的承诺。如需最新信息及证书，请访问poweradd.com。`,
    image: img3,
    date: "品质与服务",
  },
];

export default function NewsDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { t } = useI18n();

  const article = NEWS_ARTICLES.find((a) => a.id === params.id);

  if (!article) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center" style={{ background: "#315aab" }}>
        <p className="text-white/60">{t.articleNotFound}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#315aab" }}>

      {/* Header */}
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

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Article image */}
        <img
          src={article.image}
          alt={article.title}
          className="w-full rounded-2xl object-cover shadow-md"
          style={{ height: 200 }}
        />

        {/* Title + date */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#E8192C]">{article.title}</h2>
          <p className="text-white/50 text-xs font-semibold">{article.date}</p>
        </div>

        {/* Article body */}
        {article.body.split("\n\n").map((paragraph, i) => (
          <p key={i} className="text-white/90 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <img src={landscapeImg} alt="Power Add" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
