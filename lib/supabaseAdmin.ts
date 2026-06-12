import { createClient } from '@supabase/supabase-js';

// 서버 전용 관리자 클라이언트 (Service Role Key 사용)
// 절대 브라우저에서 import하지 마세요. API Route에서만 사용합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
