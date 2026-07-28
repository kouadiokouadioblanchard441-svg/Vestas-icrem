import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Save, Link, Clock, Users, PowerOff, Power, HandCoins, Zap } from "lucide-react";

const NETWORKS = [
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

const settingsSchema = z.object({
  supportLink: z.string().min(5, "Lien requis"),
  supportType: z.string().min(1, "社交网络必填"),
  supportLabel: z.string().min(1, "Label requis"),
  support2Link: z.string().min(5, "Lien requis"),
  support2Type: z.string().min(1, "社交网络必填"),
  support2Label: z.string().min(1, "Label requis"),
  channelLink: z.string().min(5, "Lien requis"),
  channelType: z.string().min(1, "社交网络必填"),
  channelLabel: z.string().min(1, "Label requis"),
  groupLink: z.string().min(5, "Lien requis"),
  groupType: z.string().min(1, "社交网络必填"),
  groupLabel: z.string().min(1, "Label requis"),
  popupButtonLabel: z.string().min(1, "Label requis"),
  supportEnabled: z.boolean(),
  support2Enabled: z.boolean(),
  channelEnabled: z.boolean(),
  groupEnabled: z.boolean(),
  minDeposit: z.string().min(1, "Montant requis"),
  depositPresetAmounts: z.string().min(1, "Montants requis"),
  minWithdrawal: z.string().min(1, "Montant requis"),
  withdrawalEnabled: z.boolean(),
  withdrawalFees: z.string().min(1, "手续费必填"),
  maxWithdrawalsPerDay: z.string().min(1, "Requis"),
  withdrawalStartHour: z.string().min(1, "时间必填"),
  withdrawalEndHour: z.string().min(1, "时间必填"),
  level1Commission: z.string().min(1, "佣金必填"),
  level2Commission: z.string().min(1, "佣金必填"),
  level3Commission: z.string().min(1, "佣金必填"),
});

type SettingsForm = z.infer<typeof settingsSchema>;

// ── Composant toggle mode retrait ──────────────────────────────────────────
function WithdrawalModeToggle() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });
  const [toggling, setToggling] = useState(false);

  const currentMode = settings?.withdrawalMode || "manual";

  const toggle = async () => {
    const newMode = currentMode === "manual" ? "auto" : "manual";
    setToggling(true);
    try {
      const response = await apiRequest("POST", "/api/admin/settings", { withdrawalMode: newMode });
      if (!response.ok) throw new Error("Erreur serveur");
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: newMode === "manual"
          ? "✋ Mode Manuel activé"
          : "⚡ Mode Automatique (NOWPayments) activé",
        description: newMode === "manual"
          ? "Vous devrez valider chaque retrait manuellement."
          : "NOWPayments traitera automatiquement les retraits.",
      });
    } catch (e: any) {
      toast({ title: e.message || "Erreur", variant: "destructive" });
    } finally {
      setToggling(false);
    }
  };

  if (isLoading) return null;

  const isManual = currentMode === "manual";

  return (
    <div className={`rounded-lg border-2 p-4 space-y-3 ${isManual ? "border-orange-400/60 bg-orange-50/40 dark:bg-orange-950/20" : "border-blue-400/60 bg-blue-50/40 dark:bg-blue-950/20"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isManual
            ? <HandCoins className="w-5 h-5 text-orange-500" />
            : <Zap className="w-5 h-5 text-blue-500" />}
          <p className="text-sm font-semibold">Mode de traitement des retraits</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isManual ? "bg-orange-500/20 text-orange-700 dark:text-orange-300" : "bg-blue-500/20 text-blue-700 dark:text-blue-300"}`}>
          {isManual ? "MANUEL" : "AUTO (NOWPayments)"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {isManual
          ? "✋ Les retraits restent en attente jusqu'à votre validation manuelle dans le panel."
          : "⚡ NOWPayments est appelé immédiatement. Vous entrez un code 2FA pour débloquer le paiement crypto."}
      </p>
      <Button
        type="button"
        variant="outline"
        className={`w-full ${isManual ? "border-blue-400 text-blue-600 hover:bg-blue-50" : "border-orange-400 text-orange-600 hover:bg-orange-50"}`}
        disabled={toggling}
        onClick={toggle}
      >
        {toggling
          ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
          : isManual
            ? <><Zap className="w-4 h-4 mr-2" />Passer en mode Automatique (NOWPayments)</>
            : <><HandCoins className="w-4 h-4 mr-2" />Passer en mode Manuel</>}
      </Button>
    </div>
  );
}

interface AdminSettingsProps {
  isSuperAdmin: boolean;
}

