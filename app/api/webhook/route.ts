import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Farcaster webhook endpoint
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Log the webhook event (you can process it as needed)
        console.log('Farcaster webhook received:', body);

        // Handle different event types
        const { event } = body;

        if (event === 'frame_added') {
            // User added the mini app
            console.log('Mini app was added by user');
        } else if (event === 'frame_removed') {
            // User removed the mini app
            console.log('Mini app was removed by user');
        } else if (event === 'notifications_enabled') {
            // User enabled notifications
            console.log('Notifications enabled');
        } else if (event === 'notifications_disabled') {
            // User disabled notifications
            console.log('Notifications disabled');
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
