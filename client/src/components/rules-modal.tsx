import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { getContent } from "@/lib/content";

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RulesModal({ open, onClose }: RulesModalProps) {
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

  const title = getContent(settings, "content_rules_title", "Règles de la plateforme");
  const s1Title = getContent(settings, "content_rules_section1Title", "1. Dépôts");
  const s1Body = getContent(settings, "content_rules_section1Body", `- Montant minimum : ${parseInt(minDeposit).toLocaleString()} FCFA\n- Les dépôts sont traités dans les plus brefs délais\n- Assurez-vous que les informations de paiement sont correctes`);
  const s2Title = getContent(settings, "content_rules_section2Title", "2. Retraits");
  const s2Body = getContent(settings, "content_rules_section2Body", `- Montant minimum : ${parseInt(minWithdrawal).toLocaleString()} FCFA\n- Frais de retrait : ${withdrawalFees}%\n- Horaires : ${withdrawalStartHour}h - ${withdrawalEndHour}h\n- Maximum ${maxWithdrawalsPerDay} retrait(s) par jour\n- Un produit actif est requis pour retirer\n- Un portefeuille de retrait doit être enregistré`);
  const s3Title = getContent(settings, "content_rules_section3Title", "3. Produits");
  const s3Body = getContent(settings, "content_rules_section3Body", "- Cycle standard : 80 jours\n- Gains journaliers automatiques\n- Les gains sont crédités 24h après l'achat\n- Produit gratuit : réclamez 50 FCFA/jour");
  const s4Title = getContent(settings, "content_rules_section4Title", "4. Parrainage");
  const s4Body = getContent(settings, "content_rules_section4Body", `- Niveau 1 : ${lv1}% de commission\n- Niveau 2 : ${lv2}% de commission\n- Niveau 3 : ${lv3}% de commission\n- Commissions sur les achats de produits`);
  const s5Title = getContent(settings, "content_rules_section5Title", "5. Bonus d'inscription");
  const s5Body = getContent(settings, "content_rules_section5Body", `Chaque nouveau membre reçoit ${parseInt(signupBonus).toLocaleString()} FCFA de bonus à l'inscription.`);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h4 className="font-medium text-foreground mb-2">{s1Title}</h4>
              <ul className="space-y-1">
                {s1Body.split("\n").map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">{s2Title}</h4>
              <ul className="space-y-1">
                {s2Body.split("\n").map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">{s3Title}</h4>
              <ul className="space-y-1">
                {s3Body.split("\n").map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">{s4Title}</h4>
              <ul className="space-y-1">
                {s4Body.split("\n").map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-2">{s5Title}</h4>
              <p>{s5Body}</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
