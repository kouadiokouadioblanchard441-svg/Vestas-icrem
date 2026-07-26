const NOWPAYMENTS_API_BASE = "https://api.nowpayments.io/v1";

type NowPaymentsAuthResponse = {
  token?: string;
};

type NowPaymentsWithdrawal = {
  id?: string;
  batchWithdrawalId?: string;
  batch_withdrawal_id?: string;
  status?: string;
  hash?: string | null;
  error?: string | null;
  address?: string;
  currency?: string;
  amount?: string | number;
};

export type NowPaymentsPayoutResponse = {
  id?: string;
  withdrawals?: NowPaymentsWithdrawal[];
};

export type NowPaymentsPayoutStatus = NowPaymentsWithdrawal & {
  batch_withdrawal_id?: string;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function getRequiredConfig() {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const email = process.env.NOWPAYMENTS_ACCOUNT_EMAIL;
  const password = process.env.NOWPAYMENTS_ACCOUNT_PASSWORD;

  if (!apiKey || !email || !password) {
    throw new Error("NOWPayments payouts are not fully configured");
  }

  return { apiKey, email, password };
}

async function parseResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text };
  }

  if (!response.ok) {
    const message =
      typeof body.message === "string"
        ? body.message
        : typeof body.error === "string"
          ? body.error
          : `NOWPayments API returned HTTP ${response.status}`;
    throw new Error(message);
  }

  return body;
}

async function getJwtToken(): Promise<string> {
  const config = getRequiredConfig();
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const response = await fetch(`${NOWPAYMENTS_API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });
  const body = (await parseResponse(response)) as NowPaymentsAuthResponse;

  if (!body.token) {
    throw new Error("NOWPayments authentication did not return a token");
  }

  // NOWPayments documents a five-minute JWT lifetime. Keep a shorter cache
  // window so an expiry never interrupts a payout request.
  cachedToken = { value: body.token, expiresAt: Date.now() + 4 * 60 * 1000 };
  return body.token;
}

function getCallbackUrl() {
  const baseUrl =
    process.env.APP_URL ||
    (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null);
  return baseUrl ? `${baseUrl}/api/nowpayments/ipn` : undefined;
}

async function payoutRequest(
  path: string,
  init: RequestInit = {},
): Promise<Record<string, unknown>> {
  const { apiKey } = getRequiredConfig();
  const token = await getJwtToken();
  const headers = new Headers(init.headers);
  headers.set("X-API-KEY", apiKey);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${NOWPAYMENTS_API_BASE}${path}`, {
    ...init,
    headers,
  });
  return parseResponse(response);
}

export async function createPayout(input: {
  address: string;
  currency: string;
  amount: number;
  uniqueExternalId: string;
  description: string;
}) {
  const callbackUrl = getCallbackUrl();
  return payoutRequest("/payout", {
    method: "POST",
    body: JSON.stringify({
      ...(callbackUrl ? { ipn_callback_url: callbackUrl } : {}),
      withdrawals: [
        {
          address: input.address,
          currency: input.currency,
          amount: Number(input.amount.toFixed(6)),
          ...(callbackUrl ? { ipn_callback_url: callbackUrl } : {}),
          payout_description: input.description,
          unique_external_id: input.uniqueExternalId,
        },
      ],
    }),
  }) as Promise<NowPaymentsPayoutResponse>;
}

export async function verifyPayout(batchWithdrawalId: string, verificationCode: string) {
  return payoutRequest(`/payout/${encodeURIComponent(batchWithdrawalId)}/verify`, {
    method: "POST",
    body: JSON.stringify({ verification_code: verificationCode }),
  });
}

export async function getPayoutStatus(payoutId: string) {
  return payoutRequest(`/payout/${encodeURIComponent(payoutId)}`, {
    method: "GET",
  }) as Promise<NowPaymentsPayoutStatus | NowPaymentsPayoutStatus[]>;
}