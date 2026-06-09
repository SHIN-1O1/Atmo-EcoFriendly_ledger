import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_build';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id') || '00000000-0000-0000-0000-000000000000'; // Fallback to mock user

    // 1. Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('current_xp, current_level, current_streak')
      .eq('id', user_id)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'Failed to fetch user state' }, { status: 500 });
    }

    // 2. Fetch today's logs
    const today = new Date().toISOString().split('T')[0];
    const { data: logsData, error: logsError } = await supabase
      .from('daily_habit_logs')
      .select('habit_id')
      .eq('user_id', user_id)
      .eq('logged_date', today);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Convert logs array to a boolean map { 'plant_meal': true, ... }
    const habitsLoggedToday: Record<string, boolean> = {};
    if (logsData) {
      logsData.forEach(log => {
        habitsLoggedToday[log.habit_id] = true;
      });
    }

    return NextResponse.json({
      status: 'success',
      data: {
        currentXP: userData.current_xp,
        currentLevel: userData.current_level,
        currentStreak: userData.current_streak,
        habitsLoggedToday
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
