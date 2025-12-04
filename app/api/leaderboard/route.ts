import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const timeframe = searchParams.get('timeframe') || 'alltime';
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
            .from('users')
            .select('address, points, level, streak')
            .order('points', { ascending: false })
            .limit(limit);

        // If we had a 'created_at' or 'updated_at' we could filter by timeframe,
        // but for now we'll just return all-time sorted by points as that's the main metric.
        // You can add more complex filtering if your schema supports it.

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
        }

        // Add rank to the data
        const rankedData = data?.map((user, index) => ({
            rank: index + 1,
            address: user.address,
            score: user.points || 0, // Ensure points is mapped to score
            level: user.level || 1,
            streak: user.streak || 0
        })) || [];

        return NextResponse.json(rankedData);

    } catch (error) {
        console.error('Leaderboard API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
