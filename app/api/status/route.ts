import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const [{ data: universities }, { data: characters }] = await Promise.all([
      supabaseAdmin
        .from('universities')
        .select(`
          id, name, assigned_character_id, assigned_at,
          characters:assigned_character_id ( id, name, image_url )
        `)
        .order('name'),
      supabaseAdmin.from('characters').select('id, name, status').order('name'),
    ]);

    const assigned = universities?.filter((u) => u.assigned_character_id).length ?? 0;
    const total = universities?.length ?? 0;
    const remaining = characters?.filter((c) => c.status === 'available').length ?? 0;

    return NextResponse.json({ universities, characters, assigned, total, remaining });
  } catch {
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
