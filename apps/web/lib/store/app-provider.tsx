"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Client-side session and preference state.
 *
 * PROTOTYPE SCOPE. Onboarding progress lives in localStorage so the flow is
 * demonstrable without a backend. Before production:
 *   - `signedIn` must be driven by an httpOnly session cookie, not this store
 *   - the passcode must be verified server-side; the local hash below only
 *     gates the UI and is not a security control on its own
 */

const STORAGE_KEY = "flow.session.v1";
const PREFS_KEY = "flow.prefs.v1";

/** Matches the fixture user, so the greeting reads correctly in a demo. */
const DEMO_EMAIL = "alexander.reed@example.com";

interface PersistedSession {
  signedIn: boolean;
  email: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  /** SHA-256 of salt + passcode. Never the passcode itself. */
  passcodeHash: string | null;
  passcodeSalt: string | null;
  biometricsEnabled: boolean;
}

const EMPTY_SESSION: PersistedSession = {
  signedIn: false,
  email: null,
  emailVerified: false,
  phoneVerified: false,
  passcodeHash: null,
  passcodeSalt: null,
  biometricsEnabled: false,
};

interface AppState {
  /** True until persisted state has been read — avoids an auth flash. */
  hydrating: boolean;
  session: PersistedSession;
  /** Whether the passcode lock has been cleared this app session. */
  unlocked: boolean;

  balanceHidden: boolean;
  toggleBalanceHidden: () => void;

  signIn: (email: string) => void;
  /**
   * Drops straight into the app with onboarding already complete, for
   * demonstrations. Writes the whole session in one go rather than chaining
   * the individual setters, which would each overwrite from a stale copy.
   */
  startDemoSession: () => void;
  signOut: () => void;
  markEmailVerified: () => void;
  markPhoneVerified: () => void;
  setPasscode: (passcode: string) => Promise<void>;
  verifyPasscode: (passcode: string) => Promise<boolean>;
  setBiometricsEnabled: (enabled: boolean) => void;
  unlock: () => void;
  lock: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrating, setHydrating] = useState(true);
  const [session, setSession] = useState<PersistedSession>(EMPTY_SESSION);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Hydrate from storage on mount.
  //
  // Reading localStorage during render would break SSR and be impure, so this
  // has to happen in an effect. The lint rule guards against effects that
  // cascade renders off React state; this reads an external store exactly
  // once at startup, which is the case the rule can't distinguish.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const rawSession = localStorage.getItem(STORAGE_KEY);
      if (rawSession) {
        setSession({ ...EMPTY_SESSION, ...JSON.parse(rawSession) });
      }
      const rawPrefs = localStorage.getItem(PREFS_KEY);
      if (rawPrefs) {
        setBalanceHidden(Boolean(JSON.parse(rawPrefs).balanceHidden));
      }
    } catch {
      // Corrupt or unavailable storage (private mode): fall back to defaults
    }
    setHydrating(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persistSession = useCallback((next: PersistedSession) => {
    setSession(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Non-fatal: the session simply won't survive a reload
    }
  }, []);

  const toggleBalanceHidden = useCallback(() => {
    setBalanceHidden((current) => {
      const next = !current;
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify({ balanceHidden: next }));
      } catch {
        // Non-fatal
      }
      return next;
    });
  }, []);

  const signIn = useCallback(
    (email: string) => {
      persistSession({ ...session, signedIn: true, email });
      setUnlocked(true);
    },
    [persistSession, session],
  );

  const startDemoSession = useCallback(() => {
    persistSession({
      ...EMPTY_SESSION,
      signedIn: true,
      email: DEMO_EMAIL,
      emailVerified: true,
      phoneVerified: true,
      // No passcode, so the app doesn't ask for one on the way in. Logging
      // out from Profile returns to the normal onboarding flow.
      passcodeHash: null,
      passcodeSalt: null,
    });
    setUnlocked(true);
  }, [persistSession]);

  const signOut = useCallback(() => {
    persistSession(EMPTY_SESSION);
    setUnlocked(false);
  }, [persistSession]);

  const markEmailVerified = useCallback(() => {
    persistSession({ ...session, emailVerified: true });
  }, [persistSession, session]);

  const markPhoneVerified = useCallback(() => {
    persistSession({ ...session, phoneVerified: true });
  }, [persistSession, session]);

  const setPasscode = useCallback(
    async (passcode: string) => {
      const salt = randomSalt();
      const passcodeHash = await hashPasscode(passcode, salt);
      persistSession({ ...session, passcodeHash, passcodeSalt: salt });
      setUnlocked(true);
    },
    [persistSession, session],
  );

  const verifyPasscode = useCallback(
    async (passcode: string) => {
      if (!session.passcodeHash || !session.passcodeSalt) return false;
      const candidate = await hashPasscode(passcode, session.passcodeSalt);
      const match = candidate === session.passcodeHash;
      if (match) setUnlocked(true);
      return match;
    },
    [session.passcodeHash, session.passcodeSalt],
  );

  const setBiometricsEnabled = useCallback(
    (enabled: boolean) => {
      persistSession({ ...session, biometricsEnabled: enabled });
    },
    [persistSession, session],
  );

  const value = useMemo<AppState>(
    () => ({
      hydrating,
      session,
      unlocked,
      balanceHidden,
      toggleBalanceHidden,
      signIn,
      startDemoSession,
      signOut,
      markEmailVerified,
      markPhoneVerified,
      setPasscode,
      verifyPasscode,
      setBiometricsEnabled,
      unlock: () => setUnlocked(true),
      lock: () => setUnlocked(false),
    }),
    [
      hydrating,
      session,
      unlocked,
      balanceHidden,
      toggleBalanceHidden,
      signIn,
      startDemoSession,
      signOut,
      markEmailVerified,
      markPhoneVerified,
      setPasscode,
      verifyPasscode,
      setBiometricsEnabled,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return context;
}

// ---------------------------------------------------------------------------

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPasscode(passcode: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${passcode}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
