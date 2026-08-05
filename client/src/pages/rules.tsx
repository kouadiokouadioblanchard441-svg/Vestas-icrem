import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import landscapeImg from "@assets/portable-charger-power-banks_480x480_d6b67d82-6118-4295-be02-e_1784966597898.jpg";
import { getContent } from "@/lib/content";

export default function RulesPage() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const signupBonus = settings?.signupBonus || "200";
  const minDeposit = settings?.minDeposit || "4000";
  const minWithdrawal = settings?.minWithdrawal || "1500";
  const withdrawalFees = settings?.withdrawalFees || "18";
  const withdrawalStartHour = settings?.withdrawalStartHour || "9";
  const withdrawalEndHour = settings?.withdrawalEndHour || "17";
  const maxWithdrawalsPerDay = settings?.maxWithdrawalsPerDay || "1";
  const lv1 = settings?.level1Commission || "15";
  const lv2 = settings?.level2Commission || "2";
  const lv3 = settings?.level3Commission || "1";

  const rPageTitle = getContent(settings, "content_rulespage_pageTitle", "平台规则");
  const rS1Title = getContent(settings, "content_rulespage_s1Title", "1. 投资");
  const rS1b1 = getContent(settings, "content_rulespage_s1b1", "每位用户可以同时拥有多个投资产品。");
  const rS1b2 = getContent(settings, "content_rulespage_s1b2", "收益每日产生，并每24小时自动计入账户余额。");
  const rS1b3 = getContent(settings, "content_rulespage_s1b3", "标准投资周期为80天，特殊产品另有说明。");
  const rS2Title = getContent(settings, "content_rulespage_s2Title", "2. 充值与提现");
  const rS3Title = getContent(settings, "content_rulespage_s3Title", "3. 推荐系统");
  const rS3b4 = getContent(settings, "content_rulespage_s3b4", "欺诈活动或通过创建多个账户操纵系统将导致账户被暂停。");
  const rS4Title = getContent(settings, "content_rulespage_s4Title", "4. 注册奖励");
  const rS5Title = getContent(settings, "content_rulespage_s5Title", "5. 安全");
  const rS5b1 = getContent(settings, "content_rulespage_s5b1", "您有责任保护好自己的密码。");
  const rS5b2 = getContent(settings, "content_rulespage_s5b2", "请勿与他人分享您的登录信息。");
  const rS5b3 = getContent(settings, "content_rulespage_s5b3", "官方客服绝不会向您索要密码。");

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f5f5f5" }}>
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">{rPageTitle}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#E8192C] border-l-4 border-[#E8192C] pl-3">{rS1Title}</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/90 text-sm">
            <li>{rS1b1}</li>
            <li>{rS1b2}</li>
            <li>{rS1b3}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#E8192C] border-l-4 border-[#E8192C] pl-3">{rS2Title}</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/90 text-sm">
            <li>最低充值金额为 {parseInt(minDeposit).toLocaleString()} USDT。</li>
            <li>最低提现金额为 {parseInt(minWithdrawal).toLocaleString()} USDT。</li>
            <li>提现手续费为 {withdrawalFees}%，用于支付交易和维护费用。</li>
            <li>提现时间为工作日 {withdrawalStartHour}:00 至 {withdrawalEndHour}:00。</li>
            <li>每位用户每天最多提现 {maxWithdrawalsPerDay} 次。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#E8192C] border-l-4 border-[#E8192C] pl-3">{rS3Title}</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/90 text-sm">
            <li>一级推荐佣金：下级首次投资的 {lv1}%。</li>
            <li>二级推荐佣金：下级首次投资的 {lv2}%。</li>
            <li>三级推荐佣金：下级首次投资的 {lv3}%。</li>
            <li>{rS3b4}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#E8192C] border-l-4 border-[#E8192C] pl-3">{rS4Title}</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/90 text-sm">
            <li>每位新会员注册后可获得 {parseInt(signupBonus).toLocaleString()} USDT 奖励。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#E8192C] border-l-4 border-[#E8192C] pl-3">{rS5Title}</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/90 text-sm">
            <li>{rS5b1}</li>
            <li>{rS5b2}</li>
            <li>{rS5b3}</li>
          </ul>
        </section>
      </div>
      <img src={landscapeImg} alt="Powerade" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
