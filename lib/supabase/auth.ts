import { createClient } from "./server";
import { AuthenticationError } from "@/lib/errors";
import type { User } from "@supabase/supabase-js";

/**
 * 서버에서 현재 사용자 정보를 가져옵니다.
 * @returns 사용자 정보 또는 null
 */
export async function getServerUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 서버에서 현재 사용자 정보를 가져옵니다.
 * 사용자가 없으면 에러를 throw합니다.
 * @returns 사용자 정보
 * @throws {AuthenticationError} 사용자가 없을 경우
 */
export async function requireServerUser(): Promise<User> {
  const user = await getServerUser();
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
}
