-- ============================================================
-- capsule-match 스키마 정의
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.
-- ============================================================

-- 1. characters 테이블 (universities보다 먼저 생성)
CREATE TABLE IF NOT EXISTS characters (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL UNIQUE,
  image_url              TEXT,
  status                 TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned')),
  assigned_university_id UUID,
  assigned_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now()
);

-- 2. universities 테이블
CREATE TABLE IF NOT EXISTS universities (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL UNIQUE,
  open_code_hash        TEXT NOT NULL,
  assigned_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  assigned_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- 3. characters의 FK를 나중에 추가 (universities 테이블이 먼저 필요하므로)
ALTER TABLE characters
  DROP CONSTRAINT IF EXISTS characters_assigned_university_id_fkey;
ALTER TABLE characters
  ADD CONSTRAINT characters_assigned_university_id_fkey
  FOREIGN KEY (assigned_university_id) REFERENCES universities(id) ON DELETE SET NULL;

-- 4. assignment_logs 테이블
CREATE TABLE IF NOT EXISTS assignment_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id  UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  character_id   UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  assigned_at    TIMESTAMPTZ DEFAULT now(),
  user_agent     TEXT,
  ip_hash        TEXT
);

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read universities"
  ON universities FOR SELECT USING (true);
CREATE POLICY "Service role write universities"
  ON universities FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read characters"
  ON characters FOR SELECT USING (true);
CREATE POLICY "Service role write characters"
  ON characters FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE assignment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only logs"
  ON assignment_logs FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 원자적 랜덤 배정 함수 (핵심 로직)
-- 동시 접속 시 중복 배정을 방지합니다.
-- ============================================================
CREATE OR REPLACE FUNCTION assign_random_character(p_university_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_character_id UUID;
  v_now          TIMESTAMPTZ := now();
BEGIN
  IF EXISTS (
    SELECT 1 FROM universities
    WHERE id = p_university_id AND assigned_character_id IS NOT NULL
  ) THEN
    RETURN jsonb_build_object('error_code', 'ALREADY_ASSIGNED');
  END IF;

  SELECT id INTO v_character_id
  FROM characters
  WHERE status = 'available'
  ORDER BY random()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_character_id IS NULL THEN
    RETURN jsonb_build_object('error_code', 'NO_CHARACTERS');
  END IF;

  UPDATE characters
  SET status = 'assigned',
      assigned_university_id = p_university_id,
      assigned_at = v_now
  WHERE id = v_character_id;

  UPDATE universities
  SET assigned_character_id = v_character_id,
      assigned_at = v_now
  WHERE id = p_university_id;

  RETURN jsonb_build_object('character_id', v_character_id);
END;
$$;
