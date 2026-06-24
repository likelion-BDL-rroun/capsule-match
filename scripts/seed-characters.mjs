// public/characters 의 80종 카드 이미지를 Supabase characters 테이블에 시드한다.
// 실행:  node scripts/seed-characters.mjs
//
// 기존 characters 를 모두 비우고(배정/로그 포함) 새로 80종을 넣는다.
// 행사 시작 전(배정 없음) 사용을 전제로 한다.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// .env.local 직접 파싱 (dotenv 의존성 없이)
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(join(root, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* 무시 */
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 필요합니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// public/characters 에서 char_NN.png 파일을 읽어 정렬
const files = readdirSync(join(root, 'public', 'characters'))
  .filter((f) => /^char_\d+\.png$/i.test(f))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0], 10);
    const nb = parseInt(b.match(/\d+/)[0], 10);
    return na - nb;
  });

if (files.length === 0) {
  console.error('❌ public/characters 에 char_NN.png 파일이 없습니다.');
  process.exit(1);
}

const rows = files.map((file) => {
  const num = file.match(/\d+/)[0]; // 예: "01"
  return {
    name: `캐릭터 ${num}`,
    image_url: `/characters/${file}`,
    status: 'available',
  };
});

async function main() {
  console.log(`📦 ${rows.length}종 카드 발견 — ${files[0]} ~ ${files[files.length - 1]}`);

  // FK 정리: 배정 로그 → 대학 배정 해제 → 캐릭터 삭제 순서
  console.log('🧹 기존 데이터 정리 중...');

  const { error: logErr } = await supabase
    .from('assignment_logs')
    .delete()
    .not('id', 'is', null);
  if (logErr) console.warn('  assignment_logs 정리 경고:', logErr.message);

  const { error: uniErr } = await supabase
    .from('universities')
    .update({ assigned_character_id: null, assigned_at: null })
    .not('id', 'is', null);
  if (uniErr) console.warn('  universities 배정 해제 경고:', uniErr.message);

  const { error: delErr } = await supabase
    .from('characters')
    .delete()
    .not('id', 'is', null);
  if (delErr) {
    console.error('❌ characters 삭제 실패:', delErr.message);
    process.exit(1);
  }

  console.log('⬆️  새 캐릭터 삽입 중...');
  const { data, error: insErr } = await supabase
    .from('characters')
    .insert(rows)
    .select('id');
  if (insErr) {
    console.error('❌ 삽입 실패:', insErr.message);
    process.exit(1);
  }

  console.log(`✅ 완료 — ${data.length}종 시드됨.`);
}

main();
