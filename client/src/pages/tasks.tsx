import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCountryByCode } from "@/lib/countries";
import { getContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, Loader2, Trophy, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import type { Task } from "@shared/schema";
import trophyImg from "@assets/piedestal-realiste-trophees-gobelets-metal-composition-rubans-_1785098538437.jpg";
const poweraddLogo = "/poweradd/poweradd-logo-official.png";
import iconBronze from "@assets/344464_1773318022355.png";
import iconArgent from "@assets/817729_1773318022328.png";
import iconOr from "@assets/sac-argent-gros-tas-illustration-icone-argent-comptant-icone-p_1773318022388.jpg";
import iconPlatine from "@assets/1751761_1773318022264.png";
import iconDiamant from "@assets/3275655_1773318022415.png";

interface TaskWithStatus extends Task {
  isCompleted: boolean;
  canClaim: boolean;
  currentInvites: number;
}

const TIER_COLORS = [
  { bg: "from-red-700 to-red-500" },
  { bg: "from-gray-500 to-gray-400" },
  { bg: "from-red-600 to-red-400" },
  { bg: "from-cyan-600 to-cyan-400" },
  { bg: "from-red-700 to-red-500" },
  { bg: "from-purple-700 to-purple-500" },
];

const TIER_ICONS = [iconBronze, iconArgent, iconOr, iconPlatine, iconDiamant, iconBronze];

export default function TasksPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const { data: tasks, isLoading } = useQuery<TaskWithStatus[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const TIER_LABELS = [
    t.taskTierBronze,
    t.taskTierSilver,
    t.taskTierGold,
    t.taskTierPlatinum,
    t.taskTierDiamond,
    t.taskTierElite,
  ];

  const claimMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/claim`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      refreshUser();
      toast({ title: t.tasksRewardClaimed, description: t.tasksRewardClaimedDesc });
    },
    onError: (error: any) => {
      toast({ title: error.message || t.errorOccurred, variant: "destructive" });
    },
  });

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency = countryInfo?.currency || "USDT";
  const totalTaskRewards = tasks?.filter(tk => tk.isCompleted).reduce((sum, tk) => sum + tk.reward, 0) || 0;
  const completedCount = tasks?.filter(tk => tk.isCompleted).length || 0;
  const claimableCount = tasks?.filter(tk => tk.canClaim && !tk.isCompleted).length || 0;

  const headerTitle = getContent(settings, "content_tasks_headerTitle", t.taskTierBronze ? t.team : "推荐计划");
  const headerSubtitle = getContent(settings, "content_tasks_headerSubtitle", t.taskTierBronze ? t.salaryInviteDesc.replace("{0}", "") : "邀请好友并获得奖励");
  const tiersTitle = getContent(settings, "content_tasks_tiersTitle", t.taskTierBronze ? t.taskTierBronze.split(" ")[0] : "推荐等级");
  const claimAllButton = getContent(settings, "content_tasks_claimAllButton", t.taskClaim);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f5f7fb" }}>

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ height: "260px" }}>
        <img
          src={trophyImg}
          alt="Trophées"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.85) 100%)" }}
        />

        {/* Header nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center px-4 pt-4">
          <Link href="/">
            <button
              className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center"
              data-testid="button-back"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <div className="flex-1 flex justify-center">
            <img src={poweraddLogo} alt="Power Add" className="h-8 object-contain" />
          </div>
          <div className="w-9" />
        </div>

        <div className="absolute left-4 right-4" style={{ bottom: "60px" }}>
          <h1 className="text-white font-bold text-xl leading-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {headerTitle}
          </h1>
          <p className="text-white text-xs mt-1" style={{ opacity: 0.92, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
            {headerSubtitle}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mx-4 -mt-10 z-10 relative">
        <div className="bg-white rounded-2xl shadow-lg p-3 flex items-center justify-between">
          <div className="flex-1 text-center border-r border-gray-100">
            <p className="text-[#E8320A] text-lg font-bold" data-testid="text-total-rewards">
              {totalTaskRewards.toLocaleString()}
            </p>
            <p className="text-gray-500 text-[11px] mt-0.5">{t.taskEarned} ({currency})</p>
          </div>
          <div className="flex-1 text-center border-r border-gray-100">
            <p className="text-[#E8320A] text-lg font-bold">{completedCount}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">{t.taskCompleted}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[#E8320A] text-lg font-bold">{claimableCount}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">{t.taskClaimable}</p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="mx-4 mt-4 mb-16">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#E8320A]" />
            <h2 className="text-gray-800 font-bold text-sm">{tiersTitle}</h2>
          </div>
          {claimableCount > 0 && (
            <button
              onClick={async () => {
                const claimable = tasks?.filter(tk => tk.canClaim && !tk.isCompleted) || [];
                for (const task of claimable) {
                  try { await claimMutation.mutateAsync(task.id); } catch {}
                }
              }}
              disabled={claimMutation.isPending}
              className="text-xs text-[#E8320A] font-semibold bg-red-50 px-3 py-1.5 rounded-full"
              data-testid="button-claim-rewards"
            >
              {claimAllButton} ({claimableCount})
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task, index) => {
              const tier = TIER_COLORS[index] || TIER_COLORS[0];
              const label = TIER_LABELS[index] || `${t.tasksTierFallback} ${index + 1}`;
              const icon = TIER_ICONS[index] || TIER_ICONS[0];
              const progress = Math.min(
                (task.currentInvites / Math.max(task.requiredInvites, 1)) * 100,
                100,
              );
              const progressComplete = task.currentInvites >= task.requiredInvites;

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-sm border ${
                    task.isCompleted
                      ? "border-red-200"
                      : task.canClaim
                      ? "border-[#E8320A]/40"
                      : "border-gray-100"
                  }`}
                  data-testid={`task-item-${task.id}`}
                >
                  <div className={`bg-gradient-to-r ${tier.bg} px-2.5 py-1 flex items-center justify-between`}>
                    <span className="text-white font-bold text-xs">{label}</span>
                    {task.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="p-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                      <img src={icon} alt={label} className="w-6 h-6 object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-[11px] leading-snug mb-0.5">
                        {t.taskInviteDesc.replace("{0}", String(task.requiredInvites))}
                      </p>
                      <p className="text-[#E8192C] font-bold text-xs">
                        {task.reward.toLocaleString()} {currency}
                      </p>

                      <div className="mt-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-gray-400 text-[10px]">
                            {task.currentInvites} / {task.requiredInvites}
                          </span>
                          <span className="text-gray-400 text-[10px]">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressComplete ? "bg-green-500" : "bg-[#E8192C]"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {task.isCompleted ? (
                        <span className="bg-red-50 text-[#E8192C] text-[10px] font-semibold px-2 py-1 rounded-full block text-center">
                          {t.taskDone}
                        </span>
                      ) : task.canClaim ? (
                        <button
                          onClick={() => !claimMutation.isPending && claimMutation.mutate(task.id)}
                          disabled={claimMutation.isPending}
                          className="bg-[#E8192C] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full active:scale-95 transition-transform shadow-sm"
                          data-testid={`button-claim-${task.id}`}
                        >
                          {claimMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            t.taskClaim
                          )}
                        </button>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 text-[10px] font-semibold px-2 py-1 rounded-full block text-center">
                          {t.taskWaiting}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/70">{t.taskNone}</p>
          </div>
        )}
      </div>
    </div>
  );
}
