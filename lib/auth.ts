import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "./session";

export {
  COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  checkPassword,
} from "./session";

/** 服务端组件 / Server Action 中判断是否已登录 */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}
