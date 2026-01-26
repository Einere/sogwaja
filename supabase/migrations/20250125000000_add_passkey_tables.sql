-- 패스키(WebAuthn) 지원을 위한 테이블 추가
-- 생성일: 2025-01-25

-- 패스키 크레덴셜 저장 테이블
CREATE TABLE user_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id BYTEA NOT NULL UNIQUE,
  public_key BYTEA NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports TEXT[],
  device_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- 인덱스 생성
CREATE INDEX idx_user_passkeys_user_id ON user_passkeys(user_id);
CREATE INDEX idx_user_passkeys_credential_id ON user_passkeys(credential_id);

-- RLS 정책 활성화
ALTER TABLE user_passkeys ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 패스키만 조회/관리 가능
CREATE POLICY "Users can view own passkeys" ON user_passkeys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passkeys" ON user_passkeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passkeys" ON user_passkeys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passkeys" ON user_passkeys
  FOR DELETE USING (auth.uid() = user_id);

-- WebAuthn 챌린지 임시 저장 테이블 (5분 TTL)
CREATE TABLE webauthn_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_webauthn_challenges_user_id ON webauthn_challenges(user_id);
CREATE INDEX idx_webauthn_challenges_expires ON webauthn_challenges(expires_at);

-- RLS 정책 활성화
ALTER TABLE webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- 서비스 역할만 챌린지 테이블에 접근 가능 (API에서 service_role 키 사용)
-- 일반 사용자는 직접 접근 불가
CREATE POLICY "Service role can manage challenges" ON webauthn_challenges
  FOR ALL USING (true) WITH CHECK (true);

-- 만료된 챌린지 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS void AS $$
BEGIN
  DELETE FROM webauthn_challenges WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (선택사항) pg_cron 확장이 있다면 주기적 정리 스케줄링
-- SELECT cron.schedule('cleanup-challenges', '*/5 * * * *', 'SELECT cleanup_expired_challenges()');
