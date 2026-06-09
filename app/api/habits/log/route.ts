import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Initialize Supabase client
// For local development, these will be pulled from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_build';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { habit_id, user_id } = body;

    if (!habit_id) {
      return NextResponse.json({ error: 'Missing habit_id' }, { status: 400 });
    }

    // Default mock user ID for testing since we haven't built auth yet
    const uid = user_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('daily_habit_logs')
      .insert([
        { habit_id, user_id: uid, logged_date: new Date().toISOString().split('T')[0] }
      ]);

    if (error) {
      // Handle Unique Constraint Violation (duplicate suppression)
      if (error.code === '23505') {
        return NextResponse.json({ status: 'duplicate_suppressed' }, { status: 200 });
      }
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const habit_id = url.searchParams.get('habit_id');
    const user_id = url.searchParams.get('user_id');

    if (!habit_id) {
      return NextResponse.json({ error: 'Missing habit_id' }, { status: 400 });
    }

    const uid = user_id || '00000000-0000-0000-0000-000000000000';
    const today = new Date().toISOString().split('T')[0];

    // NOTE: The database trigger proc_calculate_gamification_impact currently only handles inserts.
    // For a fully robust system, the trigger should handle DELETEs to subtract XP, or we do it manually.
    // For now, we will manually subtract the XP since the trigger doesn't run on DELETE.
    
    // Fetch XP reward
    const { data: habitData } = await supabase
      .from('carbon_habits_dictionary')
      .select('xp_reward')
      .eq('id', habit_id)
      .single();

    if (habitData) {
      // Decrease XP manually
      // Level calculations might go backwards if XP < 0, but for now we keep it simple.
      const { data: userData } = await supabase
        .from('users')
        .select('current_xp')
        .eq('id', uid)
        .single();
        
      if (userData) {
        let newXp = Math.max(0, userData.current_xp - habitData.xp_reward);
        await supabase
          .from('users')
          .update({ current_xp: newXp })
          .eq('id', uid);
      }
    }

    const { data, error } = await supabase
      .from('daily_habit_logs')
      .delete()
      .eq('user_id', uid)
      .eq('habit_id', habit_id)
      .eq('logged_date', today);

    if (error) {
      console.error('Supabase Error on Delete:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
