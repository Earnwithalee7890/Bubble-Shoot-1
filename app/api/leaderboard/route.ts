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
            // Return empty array instead of error - allows UI to show "No players yet"
            return NextResponse.json([]);
        }

        // If no data, return empty array
        if (!data || data.length === 0) {
            return NextResponse.json([]);
        }

        // Add rank to the data
        const rankedData = data.map((user, index) => ({
            rank: index + 1,
            address: user.address,
            score: user.points || 0, // Ensure points is mapped to score
            level: user.level || 1,
            streak: user.streak || 0
        }));

        return NextResponse.json(rankedData);

    } catch (error) {
        console.error('Leaderboard API error:', error);
        // Return empty array instead of error for graceful degradation
        return NextResponse.json([]);
    }
}

// POST endpoint to submit score and update leaderboard
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, score, level } = body;

        if (!address) {
            return NextResponse.json({ error: 'Address required' }, { status: 400 });
        }

        // Try to update/insert user score in database
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('address', address.toLowerCase())
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Fetch user error:', fetchError);
        }

        // Update or insert user
        if (existingUser) {
            // Update if new score/level is higher
            const updates: any = {};
            if (score > (existingUser.points || 0)) updates.points = score;
            if (level > (existingUser.level || 1)) updates.level = level;

            if (Object.keys(updates).length > 0) {
                await supabase
                    .from('users')
                    .update(updates)
                    .eq('address', address.toLowerCase());
            }
        } else {
            // Insert new user
            await supabase
                .from('users')
                .insert({
                    address: address.toLowerCase(),
                    points: score || 0,
                    level: level || 1,
                    streak: 0
                });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Leaderboard POST error:', error);
        return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
    }
}
