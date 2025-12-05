import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Send daily notification to all registered users
// This can be triggered by a cron job or manually
export async function POST(request: Request) {
    try {
        // Verify authorization (you can add a secret key check here)
        const authHeader = request.headers.get('authorization');
        const expectedKey = process.env.CRON_SECRET || 'your-secret-key';

        if (authHeader !== `Bearer ${expectedKey}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all users with notifications enabled
        const { data: tokens, error } = await supabase
            .from('notification_tokens')
            .select('*')
            .eq('enabled', true);

        if (error) {
            console.error('Error fetching tokens:', error);
            return NextResponse.json(
                { error: 'Failed to fetch notification tokens' },
                { status: 500 }
            );
        }

        if (!tokens || tokens.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No users to notify',
                sent: 0
            });
        }

        // Send notification to each user
        const results = await Promise.allSettled(
            tokens.map(async (tokenData) => {
                try {
                    const response = await fetch(tokenData.url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            notificationId: `daily-reminder-${Date.now()}`,
                            title: '🎮 Time to Play Bubble Shot!',
                            body: 'Your daily bubbles are waiting! Pop them for rewards! 💎',
                            targetUrl: 'https://bubble-shoot-1.vercel.app',
                            tokens: [tokenData.token],
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to send to FID ${tokenData.fid}`);
                    }

                    return { fid: tokenData.fid, success: true };
                } catch (err) {
                    console.error(`Error sending notification to FID ${tokenData.fid}:`, err);
                    return { fid: tokenData.fid, success: false, error: err };
                }
            })
        );

        const successful = results.filter(
            (r) => r.status === 'fulfilled' && (r.value as any).success
        ).length;

        return NextResponse.json({
            success: true,
            message: `Sent ${successful}/${tokens.length} notifications`,
            sent: successful,
            total: tokens.length,
        });
    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint to check status
export async function GET() {
    try {
        const { count, error } = await supabase
            .from('notification_tokens')
            .select('*', { count: 'exact', head: true })
            .eq('enabled', true);

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
        }

        return NextResponse.json({
            status: 'active',
            registeredUsers: count || 0,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
