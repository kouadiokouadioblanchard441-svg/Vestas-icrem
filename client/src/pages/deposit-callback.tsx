import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { CheckCircle, Loader2, XCircle, Headphones } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function DepositCallbackPage() {
  const { refreshUser } = useAuth();

  // depositId comes from the URL path (/deposit-callback/:id)
  const { id: depositId } = useParams<{ id: string }>();

  // WestPay appends ?status=success|failed&amount=X&ref=OP-xxx to our redirect URL
  const search = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);
  const westpayStatus = params.get("status");   // "success" | "failed" | null
  const ref = params.get("ref");                // "OP-abc123" | null

  const [depositStatus, setDepositStatus] = useState<
    "polling" | "approved" | "rejected" | "timeout"
  >("polling");

  useEffect(() => {
    if (!depositId) return;

    // WestPay explicitly told us the payment failed → stop immediately
    if (westpayStatus === "failed" || westpayStatus === "failure") {
      setDepositStatus("rejected");
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 60; // 60 × 5 s = 5 min
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const res = await fetch(`/api/deposits/${depositId}/verify`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "approved") {
            setDepositStatus("approved");
            refreshUser();
            return;
          }
          if (data.status === "rejected") {
            setDepositStatus("rejected");
            return;
          }
        }
      } catch {
        // network error — keep polling
      }

      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        setDepositStatus("timeout");
        return;
      }
      timer = setTimeout(poll, 5000);
    };

    // Give WestPay webhook ~2 s to reach our server before first poll
    timer = setTimeout(poll, 2000);
    return () => clearTimeout(timer);
  }, [depositId, westpayStatus]);

  /* ── Success ── */
  if (depositStatus === "approved") {
    return (
      <Screen>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold text-gray-800">Dépôt confirmé !</h1>
        <p className="text-gray-500 text-sm">
          Votre solde a été crédité avec succès.
        </p>
        {ref && (
          <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-1.5">
            Réf : {ref}
          </p>
        )}
        <Link href="/deposit-history">
          <button
            className="w-full py-3.5 rounded-full text-white font-bold shadow-md"
            style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
          >
            Voir mes dépôts
          </button>
        </Link>
        <Link href="/">
          <button className="w-full py-3 rounded-full text-gray-600 border border-gray-200 text-sm font-medium">
            Retour à l'accueil
          </button>
        </Link>
      </Screen>
    );
  }

  /* ── Failure ── */
  if (depositStatus === "rejected") {
    return (
      <Screen>
        <XCircle className="w-16 h-16 text-red-400 mx-auto" />
        <h1 className="text-xl font-bold text-gray-800">Paiement échoué</h1>
        <p className="text-gray-500 text-sm">
          Votre paiement n'a pas pu être traité. Aucun montant n'a été débité
          de votre compte.
        </p>
        <Link href="/deposit">
          <button
            className="w-full py-3.5 rounded-full text-white font-bold shadow-md"
            style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
          >
            Réessayer
          </button>
        </Link>
        <Link href="/">
          <button className="w-full py-3 rounded-full text-gray-600 border border-gray-200 text-sm font-medium">
            Retour à l'accueil
          </button>
        </Link>
      </Screen>
    );
  }

  /* ── Timeout ── */
  if (depositStatus === "timeout") {
    return (
      <Screen>
        <Headphones className="w-16 h-16 text-amber-400 mx-auto" />
        <h1 className="text-xl font-bold text-gray-800">En attente de confirmation</h1>
        <p className="text-gray-500 text-sm">
          Votre paiement est en cours de traitement. Si votre solde n'est pas
          crédité dans 10 minutes, contactez le support avec votre référence.
        </p>
        {ref && (
          <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-1.5">
            Réf : {ref}
          </p>
        )}
        <Link href="/service">
          <button
            className="w-full py-3.5 rounded-full text-white font-bold shadow-md"
            style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
          >
            Contacter le support
          </button>
        </Link>
        <Link href="/">
          <button className="w-full py-3 rounded-full text-gray-600 border border-gray-200 text-sm font-medium">
            Retour à l'accueil
          </button>
        </Link>
      </Screen>
    );
  }

  /* ── Polling / Loading ── */
  return (
    <Screen>
      <Loader2 className="w-16 h-16 text-[#F59E0B] animate-spin mx-auto" />
      <h1 className="text-xl font-bold text-gray-800">Vérification en cours…</h1>
      <p className="text-gray-500 text-sm">
        Nous confirmons votre paiement auprès de WestPay. Merci de patienter
        quelques secondes.
      </p>
      <div className="flex gap-2 justify-center pt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#87CEEB" }}
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
        {children}
      </div>
    </div>
  );
}
