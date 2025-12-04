import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        console.log('Attempting to reset check-in for address:', address);

        // First check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('address', address)
            .single();

        console.log('Existing user:', existingUser);
        console.log('Fetch error:', fetchError);

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError);
            return NextResponse.json({ error: `Database error: ${fetchError.message}` }, { status: 500 });
        }

        if (!existingUser) {
            console.log('User not found in database, nothing to reset');
            return NextResponse.json({ success: true, message: 'No check-in data found for this address' });
        }

        // Reset the last_check_in to null for this address
        const { error: updateError } = await supabase
            .from('users')
            .update({
                last_check_in: null,
                streak: 0
            })
            .eq('address', address);

        if (updateError) {
            console.error('Error resetting check-in:', updateError);
            return NextResponse.json({ error: `Failed to reset: ${updateError.message}` }, { status: 500 });
        }

        console.log('Check-in reset successfully');
        return NextResponse.json({ success: true, message: 'Check-in reset successfully' });

    } catch (error: any) {
        console.error('Reset check-in error:', error);
        return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
    }
}
