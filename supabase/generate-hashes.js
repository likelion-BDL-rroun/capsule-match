/**
 * 캡슐 오픈 코드의 SHA-256 해시를 생성합니다.
 * seed.sql에 넣기 전에 이 스크립트로 해시 값을 확인하세요.
 *
 * 실행 방법:
 *   node supabase/generate-hashes.js
 */

const { createHash } = require('crypto');

const codes = ['TEST-001', 'TEST-002', 'TEST-003'];

console.log('=== 캡슐 오픈 코드 해시 ===');
codes.forEach((code) => {
  const hash = createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
  console.log(`${code} → ${hash}`);
});

console.log('\n위 해시 값을 seed.sql에 사용하세요.');
