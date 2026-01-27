-- 패스키 컬럼 타입 수정
-- BYTEA에서 TEXT로 변경 (Base64URL 인코딩된 문자열 저장)

-- 기존 데이터 삭제 (타입 변환 시 문제 방지)
DELETE FROM user_passkeys;

-- credential_id 컬럼 타입 변경
ALTER TABLE user_passkeys
  ALTER COLUMN credential_id TYPE TEXT USING credential_id::TEXT;

-- public_key 컬럼 타입 변경
ALTER TABLE user_passkeys
  ALTER COLUMN public_key TYPE TEXT USING public_key::TEXT;

-- 인덱스 재생성 (타입 변경으로 인해 필요할 수 있음)
DROP INDEX IF EXISTS idx_user_passkeys_credential_id;
CREATE INDEX idx_user_passkeys_credential_id ON user_passkeys(credential_id);
