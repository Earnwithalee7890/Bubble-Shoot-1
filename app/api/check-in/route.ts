import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        // Check if user exists
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('address', address)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        const now = new Date();
        const lastCheckIn = user?.last_check_in ? new Date(user.last_check_in) : null;

        // Check if already checked in today
        if (lastCheckIn && lastCheckIn.toDateString() === now.toDateString()) {
            return NextResponse.json({ error: 'Already checked in today', streak: user.streak }, { status: 400 });
        }

        let streak = user?.streak || 0;

        // Check if streak is broken
        if (lastCheckIn) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);

            // If last check-in was before yesterday, reset streak
            if (lastCheckIn.toDateString() !== yesterday.toDateString()) {
                streak = 0;
            }
        }

        streak += 1;
        const points = (user?.points || 0) + 10; // Example point increment

        // Update or insert user
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                address,
                last_check_in: now.toISOString(),
                streak,
                points,
                updated_at: now.toISOString()
            }, { onConflict: 'address' });

        if (upsertError) {
            console.error('Error updating user:', upsertError);
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        return NextResponse.json({ success: true, streak, points });

    } catch (error) {
        console.error('Check-in error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('address', address)
        .single();

    if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!user) {
        return NextResponse.json({
            canCheckIn: true,
            streak: 0,
            lastCheckIn: null
        });
    }

    const now = new Date();
    const lastCheckIn = new Date(user.last_check_in);
    const canCheckIn = lastCheckIn.toDateString() !== now.toDateString();

    return NextResponse.json({
        canCheckIn,
        streak: user.streak,
        lastCheckIn: user.last_check_in,
        points: user.points
    });
}
