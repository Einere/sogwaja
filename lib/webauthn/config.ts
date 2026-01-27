// WebAuthn Relying Party 설정

export const rpName = "구움과자 조리법";

// rpID는 도메인명 (포트 제외)
// 개발 환경에서는 localhost, 프로덕션에서는 실제 도메인 사용
export function getRpID(): string {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }

  // 서버 사이드에서는 환경 변수 사용
  const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (origin) {
    try {
      const url = new URL(origin.startsWith("http") ? origin : `https://${origin}`);
      return url.hostname;
    } catch {
      return "localhost";
    }
  }

  return "localhost";
}

export function getOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

// 챌린지 만료 시간 (5분)
export const CHALLENGE_TTL_MS = 5 * 60 * 1000;