export default function AdminSettings({ isSuperAdmin }: AdminSettingsProps) {
  const { toast } = useToast();

  // ── Mode Maintenance ──────────────────────────────────────────────────────
  const [maintenanceToggling, setMaintenanceToggling] = useState(false);

  const toggleMaintenance = async (enable: boolean) => {
    setMaintenanceToggling(true);
    try {
      const response = await apiRequest("POST", "/api/admin/settings", {
        maintenanceMode: String(enable),
      });
      if (!response.ok) throw new Error("Erreur serveur");
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: enable ? "🔴 Site mis hors service" : "🟢 Site remis en ligne",
        description: enable
          ? "Le site est maintenant invisible pour les visiteurs."
          : "Le site est de nouveau accessible.",
      });
    } catch (e: any) {
      toast({ title: e.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setMaintenanceToggling(false);
    }
  };

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      supportLink: "https://t.me/vestasgroup",
      supportType: "telegram",
      supportLabel: "Service client",
      support2Link: "https://t.me/vestasgroup",
      support2Type: "telegram",
      support2Label: "Service client 2",
      channelLink: "https://t.me/vestasgroup",
      channelType: "telegram",
      channelLabel: "Chaîne officielle",
      groupLink: "https://t.me/vestasgroup",
      groupType: "telegram",
      groupLabel: "Groupe de discussion",
      popupButtonLabel: "Cliquez ici pour rejoindre le groupe Telegram",
      supportEnabled: true,
      support2Enabled: true,
      channelEnabled: true,
      groupEnabled: true,
      minDeposit: "4000",
      depositPresetAmounts: "3500,5000,7000,10000,15000,20000,50000,70000",
      minWithdrawal: "1500",
      withdrawalEnabled: true,
      withdrawalFees: "18",
      maxWithdrawalsPerDay: "1",
      withdrawalStartHour: "9",
      withdrawalEndHour: "17",
      level1Commission: "25",
      level2Commission: "1",
      level3Commission: "1",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        supportLink: settings.supportLink || "https://t.me/vestasgroup",
        supportType: settings.supportType || "telegram",
        supportLabel: settings.supportLabel || "Service client",
        support2Link: settings.support2Link || "https://t.me/vestasgroup",
        support2Type: settings.support2Type || "telegram",
        support2Label: settings.support2Label || "Service client 2",
        channelLink: settings.channelLink || "https://t.me/vestasgroup",
        channelType: settings.channelType || "telegram",
        channelLabel: settings.channelLabel || "Chaîne officielle",
        groupLink: settings.groupLink || "https://t.me/vestasgroup",
        groupType: settings.groupType || "telegram",
        groupLabel: settings.groupLabel || "Groupe de discussion",
        popupButtonLabel: settings.popupButtonLabel || "Cliquez ici pour rejoindre le groupe Telegram",
        supportEnabled: settings.supportEnabled !== "false",
        support2Enabled: settings.support2Enabled !== "false",
        channelEnabled: settings.channelEnabled !== "false",
        groupEnabled: settings.groupEnabled !== "false",
        minDeposit: settings.minDeposit || "4000",
        depositPresetAmounts: settings.depositPresetAmounts || "3500,5000,7000,10000,15000,20000,50000,70000",
        minWithdrawal: settings.minWithdrawal || "1500",
        withdrawalEnabled: settings.withdrawalEnabled !== "false",
        withdrawalFees: settings.withdrawalFees || "18",
        maxWithdrawalsPerDay: settings.maxWithdrawalsPerDay || "1",
        withdrawalStartHour: settings.withdrawalStartHour || "9",
        withdrawalEndHour: settings.withdrawalEndHour || "17",
        level1Commission: settings.level1Commission || "25",
        level2Commission: settings.level2Commission || "1",
        level3Commission: settings.level3Commission || "1",
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      const serialized = {
        ...data,
        supportEnabled: String(data.supportEnabled),
        support2Enabled: String(data.support2Enabled),
        channelEnabled: String(data.channelEnabled),
        groupEnabled: String(data.groupEnabled),
        withdrawalEnabled: String(data.withdrawalEnabled),
      };
      const response = await apiRequest("POST", "/api/admin/settings", serialized);
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/links"] });
      toast({ title: "Paramètres enregistrés !" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Une erreur est survenue", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const isMaintenance = settings?.maintenanceMode === "true";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">

        {/* ── Mode Maintenance ── */}
        <Card className={isMaintenance ? "border-red-500 bg-red-950/40" : "border-green-700/50 bg-green-950/20"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isMaintenance
                ? <PowerOff className="w-5 h-5 text-red-400" />
                : <Power className="w-5 h-5 text-green-400" />}
              <span className={isMaintenance ? "text-red-300" : "text-green-300"}>
                维护模式
              </span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                isMaintenance ? "bg-red-500/30 text-red-300" : "bg-green-500/30 text-green-300"
              }`}>
                {isMaintenance ? "维护中" : "运行中"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-400">
              {isMaintenance
                ? "⚠️ Le site est actuellement hors service. Les visiteurs voient une page blanche vide. Seul le panel admin reste accessible."
                : "Le site est accessible normalement. Cliquez sur le bouton pour le mettre hors service instantanément."}
            </p>
            <div className="flex gap-2">
              {isMaintenance ? (
                <Button
                  type="button"
                  className="w-full bg-green-700 hover:bg-green-600 text-white"
                  disabled={maintenanceToggling}
                  onClick={() => toggleMaintenance(false)}
                >
                  {maintenanceToggling
                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    : <Power className="w-4 h-4 mr-2" />}
                  Remettre le site en ligne
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  disabled={maintenanceToggling}
                  onClick={() => toggleMaintenance(true)}
                >
                  {maintenanceToggling
                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    : <PowerOff className="w-4 h-4 mr-2" />}
                  Mettre le site hors service
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Liens & Réseaux sociaux ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              链接与社交网络
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Support 1 */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">链接 1 — 客服</p>
                <FormField control={form.control} name="supportEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "启用" : "禁用"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="supportLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>显示名称</FormLabel>
                    <FormControl><Input {...field} placeholder="客服" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="supportType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>社交网络</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="选择..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="supportLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>链接 URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Support 2 */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">链接 2 — 客服 2</p>
                <FormField control={form.control} name="support2Enabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "启用" : "禁用"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="support2Label" render={({ field }) => (
                  <FormItem>
                    <FormLabel>显示名称</FormLabel>
                    <FormControl><Input {...field} placeholder="客服 2" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="support2Type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>社交网络</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="选择..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="support2Link" render={({ field }) => (
                <FormItem>
                  <FormLabel>链接 URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Channel */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">链接 3 — 官方频道</p>
                <FormField control={form.control} name="channelEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "启用" : "禁用"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="channelLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>显示名称</FormLabel>
                    <FormControl><Input {...field} placeholder="官方频道" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="channelType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>社交网络</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="选择..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="channelLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>链接 URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Group */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">链接 4 — 讨论群</p>
                <FormField control={form.control} name="groupEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "启用" : "禁用"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="groupLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>显示名称</FormLabel>
                    <FormControl><Input {...field} placeholder="讨论群" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="groupType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>社交网络</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="选择..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="groupLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>链接 URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Popup dashboard button */}
            <div className="border border-red-500 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-600">首页弹窗按钮</p>
              </div>
              <p className="text-xs text-muted-foreground">
                此按钮显示在首页自动弹出的提示窗口中。
              </p>
              <FormField control={form.control} name="popupButtonLabel" render={({ field }) => (
                <FormItem>
                  <FormLabel>按钮文字 <span className="text-red-500">(首页弹窗)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="例：点击此处加入Telegram群组" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="groupLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>按钮链接 <span className="text-red-500">(首页弹窗)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormDescription>此链接也用于首页欢迎弹窗。</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

          </CardContent>
        </Card>

        {/* ── Retraits & Bonus ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              提现与奖励
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">当前提现方式</p>
              <p className="mt-1 text-lg font-bold text-primary">USDT BEP20</p>
              <p className="mt-1 text-xs text-muted-foreground">
                唯一可用方式。用户须提供以 0x 开头的 BEP20 地址。
              </p>
              <FormField control={form.control} name="withdrawalEnabled" render={({ field }) => (
                <FormItem className="mt-3 flex items-center justify-between rounded-md border bg-background/60 p-3 space-y-0">
                  <div>
                    <FormLabel>允许提现</FormLabel>
                    <FormDescription>
                      {field.value ? "用户可以提交提现申请。" : "新的提现申请已被禁止。"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            {/* Mode de traitement des retraits */}
            <WithdrawalModeToggle />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="minDeposit" render={({ field }) => (
                <FormItem>
                  <FormLabel>最低充值 (USDT)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="depositPresetAmounts" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>快捷充值金额 (USDT)</FormLabel>
                  <FormControl><Input {...field} placeholder="3500,5000,7000,10000,15000,20000,50000,70000" /></FormControl>
                  <FormDescription>用逗号分隔的金额列表，显示为充值页面的快捷按钮。</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="minWithdrawal" render={({ field }) => (
                <FormItem>
                  <FormLabel>最低提现 (USDT)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="withdrawalFees" render={({ field }) => (
                <FormItem>
                  <FormLabel>提现手续费 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" max="100" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maxWithdrawalsPerDay" render={({ field }) => (
                <FormItem>
                  <FormLabel>每日最多提现次数</FormLabel>
                  <FormControl><Input {...field} type="number" min="1" max="10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="withdrawalStartHour" render={({ field }) => (
                <FormItem>
                  <FormLabel>提现开始时间（时）</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" max="23" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="withdrawalEndHour" render={({ field }) => (
                <FormItem>
                  <FormLabel>提现结束时间（时）</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" max="23" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* ── Commissions ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              推荐佣金
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="level1Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>等级 1 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="level2Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>等级 2 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="level3Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>等级 3 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存设置
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
