import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    // Format the date from ID (assuming YYYYMMDD)
    const year = id.substring(0, 4);
    const month = id.substring(4, 6);
    const day = id.substring(6, 8);
    const dateStr = `${year}-${month}-${day}`;

    const metadata = {
        name: `Daily Check-In: ${dateStr}`,
        description: `Proof of daily check-in for Bubble Shoot game on ${dateStr}. Streak verification token.`,
        image: "https://bubble-shoot-game.vercel.app/images/check-in-nft.png",
        attributes: [
            {
                trait_type: "Type",
                value: "Daily Check-In"
            },
            {
                trait_type: "Date",
                value: dateStr
            },
            {
                trait_type: "Year",
                value: year
            },
            {
                trait_type: "Month",
                value: month
            }
        ]
    };

    return NextResponse.json(metadata);
}
