// 학교별 오픈 코드를 일괄 변경한다 (open_code_hash = sha256(code.trim().toUpperCase())).
// 실행:  node scripts/update-codes.mjs
// 매칭 기준: universities.name

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
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
  } catch {}
  return env;
}

const env = loadEnv();
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('❌ .env.local 키 필요'); process.exit(1); }

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
const hash = (code) => createHash('sha256').update(code.trim().toUpperCase()).digest('hex');

// [학교명, 코드]
const CODES = [
  ['가천대학교(글로벌)', '00683'], ['가톨릭대학교(성심)', '32012'], ['강남대학교', '10644'],
  ['경기대학교', '42681'], ['경북대학교', '13453'], ['경상국립대학교', '17126'],
  ['경성대학교', '05087'], ['경희대학교', '86502'], ['계명대학교', '88546'],
  ['고려대학교(서울)', '03718'], ['고려대학교(세종)', '81910'], ['공주대학교(천안)', '06281'],
  ['광운대학교', '23361'], ['국립금오공과대학교', '07295'], ['국립순천대학교', '65803'],
  ['국립창원대학교', '81636'], ['국민대학교', '45060'], ['단국대학교(죽전)', '01623'],
  ['대구대학교', '26628'], ['덕성여자대학교', '24129'], ['동국대학교', '62318'],
  ['동덕여자대학교', '17899'], ['동아대학교', '21182'], ['명지대학교(인문)', '78401'],
  ['명지대학교(자연)', '51274'], ['백석대학교', '84573'], ['삼육대학교', '87587'],
  ['상명대학교(서울)', '25140'], ['상명대학교(천안)', '58644'], ['서강대학교', '85681'],
  ['서경대학교', '10135'], ['서울과학기술대학교', '43157'], ['서울대학교', '54008'],
  ['서울여자대학교', '82297'], ['서울예술대학교', '75822'], ['서일대학교', '71029'],
  ['선문대학교', '89379'], ['성결대학교', '63939'], ['성공회대학교', '36712'],
  ['성균관대학교', '27170'], ['성신여자대학교', '13420'], ['세종대학교', '98710'],
  ['수원대학교', '04980'], ['숙명여자대학교', '23525'], ['순천향대학교', '95813'],
  ['숭실대학교', '18419'], ['신한대학교', '48039'], ['연세대학교(미래)', '03927'],
  ['연세대학교(서울)', '54926'], ['연암공과대학교', '46328'], ['영남대학교', '67831'],
  ['을지대학교(성남)', '74209'], ['이화여자대학교', '69197'], ['인천대학교', '38046'],
  ['인하대학교', '35910'], ['전북대학교', '71646'], ['제주대학교', '24711'],
  ['중부대학교(고양)', '69034'], ['중앙대학교', '51733'], ['차의과학대학교', '18317'],
  ['청주대학교', '50855'], ['충남대학교', '05881'], ['충북대학교', '58775'],
  ['태재대학교', '29476'], ['평택대학교', '38904'], ['한국공학대학교', '23783'],
  ['한국교통대(충주)', '77391'], ['한국기술교육대', '30633'], ['한국외대(글로벌)', '15396'],
  ['한국외대(서울)', '82785'], ['한국항공대', '58013'], ['한남대학교', '40912'],
  ['한동대학교', '40999'], ['한림대학교', '53822'], ['한밭대학교', '80785'],
  ['한서대학교(서산)', '93978'], ['한성대학교', '91426'], ['한양대학교(ERICA)', '75316'],
  ['호서대학교', '56204'], ['홍익대학교(서울)', '83427'],
];

async function main() {
  console.log(`🔑 ${CODES.length}개 학교 코드 업데이트 시작...`);
  let ok = 0;
  for (const [name, code] of CODES) {
    const { error, count } = await supabase
      .from('universities')
      .update({ open_code_hash: hash(code) }, { count: 'exact' })
      .eq('name', name);
    if (error) console.warn(`  ⚠️ ${name} — ${error.message}`);
    else if (count === 0) console.warn(`  ⚠️ ${name} — 매칭되는 학교 없음 (이름 확인)`);
    else ok++;
  }
  console.log(`✅ 완료 — ${ok}/${CODES.length}개 적용됨.`);
}

main();
