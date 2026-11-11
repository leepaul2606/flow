import { ASSET_DECIMALS, stableToUsdCents } from "@flow/core";
import type {
  Asset,
  KycState,
  PaymentCard,
  Portfolio,
  ReceiveDetails,
  Transaction,
  TrustedDevice,
  User,
} from "@flow/core";

/**
 * Fixture data standing in for the provider until the integration lands.
 * Values mirror the V1 mocks. Timestamps are generated relative to "now" so
 * the activity feed always reads as Today / Yesterday.
 */

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysAgo(d: number, hour = 12, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

const usdc: Asset = {
  symbol: "USDC",
  name: "USD Coin",
  decimals: ASSET_DECIMALS.USDC,
  balance: { amount: 18_562_410_000, decimals: ASSET_DECIMALS.USDC, symbol: "USDC" },
  usdValue: 0, // derived below
  networks: ["ethereum", "polygon"],
};

const usdt: Asset = {
  symbol: "USDT",
  name: "Tether",
  decimals: ASSET_DECIMALS.USDT,
  balance: { amount: 7_842_710_000, decimals: ASSET_DECIMALS.USDT, symbol: "USDT" },
  usdValue: 0, // derived below
  networks: ["ethereum", "tron"],
};

// Derive USD values from balances rather than hardcoding them, so the headline
// total can never drift out of step with the asset list.
usdc.usdValue = stableToUsdCents(usdc.balance);
usdt.usdValue = stableToUsdCents(usdt.balance);

export const mockAssets: Asset[] = [usdc, usdt];

const totalUsdValue = mockAssets.reduce((sum, a) => sum + a.usdValue, 0);
const changePct24h = 0.0458;
// Derive the absolute change from the total and the percentage so the two
// figures shown side by side always agree.
const changeUsd24h = Math.round(
  totalUsdValue - totalUsdValue / (1 + changePct24h),
);

export const mockPortfolio: Portfolio = {
  totalUsdValue,
  changeUsd24h,
  changePct24h,
  assets: mockAssets,
};

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export const mockPhysicalCard: PaymentCard = {
  id: "card_physical_01",
  kind: "physical",
  status: "active",
  last4: "4242",
  network: "visa",
  tier: "Platinum",
  expiryMonth: 8,
  expiryYear: 2029,
  design: "obsidian_gold",
  availableToSpend: 250_000, // $2,500.00
  limits: {
    dailySpend: 500_000,
    monthlySpend: 2_500_000,
  },
};

export const mockVirtualCards: PaymentCard[] = [
  {
    id: "card_virtual_01",
    kind: "virtual",
    status: "active",
    last4: "8817",
    network: "visa",
    tier: "Virtual",
    label: "Subscriptions",
    expiryMonth: 3,
    expiryYear: 2028,
    design: "midnight_blue",
    availableToSpend: 25_000,
    limits: { monthlySpend: 50_000 },
  },
];

export const mockCards: PaymentCard[] = [mockPhysicalCard, ...mockVirtualCards];

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export const mockTransactions: Transaction[] = [
  {
    id: "txn_01",
    kind: "card_purchase",
    status: "completed",
    occurredAt: hoursAgo(2),
    title: "Apple Store",
    subtitle: "Electronics",
    amountUsd: -129_900,
    card: { cardId: "card_physical_01", last4: "4242", merchantCategory: "Electronics" },
    reference: "AUTH-8841203",
  },
  {
    id: "txn_02",
    kind: "card_load",
    status: "completed",
    occurredAt: hoursAgo(3),
    title: "Card Loaded",
    subtitle: "From USDC",
    amountUsd: 50_000,
    assetAmount: { amount: 500_000_000, decimals: 6, symbol: "USDC" },
    card: { cardId: "card_physical_01", last4: "4242" },
    reference: "LOAD-4471902",
  },
  {
    id: "txn_03",
    kind: "receive",
    status: "completed",
    occurredAt: daysAgo(1, 18, 37),
    title: "USDC Received",
    subtitle: "Ethereum",
    amountUsd: 200_000,
    assetAmount: { amount: 2_000_000_000, decimals: 6, symbol: "USDC" },
    chain: {
      network: "ethereum",
      txHash: "0x7f3a9c2e8b1d4f6a0c5e2b8d7a4f1c9e3b6d0a8f2c5e7b1d4a9f6c3e0b8d2a5f",
      counterpartyAddress: "0x8A21F4c9B3e7D05a1C6f2E9b4D8a7C3f0B5e1D6a",
      confirmations: 128,
    },
    reference: "CHAIN-9920144",
  },
  {
    id: "txn_04",
    kind: "card_purchase",
    status: "completed",
    occurredAt: daysAgo(2, 13, 12),
    title: "Blue Bottle Coffee",
    subtitle: "Food & Drink",
    amountUsd: -1_850,
    card: { cardId: "card_physical_01", last4: "4242", merchantCategory: "Food & Drink" },
    reference: "AUTH-8830117",
  },
  {
    id: "txn_05",
    kind: "send",
    status: "completed",
    occurredAt: daysAgo(3, 10, 4),
    title: "Sent USDT",
    subtitle: "Tron",
    amountUsd: -75_000,
    assetAmount: { amount: 750_000_000, decimals: 6, symbol: "USDT" },
    chain: {
      network: "tron",
      txHash: "b4d7a1f9c3e6082b5d8a4f1c7e2b9d6a3f0c8e5b1d7a4f2c9e6b3d0a8f5c2e7b",
      counterpartyAddress: "TQmX8kL2pR7nV4bY6cH9jW3dF1gS5tA0zN",
      confirmations: 512,
    },
    reference: "CHAIN-9918022",
  },
  {
    id: "txn_06",
    kind: "fiat_topup",
    status: "completed",
    occurredAt: daysAgo(4, 9, 30),
    title: "Bank Transfer",
    subtitle: "GBP converted to USDC",
    amountUsd: 500_000,
    assetAmount: { amount: 5_000_000_000, decimals: 6, symbol: "USDC" },
    reference: "XPW-2040733183",
  },
  {
    id: "txn_07",
    kind: "card_purchase",
    status: "completed",
    occurredAt: daysAgo(5, 20, 45),
    title: "Emirates",
    subtitle: "Travel",
    amountUsd: -184_200,
    card: { cardId: "card_physical_01", last4: "4242", merchantCategory: "Travel" },
    reference: "AUTH-8811940",
  },
  {
    id: "txn_08",
    kind: "refund",
    status: "completed",
    occurredAt: daysAgo(6, 11, 22),
    title: "Zara — Refund",
    subtitle: "Retail",
    amountUsd: 12_400,
    card: { cardId: "card_physical_01", last4: "4242", merchantCategory: "Retail" },
    reference: "RFND-7719033",
  },
  {
    id: "txn_09",
    kind: "card_purchase",
    status: "pending",
    occurredAt: hoursAgo(1),
    title: "Uber",
    subtitle: "Transport",
    amountUsd: -3_240,
    card: { cardId: "card_physical_01", last4: "4242", merchantCategory: "Transport" },
    reference: "AUTH-8841500",
  },
];

// ---------------------------------------------------------------------------
// Receive addresses
// ---------------------------------------------------------------------------

export const mockReceiveDetails: ReceiveDetails[] = [
  {
    assetSymbol: "USDC",
    network: "ethereum",
    address: "0x8A21F4c9B3e7D05a1C6f2E9b4D8a7C3f0B5e1D6a",
    minimumDeposit: 1_000_000,
  },
  {
    assetSymbol: "USDC",
    network: "polygon",
    address: "0x8A21F4c9B3e7D05a1C6f2E9b4D8a7C3f0B5e1D6a",
    minimumDeposit: 1_000_000,
  },
  {
    assetSymbol: "USDT",
    network: "ethereum",
    address: "0x8A21F4c9B3e7D05a1C6f2E9b4D8a7C3f0B5e1D6a",
    minimumDeposit: 1_000_000,
  },
  {
    assetSymbol: "USDT",
    network: "tron",
    address: "TQmX8kL2pR7nV4bY6cH9jW3dF1gS5tA0zN",
    minimumDeposit: 1_000_000,
  },
];

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

const mockKyc: KycState = {
  status: "approved",
  personalInfoComplete: true,
  documentComplete: true,
  updatedAt: daysAgo(30),
};

export const mockUser: User = {
  id: "usr_01H8XKQ",
  personalInfo: {
    firstName: "Alexander",
    lastName: "Reed",
    email: "alexander.reed@example.com",
    phone: "+971 50 123 4567",
    dateOfBirth: "1990-04-17",
    address: {
      line1: "Unit 1204, Burj Vista Tower 1",
      city: "Dubai",
      postcode: "00000",
      country: "United Arab Emirates",
    },
  },
  kyc: mockKyc,
  security: {
    biometricsEnabled: true,
    twoFactorEnabled: false,
    passcodeSet: true,
  },
  emailVerified: true,
  phoneVerified: true,
};

export const mockTrustedDevices: TrustedDevice[] = [
  {
    id: "dev_01",
    name: "iPhone 15 Pro",
    platform: "iOS 18.2",
    lastActiveAt: new Date().toISOString(),
    isCurrent: true,
    location: "Dubai, UAE",
  },
  {
    id: "dev_02",
    name: "MacBook Pro",
    platform: "macOS 15.1",
    lastActiveAt: daysAgo(2, 16, 20),
    isCurrent: false,
    location: "Dubai, UAE",
  },
  {
    id: "dev_03",
    name: "iPad Air",
    platform: "iPadOS 18.1",
    lastActiveAt: daysAgo(12, 8, 5),
    isCurrent: false,
    location: "London, UK",
  },
];
