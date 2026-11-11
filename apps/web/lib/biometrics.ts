"use client";

/**
 * Device biometrics via WebAuthn platform authenticators (Face ID, Touch ID,
 * Windows Hello, Android biometrics).
 *
 * PROTOTYPE SCOPE: the challenge is generated client-side and the resulting
 * credential is not registered with a server, so this proves the user can
 * satisfy the device's biometric prompt — it is not yet an authentication
 * factor. Production needs server-issued challenges and stored credential
 * IDs verified on the server.
 */

export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;

  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export interface BiometricResult {
  ok: boolean;
  /** Set when the user declined or the platform refused. */
  reason?: string;
}

export async function enrolBiometrics(
  userId: string,
  displayName: string,
): Promise<BiometricResult> {
  if (!(await isBiometricsAvailable())) {
    return { ok: false, reason: "Biometrics aren't available on this device" };
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Flow" },
        user: {
          id: new TextEncoder().encode(userId),
          name: displayName,
          displayName,
        },
        // ES256 first, RS256 as fallback
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60_000,
      },
    });

    if (!credential) {
      return { ok: false, reason: "No credential was created" };
    }

    // TODO: POST the attestation to the server and store the credential ID
    return { ok: true };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "NotAllowedError") {
      return { ok: false, reason: "Biometric setup was cancelled" };
    }
    return { ok: false, reason: "Couldn't enable biometrics on this device" };
  }
}
