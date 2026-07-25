import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Trash2, CreditCard, Check } from "lucide-react";
import type { WithdrawalWallet } from "@shared/schema";

const walletSchema = z.object({
  accountName: z.string().min(2, "请输入账户名称"),
  accountNumber: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "BEP20 地址格式无效"),
});

type WalletForm = z.infer<typeof walletSchema>;
const WITHDRAWAL_METHOD = "USDT BEP20";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WalletModal({ open, onClose }: WalletModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: wallets, isLoading } = useQuery<WithdrawalWallet[]>({
    queryKey: ["/api/wallets"],
    enabled: open,
  });

  const form = useForm<WalletForm>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: WalletForm) => {
      const response = await apiRequest("POST", "/api/wallets", {
        ...data,
        paymentMethod: WITHDRAWAL_METHOD,
        country: user!.country,
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
       toast({ title: "钱包已添加！" });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: error.message || "Une erreur est survenue", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (walletId: number) => {
      const response = await apiRequest("DELETE", `/api/wallets/${walletId}`, {});
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
       toast({ title: "钱包已删除！" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Une erreur est survenue", variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (walletId: number) => {
      const response = await apiRequest("PATCH", `/api/wallets/${walletId}/default`, {});
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
       toast({ title: "默认钱包已更新！" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Une erreur est survenue", variant: "destructive" });
    },
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>钱包管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : wallets && wallets.length > 0 ? (
            wallets.map((wallet) => (
              <Card key={wallet.id} className={wallet.isDefault ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{wallet.accountName}</p>
                        <p className="text-sm text-muted-foreground">{wallet.accountNumber}</p>
                        <p className="text-xs text-muted-foreground">USDT BEP20</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!wallet.isDefault && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDefaultMutation.mutate(wallet.id)}
                          disabled={setDefaultMutation.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(wallet.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {wallet.isDefault && (
                    <div className="mt-2">
                       <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">默认</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : !showForm ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">暂无已登记的钱包</p>
            </div>
          ) : null}

          {showForm ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>账户名称</FormLabel>
                      <FormControl>
                       <Input {...field} placeholder="请输入您的姓名" data-testid="input-wallet-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>BEP20 钱包地址</FormLabel>
                      <FormControl>
                          <Input {...field} type="text" placeholder="0x..." data-testid="input-wallet-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                   唯一方式：<span className="font-semibold text-foreground">USDT BEP20</span>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                     取消
                  </Button>
                  <Button type="submit" className="flex-1" disabled={addMutation.isPending}>
                     {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "添加"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Button className="w-full" onClick={() => setShowForm(true)} data-testid="button-add-wallet">
              <Plus className="w-4 h-4 mr-2" />
               添加钱包
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
