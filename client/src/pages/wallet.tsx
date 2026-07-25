import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Trash2, CreditCard, ChevronLeft, ChevronRight, Shield, Check } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import type { WithdrawalWallet } from "@shared/schema";
import landscapeImg from "@assets/71vdMjQS9sL._AC_UF1000,1000_QL80__1784966822182.jpg";

function maskAccountNumber(num: string): string {
  if (num.length <= 6) return num;
  return num.slice(0, 2) + "****" + num.slice(6);
}

const walletSchema = z.object({
  accountName: z.string().min(2, "Nom du titulaire requis"),
  accountNumber: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Adresse BEP20 invalide (format 0x + 40 caractères)"),
});

type WalletForm = z.infer<typeof walletSchema>;
const WITHDRAWAL_METHOD = "USDT BEP20";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const selectMode = params.get("from") === "withdrawal";
  const [showForm, setShowForm] = useState(false);

  const { data: wallets, isLoading } = useQuery<WithdrawalWallet[]>({
    queryKey: ["/api/wallets"],
  });

  const form = useForm<WalletForm>({
    resolver: zodResolver(walletSchema),
    defaultValues: { accountName: "", accountNumber: "" },
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
      toast({ title: "Portefeuille ajouté !" });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
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
      toast({ title: "Portefeuille supprimé !" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
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
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleSelectWallet = (wallet: WithdrawalWallet) => {
    if (selectMode) {
      localStorage.setItem("selectedWalletId", wallet.id.toString());
      navigate("/withdrawal");
    }
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => addMutation.mutate(data))();
  };

  if (!user) return null;

  const backLink = selectMode ? "/withdrawal" : "/account";

  /* ─── ADD FORM VIEW ─── */
  if (showForm) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "#315aab" }}>

        {/* Header — même style que la liste */}
        <div className="flex items-center px-4 pt-10 pb-4">
          <button
            onClick={() => { setShowForm(false); form.reset(); }}
            className="p-1"
            data-testid="button-back-form"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="flex-1 text-center text-white font-bold text-base mr-6">
            Ajouter un moyen de retrait
          </h1>
        </div>

        {/* Champs de saisie */}
        <div className="px-4 space-y-3">

          {/* Moyen unique */}
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1.5 ml-1">
              Moyen de retrait
            </p>
            <div className="w-full px-4 py-4 rounded-2xl shadow-sm bg-white/90 text-sm font-semibold text-gray-800">
              {WITHDRAWAL_METHOD}
            </div>
          </div>

          {/* Nom du titulaire */}
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1.5 ml-1">
              Nom du titulaire
            </p>
            <div
              className="w-full flex items-center px-4 py-4 rounded-2xl shadow-sm"
              style={{ background: "rgba(255,255,255,0.90)" }}
            >
              <input
                {...form.register("accountName")}
                placeholder="Entrez le nom du titulaire"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                data-testid="input-wallet-name"
              />
            </div>
            {form.formState.errors.accountName && (
              <p className="text-red-600 text-xs mt-1 ml-1">{form.formState.errors.accountName.message}</p>
            )}
          </div>

          {/* Adresse blockchain */}
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1.5 ml-1">
              Adresse du portefeuille BEP20
            </p>
            <div
              className="w-full flex items-center px-4 py-4 rounded-2xl shadow-sm"
              style={{ background: "rgba(255,255,255,0.90)" }}
            >
              <input
                {...form.register("accountNumber")}
                type="text"
                inputMode="text"
                placeholder="0x..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                data-testid="input-wallet-number"
              />
            </div>
            {form.formState.errors.accountNumber && (
              <p className="text-red-600 text-xs mt-1 ml-1">{form.formState.errors.accountNumber.message}</p>
            )}
          </div>

          {/* Bouton confirmer */}
          <button
            onClick={handleSubmit}
            disabled={addMutation.isPending}
            className="w-full py-4 rounded-full text-white font-bold text-base shadow-md mt-2 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #E8192C, #E8192C)" }}
            data-testid="button-confirm-wallet"
          >
            {addMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </span>
            ) : "Confirmer"}
          </button>
        </div>

        {/* Paysage en bas — même que la liste */}
        <div className="mt-auto">
          <img
            src={landscapeImg}
            alt="Powerade"
            className="w-full object-cover object-top"
            style={{ maxHeight: 300 }}
          />
        </div>

      </div>
    );
  }

  /* ─── LIST VIEW ─── */
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#315aab" }}>

      {/* Header */}
      <div className="flex items-center px-4 pt-10 pb-4">
        <Link href={backLink}>
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-white font-bold text-base mr-6">
          Moyen de retrait
        </h1>
      </div>

      {/* Content */}
      <div className="px-4 pt-2 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        ) : wallets && wallets.length > 0 ? (
          /* ── Cards view ── */
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                onClick={() => selectMode && handleSelectWallet(wallet)}
                className={selectMode ? "cursor-pointer active:opacity-90" : ""}
                data-testid={`wallet-card-${wallet.id}`}
              >
                {/* Bank card */}
                <div
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #0D47A1 0%, #1976D2 55%, #42A5F5 100%)",
                    minHeight: 170,
                    boxShadow: "0 10px 40px rgba(13,71,161,0.45)",
                  }}
                >
                  {/* Shine diagonal */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(255,255,255,0.06) 100%)",
                    }}
                  />

                  {/* Delete / set-default actions */}
                  {!selectMode && (
                    <div className="absolute top-3 right-3 flex gap-1">
                      {!wallet.isDefault && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDefaultMutation.mutate(wallet.id); }}
                          disabled={setDefaultMutation.isPending}
                          className="p-1.5 rounded-full bg-white/20"
                          data-testid={`button-set-default-${wallet.id}`}
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(wallet.id); }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-full bg-white/20"
                        data-testid={`button-delete-wallet-${wallet.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  )}

                  {/* Account number */}
                  <p className="text-white font-mono text-sm leading-relaxed tracking-wider mt-6 mb-4 break-all">
                    {maskAccountNumber(wallet.accountNumber)}
                  </p>

                  {/* Bottom row: name + chip */}
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <p className="text-white/60 text-xs mb-0.5">USDT BEP20</p>
                      <p className="text-white font-semibold text-sm">{wallet.accountName}</p>
                      {wallet.isDefault && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3 text-white/70" />
                          <span className="text-white/70 text-xs">Par défaut</span>
                        </div>
                      )}
                    </div>

                    {/* Chip */}
                    <div
                      className="rounded-md flex flex-col justify-between overflow-hidden"
                      style={{
                        width: 44,
                        height: 34,
                        background: "linear-gradient(135deg, #bdbdbd, #f5f5f5, #9e9e9e)",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.25)",
                      }}
                    >
                      {/* Chip lines */}
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-full"
                          style={{ height: 1, background: "rgba(0,0,0,0.15)", margin: `${i === 1 ? "auto" : ""} 0` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add more */}
            {!selectMode && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3.5 rounded-full text-white font-bold text-sm shadow-md mt-2"
                style={{ background: "linear-gradient(135deg, #E8192C, #E8192C)" }}
                data-testid="button-add-wallet"
              >
                + Ajouter une carte
              </button>
            )}
          </div>
        ) : (
          /* ── Empty state ── */
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 rounded-full text-white font-bold text-base shadow-md"
            style={{ background: "linear-gradient(135deg, #E8192C, #E8192C)" }}
            data-testid="button-add-wallet"
          >
            Ajouter un moyen de retrait
          </button>
        )}
      </div>

      {/* Landscape illustration — pushed to bottom */}
      <div className="mt-auto">
        <img
          src={landscapeImg}
          alt="Powerade"
          className="w-full object-cover object-top"
          style={{ maxHeight: 300 }}
        />
      </div>
    </div>
  );
}
