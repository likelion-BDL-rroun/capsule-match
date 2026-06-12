// 캡슐 오픈 코드를 SHA-256 해시로 변환합니다.
// 서버(Node.js)에서만 사용합니다.
import { createHash } from 'crypto';

export function hashOpenCode(code: string): string {
  return createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}
