import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const vestasLogo = "/spolarpv-logo.png";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src={vestasLogo} alt="SpolarPV" className="w-10 h-10 object-contain" />
            </div>
            À propos de SpolarPV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            SpolarPV est un leader mondial dans le secteur de l'énergie solaire photovoltaïque. L'entreprise conçoit, fabrique et déploie des solutions solaires innovantes à travers le monde entier.
          </p>
          <p>
            SpolarPV fournit des solutions d'énergie renouvelable de pointe qui alimentent des millions de foyers à travers plus de 80 pays dans le monde.
          </p>
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground">Nos avantages :</h4>
            <ul className="space-y-1">
              <li>- Revenus quotidiens automatiques</li>
              <li>- Produits énergétiques de qualité</li>
              <li>- Système de parrainage attractif</li>
              <li>- Support client disponible</li>
            </ul>
          </div>
          <p className="text-xs">
            Version 1.0.0 - Tous droits réservés
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
