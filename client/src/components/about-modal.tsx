import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const poweraddLogo = "/poweradd/poweradd-logo-official.png";

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
              <img src={poweraddLogo} alt="Power Add" className="w-10 h-10 object-contain" />
            </div>
            À propos de Power Add
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Power Add Inc. développe des solutions d’alimentation électrique, des convertisseurs et des conceptions sur mesure pour ses clients.
          </p>
          <p>
            Fondée en 1996 comme unité indépendante du groupe Tekman, l’entreprise dispose de capacités de recherche et développement à New Taipei City, à Taïwan.
          </p>
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground">Domaines d’expertise :</h4>
            <ul className="space-y-1">
              <li>- Alimentations AC/DC et DC/DC</li>
              <li>- Adaptateurs et alimentations industrielles</li>
              <li>- Conceptions personnalisées</li>
              <li>- Recherche, fabrication pilote et production de masse</li>
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
