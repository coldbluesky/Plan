import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "study_session";
const ALG = "HS256";

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "dev-only-secret-change-me",
  );
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function checkPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD ?? "admin";
  return input.length > 0 && input === expected;
}
