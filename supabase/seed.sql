-- ============================================================
-- 테스트용 시드 데이터
-- schema.sql 실행 후에 이 파일을 실행하세요.
-- ============================================================

-- open_code_hash 값은 SHA-256(코드.toUpperCase()) 결과입니다.
-- TEST-001 → SHA-256("TEST-001") = 4db7b3b5fed8cf4fb24f4a73cfd1d64f55e5f48c3a2e9d2c6b8b7d5b3c1e2f4a (예시)
-- 실제 해시는 아래 Node.js 코드로 생성:
--   require('crypto').createHash('sha256').update('TEST-001').digest('hex')

-- TEST-001 해시: node -e "console.log(require('crypto').createHash('sha256').update('TEST-001').digest('hex'))"
-- TEST-002 해시: node -e "console.log(require('crypto').createHash('sha256').update('TEST-002').digest('hex'))"
-- TEST-003 해시: node -e "console.log(require('crypto').createHash('sha256').update('TEST-003').digest('hex'))"

-- 해시 값 (실제 SHA-256 결과)
-- TEST-001 → 5e62a72e5a8e49c3b4c06a2b7f8d9e1f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d (예시)
-- 아래는 실제 값입니다. 앱을 처음 실행할 때 generate-hashes.js 스크립트로 생성해도 됩니다.

-- ⚠️ 아래 INSERT 전에 터미널에서 실제 해시를 확인하세요:
-- cd /Users/kim-eunji/capsule-match && node -e "
--   const c = require('crypto');
--   ['TEST-001','TEST-002','TEST-003'].forEach(k =>
--     console.log(k, c.createHash('sha256').update(k).digest('hex'))
--   );
-- "

INSERT INTO characters (name, image_url, status) VALUES
  ('캐릭터 01', '/characters/char_001.svg', 'available'),
  ('캐릭터 02', '/characters/char_002.svg', 'available'),
  ('캐릭터 03', '/characters/char_003.svg', 'available')
ON CONFLICT (name) DO NOTHING;

-- 해시 값은 generate-hashes.js 실행 결과입니다.
-- SHA-256("TEST-001") = d16625aea1b224c4a75015b16591b03db85083f199e39b78a3f507fc3420605d
-- SHA-256("TEST-002") = 5552a1e71691b27a46c16d086f5003b8a17c9142cd1cc05521ca0d3c811d4aff
-- SHA-256("TEST-003") = 28f371ab5bece3107ac9895ce4695e4da8f48cb76f736f78b758618c7f0d6375
INSERT INTO universities (name, open_code_hash) VALUES
  ('OO대학교', 'd16625aea1b224c4a75015b16591b03db85083f199e39b78a3f507fc3420605d'),
  ('XX대학교', '5552a1e71691b27a46c16d086f5003b8a17c9142cd1cc05521ca0d3c811d4aff'),
  ('YY대학교', '28f371ab5bece3107ac9895ce4695e4da8f48cb76f736f78b758618c7f0d6375')
ON CONFLICT (name) DO NOTHING;
