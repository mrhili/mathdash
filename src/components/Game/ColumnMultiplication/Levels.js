export const levels = [
    // --- Phase 1: 1x1 (Basic Tables) ---
    { level: 1, top: 2, bottom: 2 },
    { level: 2, top: 3, bottom: 2 },
    { level: 3, top: 4, bottom: 2 },
    { level: 4, top: 5, bottom: 3 },
    { level: 5, top: 9, bottom: 9 }, // 81

    // --- Phase 2: 2x1 (No Carry) ---
    { level: 6, top: 12, bottom: 2 }, // 24
    { level: 7, top: 21, bottom: 3 }, // 63
    { level: 8, top: 32, bottom: 2 }, // 64
    { level: 9, top: 11, bottom: 5 }, // 55
    { level: 10, top: 22, bottom: 4 }, // 88

    // --- Phase 3: 2x1 (With Carry) ---
    { level: 11, top: 15, bottom: 2 }, // 30 (5*2=10, carry 1)
    { level: 12, top: 16, bottom: 3 }, // 48
    { level: 13, top: 25, bottom: 4 }, // 100
    { level: 14, top: 38, bottom: 2 }, // 76
    { level: 15, top: 45, bottom: 3 }, // 135

    // --- Phase 4: 2x2 (Partial Products) ---
    // e.g. 12 x 12
    //   12
    // x 12
    // ----
    //   24 (12*2)
    // +120 (12*10)
    // ----
    //  144
    { level: 16, top: 12, bottom: 12 },
    { level: 17, top: 14, bottom: 11 },
    { level: 18, top: 21, bottom: 13 },
    { level: 19, top: 15, bottom: 15 },
    { level: 20, top: 25, bottom: 25 },

    // --- Phase 5: 3x1 and 3x2 ---
    { level: 21, top: 123, bottom: 2 },
    { level: 22, top: 456, bottom: 3 },
    { level: 23, top: 123, bottom: 12 },
    { level: 24, top: 234, bottom: 21 },
    { level: 25, top: 500, bottom: 50 },

    // --- Phase 6: Mastery ---
    { level: 48, top: 99, bottom: 99 },
    { level: 49, top: 999, bottom: 9 },
    { level: 50, top: 345, bottom: 67 }
];

export const getLevel = (lvl) => {
    const safeLvl = Math.max(1, Math.min(50, lvl));
    return levels.find(l => l.level === safeLvl) || levels[0];
};
