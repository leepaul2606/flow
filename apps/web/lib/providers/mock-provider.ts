import "server-only";

import {
  mockCards,
  mockPortfolio,
  mockReceiveDetails,
  mockTransactions,
  mockTrustedDevices,
  mockUser,
} from "../mock-data";
import { DEFAULT_CARD_DESIGN, type CardDesignId } from "@flow/core";
import { estimateNetworkFee } from "@flow/core";
import { stableToUsdCents } from "@flow/core";
import type {
  CardSecrets,
  LoadCardRequest,
  PaymentCard,
  Portfolio,
  ReceiveDetails,
  Result,
  SendRequest,
  StableSymbol,
  Transaction,
  TrustedDevice,
  User,
} from "@flow/core";
import type { CardProvider } from "./types";

const ok = <T,>(data: T): Result<T> => ({ ok: true, data });
const fail = <T,>(error: string, code?: string): Result<T> => ({
  ok: false,
  error,
  code,
});

/** Deep clone so callers can never mutate the fixture store by reference. */
function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Simulated provider latency, so loading states are exercised in dev. */
function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * In-memory implementation of CardProvider.
 *
 * State lives in module scope, so it survives across requests within a single
 * server process but resets on restart. That is deliberate: it makes the
 * prototype feel real (a card load actually moves the balance) without
 * pulling in a database before the real provider integration is specified.
 */
class MockCardProvider implements CardProvider {
  readonly name = "mock";

  private user: User = clone(mockUser);
  private portfolio: Portfolio = clone(mockPortfolio);
  private cards: PaymentCard[] = clone(mockCards);
  private transactions: Transaction[] = clone(mockTransactions);
  private devices: TrustedDevice[] = clone(mockTrustedDevices);

  // -- Identity -----------------------------------------------------------

  async getUser(): Promise<Result<User>> {
    await delay();
    return ok(clone(this.user));
  }

  async updatePersonalInfo(
    _userId: string,
    patch: Partial<User["personalInfo"]>,
  ): Promise<Result<User>> {
    await delay();
    this.user = {
      ...this.user,
      personalInfo: { ...this.user.personalInfo, ...patch },
    };
    return ok(clone(this.user));
  }

  // -- Wallet -------------------------------------------------------------

  async getPortfolio(): Promise<Result<Portfolio>> {
    await delay();
    return ok(clone(this.portfolio));
  }

  async getReceiveDetails(
    _userId: string,
    asset: StableSymbol,
  ): Promise<Result<ReceiveDetails[]>> {
    await delay();
    const details = mockReceiveDetails.filter((d) => d.assetSymbol === asset);
    if (details.length === 0) {
      return fail(`No deposit address available for ${asset}`, "no_address");
    }
    return ok(clone(details));
  }

  async send(
    _userId: string,
    request: SendRequest,
  ): Promise<Result<Transaction>> {
    await delay(600);

    const asset = this.portfolio.assets.find(
      (a) => a.symbol === request.assetSymbol,
    );
    if (!asset) return fail("Unknown asset", "unknown_asset");
    if (request.amount <= 0) return fail("Amount must be positive", "bad_amount");
    if (!asset.networks.includes(request.network)) {
      return fail(
        `${asset.symbol} is not supported on that network`,
        "bad_network",
      );
    }

    // The fee is recomputed here rather than taken from the client, so a
    // tampered request can't send more than the balance covers.
    const fee = estimateNetworkFee(request.network, request.assetSymbol);
    const total = request.amount + fee.amount;

    if (total > asset.balance.amount) {
      return fail("Insufficient balance", "insufficient_funds");
    }

    asset.balance.amount -= total;
    asset.usdValue = stableToUsdCents(asset.balance);
    this.recomputePortfolioTotal();

    const usd = Math.round((request.amount / 10 ** asset.decimals) * 100);
    const txn: Transaction = {
      id: `txn_${Date.now()}`,
      kind: "send",
      status: "processing",
      occurredAt: new Date().toISOString(),
      title: `Sent ${asset.symbol}`,
      subtitle: request.network,
      amountUsd: -usd,
      assetAmount: {
        amount: request.amount,
        decimals: asset.decimals,
        symbol: asset.symbol,
      },
      chain: {
        network: request.network,
        txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
        counterpartyAddress: request.toAddress,
        confirmations: 0,
      },
      reference: `CHAIN-${Date.now().toString().slice(-7)}`,
    };

    this.transactions = [txn, ...this.transactions];
    return ok(clone(txn));
  }

  // -- Cards --------------------------------------------------------------

  async getCards(): Promise<Result<PaymentCard[]>> {
    await delay();
    return ok(clone(this.cards));
  }

  async getCardSecrets(
    _userId: string,
    cardId: string,
  ): Promise<Result<CardSecrets>> {
    await delay(400);
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return fail("Card not found", "not_found");
    if (card.status === "frozen") {
      return fail("Card is frozen", "card_frozen");
    }
    return ok({
      pan: `4242 4242 4242 ${card.last4}`,
      cvv: "829",
      expiry: `${String(card.expiryMonth).padStart(2, "0")}/${String(
        card.expiryYear,
      ).slice(-2)}`,
      pin: "4417",
    });
  }

