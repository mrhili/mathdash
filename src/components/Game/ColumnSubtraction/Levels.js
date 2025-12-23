export const getLevel = (level) => {
    // 50 Levels of Progression
    // 1-10: 2-digit - 1-digit (Simple -> Borrow)
    // 11-20: 2-digit - 2-digit (Simple)
    // 21-30: 2-digit - 2-digit (Borrow)
    // 31-40: 3-digit - 3-digit (Mixed)
    // 41-50: 3-digit - 3-digit (Double Borrow/Zeros)

    let minTop, maxTop, minBot, maxBot;
    let forceBorrow = false;

    if (level <= 10) {
        minTop = 15; maxTop = 29;
        minBot = 2; maxBot = 9;
        if (level > 5) forceBorrow = true;
    } else if (level <= 20) {
        minTop = 30; maxTop = 99;
        minBot = 10; maxBot = 29;
    } else if (level <= 30) {
        minTop = 40; maxTop = 99;
        minBot = 10; maxBot = 39;
        forceBorrow = true;
    } else if (level <= 40) {
        minTop = 100; maxTop = 500;
        minBot = 10; maxBot = 99;
    } else {
        minTop = 500; maxTop = 999;
        minBot = 100; maxBot = 499;
        forceBorrow = true;
    }

    let top = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
    let bot = Math.floor(Math.random() * (maxBot - minBot + 1)) + minBot;

    // Ensure Top > Bot
    if (bot >= top) bot = top - 1;

    // Force Borrow Logic logic
    if (forceBorrow) {
        // Enforce unit digit of bot > unit of top
        const tU = top % 10;
        const bU = bot % 10;
        if (tU >= bU) {
            top -= (tU + 1); // rough adj
        }
    }

    // Sanity check
    if (top < 0) top = 10;
    if (bot < 0) bot = 1;
    if (bot >= top) bot = top - 1;

    return {
        top,
        bottom: bot,
        id: level
    };
};
