export interface LevelData {
    rows: number;
    baseCols: number;
    colors: string[];
    grid: GridCell[];
    meta: {
        level: number;
        pattern: string;
        difficulty: number;
    };
}

export interface GridCell {
    r: number;
    c: number;
    color: string | null;
    special: 'locked' | 'bomb' | 'rainbow' | 'ice' | null;
    isHole: boolean;
    isOdd: boolean;
}

const ALL_COLORS = [
    '#FFB74D', // orange
    '#64B5F6', // blue
    '#81C784', // green
    '#F06292', // pink
    '#BA68C8', // purple
    '#FFD54F', // yellow
    '#4DD0E1', // cyan
    '#A1887F', // brown
];

function seedRng(seed: number) {
    let s = Math.floor((seed >>> 0) % 4294967295) || 1;
    return function () {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        var t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

export function generateLevel(level: number): LevelData {
    const rng = seedRng(level + 12345);
    const difficulty = Math.min(1, level / 1000);

    // Rows: 5..14 (Mobile friendly)
    const baseRows = 6;
    const rows = Math.floor(baseRows + difficulty * 8 + Math.floor(rng() * 2));

    const baseCols = 8; // Fixed for our mobile grid
    const colorCount = Math.min(7, 3 + Math.floor(difficulty * 5 + rng() * 1.5));

    const patterns = ['solid-rows', 'staggered-clusters', 'chevrons', 'pyramid', 'diagonal-shift', 'holes', 'mixed'];
    const pattern = patterns[Math.floor(rng() * patterns.length)];

    const specialChance = 0.02 + difficulty * 0.12;
    const lockedProb = 0.01 + difficulty * 0.06;
    const bombProb = 0.005 + difficulty * 0.04;
    const rainbowProb = Math.max(0, difficulty - 0.65) * 0.2;

    const colors = ALL_COLORS.slice(0, Math.max(3, colorCount));
    const grid: GridCell[] = [];

    for (let r = 0; r < rows; r++) {
        const isOdd = r % 2 === 1;
        let cols = baseCols + (isOdd ? -1 : 0);

        // Apply pattern logic to modify active columns if needed
        let startC = 0;
        let endC = cols;

        if (pattern === 'pyramid') {
            const mid = Math.floor(rows / 2);
            const width = Math.max(2, baseCols - Math.abs(r - mid) * 2);
            const skip = Math.floor((cols - width) / 2);
            startC = skip;
            endC = skip + width;
        }

        for (let c = 0; c < cols; c++) {
            // Skip cells based on pattern shape
            if (c < startC || c >= endC) continue;

            let colorIndex;
            if (pattern === 'solid-rows') {
                colorIndex = (r + Math.floor(rng() * 2)) % colors.length;
            } else if (pattern === 'staggered-clusters') {
                colorIndex = (Math.floor((r + c) / 2) + Math.floor(rng() * colors.length)) % colors.length;
            } else if (pattern === 'chevrons') {
                colorIndex = Math.abs((c - Math.floor(cols / 2))) % colors.length;
            } else if (pattern === 'mixed') {
                colorIndex = Math.floor(rng() * colors.length);
            } else {
                colorIndex = (r * 3 + c) % colors.length;
                if (rng() < 0.08) colorIndex = Math.floor(rng() * colors.length);
            }

            let isHole = false;
            if (pattern === 'holes' && rng() < 0.15) isHole = true;
            if (pattern === 'mixed' && rng() < 0.05) isHole = true;

            let special: GridCell['special'] = null;
            if (!isHole && rng() < specialChance) {
                const tval = rng();
                if (tval < lockedProb) special = 'locked';
                else if (tval < lockedProb + bombProb) special = 'bomb';
                else if (tval < lockedProb + bombProb + rainbowProb) special = 'rainbow';
                else if (rng() < 0.15) special = 'ice';
            }

            if (!isHole) {
                grid.push({
                    r, c,
                    color: colors[colorIndex],
                    special,
                    isHole,
                    isOdd
                });
            }
        }
    }

    return { rows, baseCols, colors, grid, meta: { level, pattern, difficulty } };
}
