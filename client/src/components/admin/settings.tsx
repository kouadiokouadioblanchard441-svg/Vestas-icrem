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
  supportType: z.string().min(1, "Réseau social requis"),
  supportLabel: z.string().min(1, "Label requis"),
  support2Link: z.string().min(5, "Lien requis"),
  support2Type: z.string().min(1, "Réseau social requis"),
  support2Label: z.string().min(1, "Label requis"),
  channelLink: z.string().min(5, "Lien requis"),
  channelType: z.string().min(1, "Réseau social requis"),
  channelLabel: z.string().min(1, "Label requis"),
  groupLink: z.string().min(5, "Lien requis"),
  groupType: z.string().min(1, "Réseau social requis"),
  groupLabel: z.string().min(1, "Label requis"),
  popupButtonLabel: z.string().min(1, "Label requis"),
  supportEnabled: z.boolean(),
  support2Enabled: z.boolean(),
  channelEnabled: z.boolean(),
  groupEnabled: z.boolean(),
  minDeposit: z.string().min(1, "Montant requis"),
  depositPresetAmounts: z.string().min(1, "Montants requis"),
  minWithdrawal: z.string().min(1, "Montant requis"),
  maxWithdrawal: z.string().min(1, "Montant requis"),
  withdrawalEnabled: z.boolean(),
  withdrawalFees: z.string().min(1, "Frais requis"),
  maxWithdrawalsPerDay: z.string().min(1, "Requis"),
  withdrawalInstructions: z.string().optional(),
  withdrawalDays: z.string().min(1, "Jours requis"),
  withdrawalStartHour: z.string().min(1, "Heure requise"),
  withdrawalEndHour: z.string().min(1, "Heure requise"),
  level1Commission: z.string().min(1, "Commission requise"),
  level2Commission: z.string().min(1, "Commission requise"),
  level3Commission: z.string().min(1, "Commission requise"),
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
      minWithdrawal: "1000",
      maxWithdrawal: "1000000",
      withdrawalEnabled: true,
      withdrawalFees: "10",
      maxWithdrawalsPerDay: "1",
      withdrawalInstructions: "",
      withdrawalDays: "1,2,3,4,5",
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
        minWithdrawal: settings.minWithdrawal || "1000",
        maxWithdrawal: settings.maxWithdrawal || "1000000",
        withdrawalEnabled: settings.withdrawalEnabled !== "false",
        withdrawalFees: settings.withdrawalFees || "10",
        maxWithdrawalsPerDay: settings.maxWithdrawalsPerDay || "1",
        withdrawalInstructions: settings.withdrawalInstructions || "",
        withdrawalDays: settings.withdrawalDays || "1,2,3,4,5",
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
                Mode maintenance
              </span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                isMaintenance ? "bg-red-500/30 text-red-300" : "bg-green-500/30 text-green-300"
              }`}>
                {isMaintenance ? "En maintenance" : "En ligne"}
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
              Liens & Réseaux sociaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Support 1 */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lien 1 — Support</p>
                <FormField control={form.control} name="supportEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Inactif"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="supportLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom affiché</FormLabel>
                    <FormControl><Input {...field} placeholder="Support" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="supportType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réseau social</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
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
                  <FormLabel>URL du lien</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Support 2 */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lien 2 — Support 2</p>
                <FormField control={form.control} name="support2Enabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Inactif"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="support2Label" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom affiché</FormLabel>
                    <FormControl><Input {...field} placeholder="Support 2" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="support2Type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réseau social</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
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
                  <FormLabel>URL du lien</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Channel */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lien 3 — Canal officiel</p>
                <FormField control={form.control} name="channelEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Inactif"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="channelLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom affiché</FormLabel>
                    <FormControl><Input {...field} placeholder="Canal officiel" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="channelType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réseau social</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
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
                  <FormLabel>URL du lien</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Group */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lien 4 — Groupe de discussion</p>
                <FormField control={form.control} name="groupEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Inactif"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="groupLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom affiché</FormLabel>
                    <FormControl><Input {...field} placeholder="Groupe" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="groupType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réseau social</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
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
                  <FormLabel>URL du lien</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Popup dashboard button */}
            <div className="border border-red-500 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-600">Bouton popup page d'accueil</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Ce bouton apparaît dans la fenêtre popup automatique de la page d'accueil.
              </p>
              <FormField control={form.control} name="popupButtonLabel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Texte du bouton <span className="text-red-500">(popup accueil)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="Ex : Rejoindre le groupe Telegram" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="groupLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien du bouton <span className="text-red-500">(popup accueil)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormDescription>Ce lien est aussi utilisé dans le popup de bienvenue.</FormDescription>
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
              Retraits & Commissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">Mode de retrait actuel</p>
              <p className="mt-1 text-lg font-bold text-primary">USDT BEP20</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Méthode unique disponible. L'utilisateur doit fournir un numéro Mobile Money.
              </p>
              <FormField control={form.control} name="withdrawalEnabled" render={({ field }) => (
                <FormItem className="mt-3 flex items-center justify-between rounded-md border bg-background/60 p-3 space-y-0">
                  <div>
                    <FormLabel>Autoriser les retraits</FormLabel>
                    <FormDescription>
                      {field.value ? "Les utilisateurs peuvent soumettre des demandes de retrait." : "Les nouvelles demandes de retrait sont désactivées."}
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
                  <FormLabel>Recharge minimum (FCFA)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="depositPresetAmounts" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Montants rapides de recharge (FCFA)</FormLabel>
                  <FormControl><Input {...field} placeholder="3500,5000,7000,10000,15000,20000,50000,70000" /></FormControl>
                  <FormDescription>Liste de montants séparés par des virgules, affichés comme boutons rapides sur la page de recharge.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="minWithdrawal" render={({ field }) => (
                <FormItem>
                  <FormLabel>Retrait minimum (FCFA)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maxWithdrawal" render={({ field }) => (
                <FormItem>
                  <FormLabel>Retrait maximum (FCFA)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="withdrawalFees" render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais de retrait (%)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" max="100" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maxWithdrawalsPerDay" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nb. max de retraits par jour</FormLabel>
                  <FormControl><Input {...field} type="number" min="1" max="10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="withdrawalInstructions" render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions de retrait (affichées sur la page de retrait)</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={6}
                    placeholder={"1. Le montant minimum de retrait est de 1000 FCFA\n2. Les deux derniers chiffres du montant doivent être 0\n3. Des frais de 10% seront déduits\n4. Maximum 1 retrait par jour"}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                  />
                </FormControl>
                <FormDescription>
                  Laissez vide pour utiliser les instructions générées automatiquement. Chaque ligne sera affichée séparément.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            {/* Jours autorisés */}
            <FormField control={form.control} name="withdrawalDays" render={({ field }) => {
              const DAYS = [
                { value: "1", label: "Lun" },
                { value: "2", label: "Mar" },
                { value: "3", label: "Mer" },
                { value: "4", label: "Jeu" },
                { value: "5", label: "Ven" },
                { value: "6", label: "Sam" },
                { value: "0", label: "Dim" },
              ];
              const selected = new Set((field.value || "").split(",").map(s => s.trim()).filter(Boolean));
              const toggle = (v: string) => {
                const next = new Set(selected);
                next.has(v) ? next.delete(v) : next.add(v);
                field.onChange([...next].join(","));
              };
              return (
                <FormItem>
                  <FormLabel>Jours autorisés pour les retraits</FormLabel>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {DAYS.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggle(d.value)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                        style={{
                          background: selected.has(d.value) ? "hsl(var(--primary))" : "transparent",
                          color: selected.has(d.value) ? "white" : "hsl(var(--foreground))",
                          borderColor: selected.has(d.value) ? "hsl(var(--primary))" : "hsl(var(--border))",
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <FormDescription>Cliquez pour activer / désactiver un jour.</FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="withdrawalStartHour" render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de début (0–23)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" max="23" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="withdrawalEndHour" render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de fin (0–23)</FormLabel>
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
              Commissions de parrainage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="level1Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau 1 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="level2Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau 2 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="level3Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau 3 (%)</FormLabel>
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
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
