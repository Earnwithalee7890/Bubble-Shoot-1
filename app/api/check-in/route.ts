import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// TODO: Replace with actual owner address
const OWNER_ADDRESS = "0xYourOwnerAddressHere";

export async function POST(request: Request) {
    try {
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        try {
            // Try to use database
            // Check if user exists
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('address', address)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching user:', fetchError);
                // Database not available, return success for localStorage mode
                console.log('Database not available, using localStorage mode');
                return NextResponse.json({
                    success: true,
                    streak: 1,
                    useLocalStorage: true
                });
            }

            const now = new Date();
            const lastCheckIn = user?.last_check_in ? new Date(user.last_check_in) : null;

            // Helper to get UTC date string (YYYY-MM-DD)
            const getUTCDateString = (date: Date) => {
                return date.toISOString().split('T')[0];
            };

            const todayUTC = getUTCDateString(now);
            const lastCheckInUTC = lastCheckIn ? getUTCDateString(lastCheckIn) : null;

            // Check if already checked in today
            if (lastCheckInUTC === todayUTC) {
                return NextResponse.json({ error: 'Already checked in today', streak: user.streak }, { status: 400 });
            }

            let streak = user?.streak || 0;

            // Check if streak is broken
            if (lastCheckIn) {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayUTC = getUTCDateString(yesterday);

                // If last check-in was NOT yesterday, reset streak
                // (If it was today, we already returned above. If it was before yesterday, streak breaks.)
                if (lastCheckInUTC !== yesterdayUTC) {
                    streak = 0;
                }
            }

            streak += 1;

            // Update or insert user (no points/DEGEN rewards, just streak tracking)
            const { error: upsertError } = await supabase
                .from('users')
                .upsert({
                    address,
                    last_check_in: now.toISOString(),
                    streak,
                    updated_at: now.toISOString()
                }, { onConflict: 'address' });

            if (upsertError) {
                console.error('Error updating user:', upsertError);
                // Database error, return success for localStorage mode
                return NextResponse.json({
                    success: true,
                    streak: 1,
                    useLocalStorage: true
                });
            }

            return NextResponse.json({ success: true, streak });

        } catch (dbError: any) {
            console.error('Database operation failed:', dbError);
            // Database not available, return success for localStorage mode
            return NextResponse.json({
                success: true,
                streak: 1,
                useLocalStorage: true,
                message: 'Using local storage mode'
            });
        }

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

    // Helper to get UTC date string (YYYY-MM-DD) - same as in POST
    const getUTCDateString = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const now = new Date();
    const lastCheckIn = new Date(user.last_check_in);

    const todayUTC = getUTCDateString(now);
    const lastCheckInUTC = getUTCDateString(lastCheckIn);

    // Can check in if last check-in was NOT today
    const canCheckIn = todayUTC !== lastCheckInUTC;

    return NextResponse.json({
        canCheckIn,
        streak: user.streak,
        lastCheckIn: user.last_check_in,
        points: user.points
    });
}
