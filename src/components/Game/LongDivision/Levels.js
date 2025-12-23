export const levels = [
    // --- Phase 1: Simple Division (No Remainders, 1-Digit Divisor) ---
    // Level 1-5: Basic Tables (2, 3, 4, 5)
    { level: 1, dividend: 4, divisor: 2 },   // 2
    { level: 2, dividend: 6, divisor: 2 },   // 3
    { level: 3, dividend: 8, divisor: 2 },   // 4
    { level: 4, dividend: 9, divisor: 3 },   // 3
    { level: 5, dividend: 10, divisor: 2 },  // 5

    // Level 6-10: 2-Digit Dividend, No Remainder (Simple)
    { level: 6, dividend: 12, divisor: 2 },  // 6
    { level: 7, dividend: 15, divisor: 3 },  // 5
    { level: 8, dividend: 16, divisor: 4 },  // 4
    { level: 9, dividend: 20, divisor: 5 },  // 4
    { level: 10, dividend: 24, divisor: 2 }, // 12

    // Level 11-15: 2-Digit, slightly larger
    { level: 11, dividend: 25, divisor: 5 },
    { level: 12, dividend: 36, divisor: 3 }, // 12
    { level: 13, dividend: 48, divisor: 2 }, // 24
    { level: 14, dividend: 48, divisor: 4 }, // 12
    { level: 15, dividend: 55, divisor: 5 }, // 11

    // --- Phase 2: Remainders Introduced ---
    { level: 16, dividend: 5, divisor: 2 },  // 2 R 1
    { level: 17, dividend: 7, divisor: 3 },  // 2 R 1
    { level: 18, dividend: 10, divisor: 3 }, // 3 R 1
    { level: 19, dividend: 13, divisor: 4 }, // 3 R 1
    { level: 20, dividend: 26, divisor: 5 }, // 5 R 1

    // --- Phase 3: 3-Digit Dividends (No Remainder) ---
    { level: 21, dividend: 124, divisor: 2 },
    { level: 22, dividend: 333, divisor: 3 },
    { level: 23, dividend: 448, divisor: 4 },
    { level: 24, dividend: 505, divisor: 5 },
    { level: 25, dividend: 840, divisor: 2 },

    // --- Phase 4: Long Division Mechanics (Bring Down Required) ---
    // e.g. 72 / 3. 7/3=2(6), 12/3=4. 
    { level: 26, dividend: 72, divisor: 3 },  // 24
    { level: 27, dividend: 52, divisor: 4 },  // 13
    { level: 28, dividend: 96, divisor: 4 },  // 24
    { level: 29, dividend: 85, divisor: 5 },  // 17
    { level: 30, dividend: 92, divisor: 4 },  // 23

    // --- Phase 5: 2-Digit Divisors (Multiples of 10) ---
    { level: 31, dividend: 200, divisor: 10 },
    { level: 32, dividend: 400, divisor: 20 },
    { level: 33, dividend: 600, divisor: 30 },
    { level: 34, dividend: 1000, divisor: 50 },
    { level: 35, dividend: 5006, divisor: 20 }, // User fav context

    // --- Phase 6: Decimals (Normalization) ---
    { level: 36, dividend: 4, divisor: 0.2 },   // 40/2
    { level: 37, dividend: 12, divisor: 0.5 },  // 120/5
    { level: 38, dividend: 1.2, divisor: 0.2 }, // 12/2
    { level: 39, dividend: 500.6, divisor: 2 }, // 5006/20
    { level: 40, dividend: 2.5, divisor: 0.5 }, // 25/5

    // --- Phase 7: Mastery (Complex) ---
    { level: 41, dividend: 144, divisor: 12 },
    { level: 42, dividend: 196, divisor: 14 },
    { level: 43, dividend: 625, divisor: 25 },
    { level: 44, dividend: 1024, divisor: 32 },
    { level: 45, dividend: 98, divisor: 7 },

    // --- Phase 8: Chaos ---
    { level: 46, dividend: 1234, divisor: 5 },
    { level: 47, dividend: 876, divisor: 12 },
    { level: 48, dividend: 543.2, divisor: 0.4 },
    { level: 49, dividend: 99.9, divisor: 0.9 },
    { level: 50, dividend: 5678, divisor: 9 }
];

export const getLevel = (lvl) => {
    // Ensure 1-based index safely
    const safeLvl = Math.max(1, Math.min(50, lvl));
    return levels.find(l => l.level === safeLvl) || levels[0];
};
