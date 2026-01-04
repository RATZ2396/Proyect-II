import { NextResponse } from 'next/server';
import { calculateClick, buyUpgrade, GAME_CONSTANTS } from '../../lib/gameLogic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { type } = body;

        // Handle Click
        if (!type || type === 'click') {
            const { energy, balance, upgrades } = body;

            // Basic Type Validation
            if (typeof energy !== 'number' || typeof balance !== 'number') {
                return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
            }

            const result = calculateClick({ energy, balance, upgrades });

            if (!result.success) {
                return NextResponse.json(result, { status: 400 }); // Or 200 with success: false
            }
            return NextResponse.json(result);
        }

        // Handle Upgrade
        if (type === 'buy_upgrade') {
            const { energy, balance, upgrades, upgradeId } = body;

            const result = buyUpgrade({ energy, balance, upgrades }, upgradeId);

            if (!result.success) {
                return NextResponse.json(result, { status: 400 });
            }
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
