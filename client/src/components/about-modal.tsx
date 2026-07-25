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
             关于 Power Add
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
             Power Add Inc. 为客户提供电源解决方案、转换器和定制设计。
          </p>
          <p>
             公司成立于1996年，是 Tekman 集团旗下的独立部门，并在台湾新北市设有研发能力。
          </p>
          <div className="bg-secondary rounded-lg p-4 space-y-2">
             <h4 className="font-medium text-foreground">专业领域：</h4>
            <ul className="space-y-1">
               <li>- AC/DC 和 DC/DC 电源</li>
               <li>- 适配器和工业电源</li>
               <li>- 定制设计</li>
               <li>- 研发、试生产和大规模生产</li>
            </ul>
          </div>
          <p className="text-xs">
             版本 1.0.0 - 版权所有
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
