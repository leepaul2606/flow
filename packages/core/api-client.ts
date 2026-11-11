import type { CardDesignId } from "./card-designs";
import type {
  CardSecrets,
  LoadCardRequest,
  PaymentCard,
  Portfolio,
  ReceiveDetails,
  SendRequest,
  StableSymbol,
  Transaction,
  TrustedDevice,
  User,
} from "./types";

/**
 * Typed client for Flow's own /api routes.
 *
 * The browser only ever talks to this origin — provider credentials stay on
 * the server. Every call throws ApiError on failure so callers can surface a
 * message rather than checking shapes.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Where the API lives.
 *
 * The web app leaves this empty and uses same-origin relative paths. The
 * native app has no origin of its own, so it calls `configureApi` at startup
 * with the deployed backend's URL.
 */
let baseUrl = "";

export function configureApi(options: { baseUrl: string }): void {
  // Trailing slashes would produce //api and break routing on some hosts
  baseUrl = options.baseUrl.replace(/\/+$/, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}/api${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new ApiError(
      body.error ?? "Request failed",
      response.status,
      body.code,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const post = <T,>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const api = {
  getUser: () => request<User>("/me"),

  updatePersonalInfo: (patch: Partial<User["personalInfo"]>) =>
    request<User>("/me", { method: "PATCH", body: JSON.stringify(patch) }),

  getPortfolio: () => request<Portfolio>("/portfolio"),

  getReceiveDetails: (asset: StableSymbol) =>
    request<ReceiveDetails[]>(`/receive?asset=${asset}`),

  send: (payload: SendRequest) => post<Transaction>("/send", payload),

  getCards: () => request<PaymentCard[]>("/cards"),

  createVirtualCard: (label: string, design?: CardDesignId) =>
    post<PaymentCard>("/cards", { label, design }),

  setCardDesign: (cardId: string, design: CardDesignId) =>
    post<PaymentCard>(`/cards/${cardId}/design`, { design }),

  loadCard: (payload: LoadCardRequest) =>
    post<Transaction>("/cards/load", payload),

  setCardFrozen: (cardId: string, frozen: boolean) =>
    post<PaymentCard>(`/cards/${cardId}/freeze`, { frozen }),

  getCardSecrets: (cardId: string) =>
    request<CardSecrets>(`/cards/${cardId}/secrets`, { cache: "no-store" }),

  getTransactions: (opts: { limit?: number; cursor?: string } = {}) => {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.cursor) params.set("cursor", opts.cursor);
    const query = params.toString();
    return request<Transaction[]>(`/transactions${query ? `?${query}` : ""}`);
  },

  getTransaction: (id: string) => request<Transaction>(`/transactions/${id}`),

  getTrustedDevices: () => request<TrustedDevice[]>("/devices"),

  revokeDevice: (id: string) =>
    request<void>(`/devices/${id}`, { method: "DELETE" }),

  setTwoFactorEnabled: (enabled: boolean) =>
    post<User["security"]>("/security/two-factor", { enabled }),
};
