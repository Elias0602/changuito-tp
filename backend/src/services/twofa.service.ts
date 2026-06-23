import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * Genera un secreto TOTP y la imagen QR (data URL) para escanear con
 * Google Authenticator / Authy.
 */
export async function generarSecreto2FA(email: string) {
  const secret = speakeasy.generateSecret({
    name: `Autoservicio (${email})`,
    issuer: "AutoservicioG8",
    length: 20,
  });

  const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url || "");

  return {
    base32: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrDataUrl,
  };
}

export function verificarToken2FA(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // tolera +/- 30s
  });
}
