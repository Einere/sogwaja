-- 스키마 확인 쿼리
-- Supabase SQL Editor에서 실행하여 테이블이 존재하는지 확인

-- 1. recipes 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'recipes'
) AS recipes_exists;

-- 2. 모든 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. recipes 테이블 구조 확인 (테이블이 존재하는 경우)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recipes'
ORDER BY ordinal_position;

-- 4. RLS 활성화 여부 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'recipes';

-- 5. RLS 정책 확인
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'recipes';

