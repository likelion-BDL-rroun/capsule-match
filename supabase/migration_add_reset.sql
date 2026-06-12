-- ============================================================
-- 재배정 기능 추가 마이그레이션
-- schema.sql 실행 이후에 이 파일을 실행하세요.
-- ============================================================

-- assignment_logs에 action, reason 컬럼 추가
ALTER TABLE assignment_logs
  ADD COLUMN IF NOT EXISTS action TEXT NOT NULL DEFAULT 'assigned'
    CHECK (action IN ('assigned', 'reset', 'reassigned', 'retired')),
  ADD COLUMN IF NOT EXISTS reason TEXT;

-- characters 테이블에 retired 상태 추가
ALTER TABLE characters
  DROP CONSTRAINT IF EXISTS characters_status_check;
ALTER TABLE characters
  ADD CONSTRAINT characters_status_check
    CHECK (status IN ('available', 'assigned', 'retired'));

-- ============================================================
-- 원자적 배정 초기화 함수
-- 특정 대학의 배정만 안전하게 초기화합니다.
-- ============================================================
CREATE OR REPLACE FUNCTION reset_university_assignment(
  p_university_id  UUID,
  p_retire_character BOOLEAN,  -- true: 기존 캐릭터를 retired 처리, false: available로 되돌리기
  p_reason         TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_character_id UUID;
  v_now          TIMESTAMPTZ := now();
BEGIN
  -- 배정된 캐릭터 ID 조회 (행 잠금)
  SELECT assigned_character_id INTO v_character_id
  FROM universities
  WHERE id = p_university_id
  FOR UPDATE;

  IF v_character_id IS NULL THEN
    RETURN jsonb_build_object('error_code', 'NOT_ASSIGNED');
  END IF;

  -- 기존 캐릭터 처리
  IF p_retire_character THEN
    UPDATE characters
    SET status = 'retired',
        assigned_university_id = NULL,
        assigned_at = NULL
    WHERE id = v_character_id;
  ELSE
    UPDATE characters
    SET status = 'available',
        assigned_university_id = NULL,
        assigned_at = NULL
    WHERE id = v_character_id;
  END IF;

  -- 대학 배정 초기화
  UPDATE universities
  SET assigned_character_id = NULL,
      assigned_at = NULL
  WHERE id = p_university_id;

  -- 로그 기록
  INSERT INTO assignment_logs (
    university_id, character_id, assigned_at,
    action, reason
  ) VALUES (
    p_university_id, v_character_id, v_now,
    CASE WHEN p_retire_character THEN 'retired' ELSE 'reset' END,
    p_reason
  );

  RETURN jsonb_build_object(
    'success', true,
    'character_id', v_character_id,
    'action', CASE WHEN p_retire_character THEN 'retired' ELSE 'reset' END
  );
END;
$$;
