import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Farcaster webhook endpoint
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Log the webhook event
        console.log('Farcaster webhook received:', body);

        // Handle different event types
        const { event, notificationDetails, fid } = body;

        if (event === 'frame_added') {
            // User added the mini app
            console.log('Mini app was added by user FID:', fid);

            // If notification details are provided, save them
            if (notificationDetails && fid) {
                await supabase
                    .from('notification_tokens')
                    .upsert({
                        fid: fid.toString(),
                        token: notificationDetails.token,
                        url: notificationDetails.url,
                        enabled: true,
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'fid',
                    });
                console.log('Saved notification token for FID:', fid);
            }
        } else if (event === 'frame_removed') {
            // User removed the mini app
            console.log('Mini app was removed by user FID:', fid);

            // Disable notifications for this user
            if (fid) {
                await supabase
                    .from('notification_tokens')
                    .update({ enabled: false, updated_at: new Date().toISOString() })
                    .eq('fid', fid.toString());
            }
        } else if (event === 'notifications_enabled') {
            // User enabled notifications
            console.log('Notifications enabled for FID:', fid);

            if (notificationDetails && fid) {
                await supabase
                    .from('notification_tokens')
                    .upsert({
                        fid: fid.toString(),
                        token: notificationDetails.token,
                        url: notificationDetails.url,
                        enabled: true,
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'fid',
                    });
            }
        } else if (event === 'notifications_disabled') {
            // User disabled notifications
            console.log('Notifications disabled for FID:', fid);

            if (fid) {
                await supabase
                    .from('notification_tokens')
                    .update({ enabled: false, updated_at: new Date().toISOString() })
                    .eq('fid', fid.toString());
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ success: true }); // Always return 200 to prevent retries
    }
}

// Also handle GET for verification
export async function GET() {
    return NextResponse.json({ status: 'Webhook endpoint active' });
}
