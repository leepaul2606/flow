import type { CardDesignId } from "@flow/core";
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

/**
 * The seam between Flow and its provider.
 *
 * The provider supplies the licence, the cards and the banking rails. Flow is
 * the programme operating on top of them and owns everything in this
 * repository — including, critically, all authentication and authorisation.
 * The provider holding the licence does not make an open endpoint their
 * problem.
 *
 * Everything behind this interface runs server-side only. Provider API keys
 * must never reach the browser bundle, so the client talks exclusively to
 * Flow's own /api routes, which then call an implementation of this.
 *
 * Swapping the mock for the real integration means writing one new class —
 * no screen code changes.
 */
export interface CardProvider {
  readonly name: string;

  // -- Identity -----------------------------------------------------------
  getUser(userId: string): Promise<Result<User>>;
  updatePersonalInfo(
    userId: string,
    patch: Partial<User["personalInfo"]>,
  ): Promise<Result<User>>;

  // -- Wallet -------------------------------------------------------------
  getPortfolio(userId: string): Promise<Result<Portfolio>>;
  getReceiveDetails(
    userId: string,
    asset: StableSymbol,
  ): Promise<Result<ReceiveDetails[]>>;
  send(userId: string, request: SendRequest): Promise<Result<Transaction>>;

  // -- Cards --------------------------------------------------------------
  getCards(userId: string): Promise<Result<PaymentCard[]>>;
  /**
   * Full PAN/CVV. Short-lived and never persisted client-side — the UI holds
   * this in memory only and drops it on unmount.
   */
  getCardSecrets(userId: string, cardId: string): Promise<Result<CardSecrets>>;
  setCardFrozen(
    userId: string,
    cardId: string,
    frozen: boolean,
  ): Promise<Result<PaymentCard>>;
  /**
   * Moves settled balance from the wallet onto the card.
   * Per the ops document this is client-initiated and separate from the
   * fiat -> stablecoin conversion the provider performs on top-up.
   */
  loadCard(userId: string, request: LoadCardRequest): Promise<Result<Transaction>>;
  createVirtualCard(
    userId: string,
    label: string,
    design?: CardDesignId,
  ): Promise<Result<PaymentCard>>;
  /**
   * Sets the card's face design. Presentational only — it must never affect
   * balance, limits or credentials.
   */
  setCardDesign(
    userId: string,
    cardId: string,
    design: CardDesignId,
  ): Promise<Result<PaymentCard>>;

  // -- Activity -----------------------------------------------------------
  getTransactions(
    userId: string,
    opts?: { limit?: number; cursor?: string },
  ): Promise<Result<Transaction[]>>;
  getTransaction(userId: string, txnId: string): Promise<Result<Transaction>>;

  // -- Security -----------------------------------------------------------
  getTrustedDevices(userId: string): Promise<Result<TrustedDevice[]>>;
  revokeDevice(userId: string, deviceId: string): Promise<Result<void>>;
  setTwoFactorEnabled(
    userId: string,
    enabled: boolean,
  ): Promise<Result<User["security"]>>;
}
