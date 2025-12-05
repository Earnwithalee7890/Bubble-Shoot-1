import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Register a user's notification token
export async function POST(request: Request) {
    try {
        const { fid, token, url } = await request.json();

        if (!fid || !token || !url) {
            return NextResponse.json(
                { error: 'Missing required fields: fid, token, url' },
                { status: 400 }
            );
        }

        // Upsert the notification token (update if exists, insert if not)
        const { error } = await supabase
            .from('notification_tokens')
            .upsert({
                fid: fid.toString(),
                token,
                url,
                enabled: true,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'fid',
            });

        if (error) {
            console.error('Error saving notification token:', error);
            return NextResponse.json(
                { error: 'Failed to save notification token' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notification register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
