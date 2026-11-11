import type { CardDesignId } from "./card-designs";

/**
 * Domain models for Flow V1.
 *
 * Money is represented in minor units (cents / token base units) as integers.
 * Never use floats for balances — 0.1 + 0.2 !== 0.3 and card balances must
 * reconcile exactly against the provider's ledger.
 */

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

/** Fiat currencies the client can top up with, per the settlement doc. */
export type FiatCurrency = "GBP" | "EUR" | "USD";

/** Stablecoins incoming fiat is converted into. */
export type StableSymbol = "USDC" | "USDT";

/**
 * An amount in minor units. USDC/USDT are tracked at 6dp (their on-chain
 * decimals); USD at 2dp. `decimals` makes the scale explicit at every
 * boundary so nothing is inferred from the symbol.
 */
export interface Money {
  /** Integer amount in minor units. */
  amount: number;
  decimals: number;
  symbol: StableSymbol | FiatCurrency;
}

// ---------------------------------------------------------------------------
// Assets and wallet
// ---------------------------------------------------------------------------

export type ChainNetwork = "ethereum" | "polygon" | "tron" | "bsc";

export interface Asset {
  symbol: StableSymbol;
  /** Display name, e.g. "USD Coin". */
  name: string;
  decimals: number;
  /** Balance held in the client's Flow wallet. */
  balance: Money;
  /** Value of that balance in USD minor units (cents). */
  usdValue: number;
  /** Networks this asset can be sent/received on. */
  networks: ChainNetwork[];
}

export interface Portfolio {
  /** Total wallet value in USD cents. */
  totalUsdValue: number;
  /** Change over the last 24h, in USD cents. May be negative. */
  changeUsd24h: number;
  /** Change over the last 24h as a ratio, e.g. 0.0458 for +4.58%. */
  changePct24h: number;
  assets: Asset[];
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export type CardStatus = "active" | "frozen" | "pending" | "cancelled";
export type CardKind = "physical" | "virtual";

export interface PaymentCard {
  id: string;
  kind: CardKind;
  status: CardStatus;
  /** Last four digits. Full PAN is never sent to the client. */
  last4: string;
  network: "visa";
  tier: string;
  expiryMonth: number;
  expiryYear: number;
  /** Nickname for virtual cards. */
  label?: string;
  /**
   * Chosen face design. Purely presentational — it never affects the card's
   * balance, limits or credentials. See lib/card-designs.ts.
   */
  design: CardDesignId;
  /**
   * Spendable balance already settled onto the card, in USD cents.
   * Distinct from `Portfolio` — funds must be loaded before they are spendable.
   */
  availableToSpend: number;
  /** Optional per-card spend caps, in USD cents. */
  limits?: {
    dailySpend?: number;
    monthlySpend?: number;
  };
}

/**
 * Sensitive card data, fetched on demand and never cached.
 * Server-side this comes from the provider; the client holds it in memory only.
 */
export interface CardSecrets {
  pan: string;
  cvv: string;
  expiry: string;
  /** ATM PIN for the physical card. */
  pin: string;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export type TransactionKind =
  /** Point-of-sale spend on the Flow card. */
  | "card_purchase"
  /** Wallet -> card transfer, making funds spendable. */
  | "card_load"
  /** Outbound on-chain transfer. */
  | "send"
  /** Inbound on-chain transfer. */
  | "receive"
  /** Fiat top-up converted into stablecoin. */
  | "fiat_topup"
  /** Merchant refund back to the card. */
  | "refund";

export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface Transaction {
  id: string;
  kind: TransactionKind;
  status: TransactionStatus;
  /** ISO 8601 timestamp. */
  occurredAt: string;
  /** Human-readable counterparty: merchant name, address, or "Card Loaded". */
  title: string;
  /** Optional second line, e.g. merchant category or network. */
  subtitle?: string;
  /**
   * Signed amount in USD cents. Negative for outflows (purchases, sends),
   * positive for inflows (receives, loads, refunds).
   */
  amountUsd: number;
  /** The underlying asset amount, where the transaction touched crypto. */
  assetAmount?: Money;
  /** On-chain details, present for send/receive. */
  chain?: {
    network: ChainNetwork;
    txHash: string;
    counterpartyAddress: string;
    confirmations: number;
  };
  /** Card details, present for card_purchase/card_load. */
  card?: {
    cardId: string;
    last4: string;
    merchantCategory?: string;
  };
  /** Provider-side reference used for reconciliation. */
  reference?: string;
}

// ---------------------------------------------------------------------------
// Identity, KYC and security
// ---------------------------------------------------------------------------

export type KycStatus =
  | "not_started"
  | "personal_info_required"
  | "document_required"
  | "in_review"
  | "approved"
  | "rejected";

export interface KycState {
  status: KycStatus;
  personalInfoComplete: boolean;
  documentComplete: boolean;
  /** Set when status is "rejected". */
  rejectionReason?: string;
  updatedAt: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
}

export interface TrustedDevice {
  id: string;
  name: string;
  platform: string;
  lastActiveAt: string;
  /** True for the device the session is running on. */
  isCurrent: boolean;
  location?: string;
}

export interface SecuritySettings {
  biometricsEnabled: boolean;
  twoFactorEnabled: boolean;
  /** Whether a passcode has been set. The passcode itself is never stored here. */
  passcodeSet: boolean;
}

export interface User {
  id: string;
  personalInfo: PersonalInfo;
  kyc: KycState;
  security: SecuritySettings;
  emailVerified: boolean;
  phoneVerified: boolean;
}

// ---------------------------------------------------------------------------
// Flow inputs
// ---------------------------------------------------------------------------

export interface SendRequest {
  assetSymbol: StableSymbol;
  network: ChainNetwork;
  toAddress: string;
  /** Amount in the asset's minor units. */
  amount: number;
}

export interface LoadCardRequest {
  cardId: string;
  assetSymbol: StableSymbol;
  /** Amount in the asset's minor units. */
  amount: number;
}

export interface ReceiveDetails {
  assetSymbol: StableSymbol;
  network: ChainNetwork;
  address: string;
  /** Minimum deposit in the asset's minor units, if the network imposes one. */
  minimumDeposit?: number;
}

/** Envelope returned by every service call so failures are handled uniformly. */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
