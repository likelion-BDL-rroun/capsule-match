import { createClient } from '@supabase/supabase-js';

// 브라우저에서 사용하는 공개 클라이언트 (RLS 정책 적용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