  async setCardFrozen(
    _userId: string,
    cardId: string,
    frozen: boolean,
  ): Promise<Result<PaymentCard>> {
    await delay(400);
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return fail("Card not found", "not_found");
    if (card.status === "cancelled") {
      return fail("Cancelled cards cannot be modified", "card_cancelled");
    }
    card.status = frozen ? "frozen" : "active";
    return ok(clone(card));
  }

  async loadCard(
    _userId: string,
    request: LoadCardRequest,
  ): Promise<Result<Transaction>> {
    await delay(800);

    const card = this.cards.find((c) => c.id === request.cardId);
    if (!card) return fail("Card not found", "not_found");
    if (card.status === "frozen") {
      return fail("Unfreeze your card before loading it", "card_frozen");
    }

    const asset = this.portfolio.assets.find(
      (a) => a.symbol === request.assetSymbol,
    );
    if (!asset) return fail("Unknown asset", "unknown_asset");
    if (request.amount <= 0) return fail("Amount must be positive", "bad_amount");
    if (request.amount > asset.balance.amount) {
      return fail("Insufficient balance", "insufficient_funds");
    }

    const usd = Math.round((request.amount / 10 ** asset.decimals) * 100);

    asset.balance.amount -= request.amount;
    asset.usdValue = stableToUsdCents(asset.balance);
    this.recomputePortfolioTotal();
    card.availableToSpend += usd;

    const txn: Transaction = {
      id: `txn_${Date.now()}`,
      kind: "card_load",
      status: "completed",
      occurredAt: new Date().toISOString(),
      title: "Card Loaded",
      subtitle: `From ${asset.symbol}`,
      amountUsd: usd,
      assetAmount: {
        amount: request.amount,
        decimals: asset.decimals,
        symbol: asset.symbol,
      },
      card: { cardId: card.id, last4: card.last4 },
      reference: `LOAD-${Date.now().toString().slice(-7)}`,
    };

    this.transactions = [txn, ...this.transactions];
    return ok(clone(txn));
  }

  async createVirtualCard(
    _userId: string,
    label: string,
    design: CardDesignId = DEFAULT_CARD_DESIGN,
  ): Promise<Result<PaymentCard>> {
    await delay(600);
    const card: PaymentCard = {
      id: `card_virtual_${Date.now()}`,
      kind: "virtual",
      status: "active",
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      network: "visa",
      tier: "Virtual",
      label,
      design,
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 3,
      availableToSpend: 0,
    };
    this.cards = [...this.cards, card];
    return ok(clone(card));
  }

  async setCardDesign(
    _userId: string,
    cardId: string,
    design: CardDesignId,
  ): Promise<Result<PaymentCard>> {
    await delay(350);
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return fail("Card not found", "not_found");
    if (card.status === "cancelled") {
      return fail("Cancelled cards cannot be modified", "card_cancelled");
    }
    card.design = design;
    return ok(clone(card));
  }

  // -- Activity -----------------------------------------------------------

  async getTransactions(
    _userId: string,
    opts: { limit?: number; cursor?: string } = {},
  ): Promise<Result<Transaction[]>> {
    await delay();
    const sorted = [...this.transactions].sort(
      (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
    );
    const start = opts.cursor
      ? sorted.findIndex((t) => t.id === opts.cursor) + 1
      : 0;
    const slice = sorted.slice(start, start + (opts.limit ?? sorted.length));
    return ok(clone(slice));
  }

  async getTransaction(
    _userId: string,
    txnId: string,
  ): Promise<Result<Transaction>> {
    await delay();
    const txn = this.transactions.find((t) => t.id === txnId);
    if (!txn) return fail("Transaction not found", "not_found");
    return ok(clone(txn));
  }

  // -- Security -----------------------------------------------------------

  async getTrustedDevices(): Promise<Result<TrustedDevice[]>> {
    await delay();
    return ok(clone(this.devices));
  }

  async revokeDevice(
    _userId: string,
    deviceId: string,
  ): Promise<Result<void>> {
    await delay(400);
    const device = this.devices.find((d) => d.id === deviceId);
    if (!device) return fail("Device not found", "not_found");
    if (device.isCurrent) {
      return fail("Cannot revoke the device you are using", "current_device");
    }
    this.devices = this.devices.filter((d) => d.id !== deviceId);
    return ok(undefined);
  }

  async setTwoFactorEnabled(
    _userId: string,
    enabled: boolean,
  ): Promise<Result<User["security"]>> {
    await delay(400);
    this.user = {
      ...this.user,
      security: { ...this.user.security, twoFactorEnabled: enabled },
    };
    return ok(clone(this.user.security));
  }

  // -- Internals ----------------------------------------------------------

  /** Keep the headline total in step after any balance movement. */
  private recomputePortfolioTotal(): void {
    this.portfolio.totalUsdValue = this.portfolio.assets.reduce(
      (sum, a) => sum + a.usdValue,
      0,
    );
  }
}

export const mockProvider = new MockCardProvider();
