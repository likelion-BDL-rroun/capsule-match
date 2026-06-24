// 캐릭터 이름을 번호에 맞게 일괄 변경한다 (배정/이미지는 건드리지 않음).
// 실행:  node scripts/rename-characters.mjs
//
// 매칭 기준: image_url = /characters/char_NN.png

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

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
  console.error('❌ .env.local 에 SUPABASE URL / SERVICE_ROLE_KEY 가 필요합니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 번호(1~80) → 이름
const NAMES = [
  '멧돼지', '호랑이', '곰', '북극곰', '사슴', '가젤', '고슴도치', '호저', '벌꿀오소리', '수달',
  '사막여우', '북극여우', '더치 래빗', '롭이어토끼', '쇼트헤어고양이', '폴드 고양이', '원숭이', '여우원숭이', '나무늘보', '랫서팬더',
  '팬더', '늑대', '하이에나', '치타', '리트리버 강아지', '닥스훈트', '허스키', '황소test', '물소', '얼룩소',
  '다람쥐', '청설모', '코끼리', '코뿔소', '하마', '카피바라', '양', '얼룩말', '청황금강앵무', '홍금강앵무',
  '부엉이', '수리부엉이', '올빼미', '펠리컨', '닭', '수탉', '청둥오리', '독수리', '공작새', '홍학',
  '왕부리새', '펭귄', '마카펭귄', '오목눈이', '참새', '화룡', '수룡', '예티', '유니콘', '페가수스',
  '봉황', '그리핀', '흑랑', '나무', '은행', '벚나무', '물', '불', '번개', '얼음',
  '돌', '광석', '동백꽃', '도라지', '튤립', '송이버섯', '광대버섯', '노루궁뎅이', '선인장', '비모란',
];

async function main() {
  console.log(`✏️  ${NAMES.length}종 이름 변경 시작...`);
  let ok = 0;
  for (let i = 0; i < NAMES.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const imageUrl = `/characters/char_${num}.png`;
    const { error, count } = await supabase
      .from('characters')
      .update({ name: NAMES[i] }, { count: 'exact' })
      .eq('image_url', imageUrl);
    if (error) {
      console.warn(`  ⚠️ ${num} ${NAMES[i]} — ${error.message}`);
    } else if (count === 0) {
      console.warn(`  ⚠️ ${num} ${NAMES[i]} — 매칭되는 행 없음 (${imageUrl})`);
    } else {
      ok++;
    }
  }
  console.log(`✅ 완료 — ${ok}/${NAMES.length}종 변경됨.`);
}

main();
