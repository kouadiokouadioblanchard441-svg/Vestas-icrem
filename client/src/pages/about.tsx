import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getContent } from "@/lib/content";

export default function AboutPage() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const pageTitle = getContent(settings, "content_about_pageTitle", "关于我们");
  const s1Title = getContent(settings, "content_about_s1Title", "我们是谁？");
  const s1Text1 = getContent(settings, "content_about_s1Text1", "Power Add 成立于1996年，是 Tekman 集团旗下的独立部门，专注于电源解决方案，并在台湾新北市设有研发能力。");
  const s1Text2 = getContent(settings, "content_about_s1Text2", "Power Add 在台湾进行研发和试生产，在台湾和中国进行大规模生产。");
  const s2Title = getContent(settings, "content_about_s2Title", "产品与解决方案");
  const s2Text = getContent(settings, "content_about_s2Text", "产品范围包括适配器、开放式电源、U 型电源、盒式电源、DC/DC 转换器以及 1W 至 500W 的定制设计。");
  const s3Title = getContent(settings, "content_about_s3Title", "制造能力");
  const s3Text = getContent(settings, "content_about_s3Text", "Power Add 拥有两个生产基地：台湾基地负责研发和试生产，中国广东基地负责大规模生产。");
  const s4Title = getContent(settings, "content_about_s4Title", "质量与承诺");
  const s4Text = getContent(settings, "content_about_s4Text", "Power Add 自1997年起通过 ISO 9001 认证，并于2006年通过 ISO 14001 认证，持续重视质量、性能和团队合作。");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#0d0d0d" }}>
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
          <h2 className="text-xl font-bold text-[#E8192C]">{s1Title}</h2>
          <p className="text-white/90 leading-relaxed">{s1Text1}</p>
          <p className="text-white/90 leading-relaxed">{s1Text2}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#E8192C]">{s2Title}</h2>
          <p className="text-white/90 leading-relaxed">{s2Text}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#E8192C]">{s3Title}</h2>
          <p className="text-white/90 leading-relaxed">{s3Text}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#E8192C]">{s4Title}</h2>
          <p className="text-white/90 leading-relaxed">{s4Text}</p>
        </div>
      </div>
      <img src="/poweradd/poweradd-about-dark.jpg" alt="Power Add — composants électroniques" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
