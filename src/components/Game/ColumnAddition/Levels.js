export const getLevel = (level) => {
    // 50 Levels of Progression
    // 1-10: 2-digit + 1-digit
    // 11-20: 2-digit + 2-digit (No carry -> Carry)
    // 21-30: 3-digit + 2-digit
    // 31-40: 3-digit + 3-digit
    // 41-50: 4-digit Challenge

    let minTop, maxTop, minBot, maxBot;

    if (level <= 10) {
        minTop = 10; maxTop = 89;
        minBot = 1; maxBot = 9;
    } else if (level <= 20) {
        minTop = 10; maxTop = 99;
        minBot = 10; maxBot = 99;
    } else if (level <= 30) {
        minTop = 100; maxTop = 999;
        minBot = 10; maxBot = 99;
    } else if (level <= 40) {
        minTop = 100; maxTop = 999;
        minBot = 100; maxBot = 999;
    } else {
        minTop = 1000; maxTop = 9999;
        minBot = 1000; maxBot = 9999;
    }

    const top = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
    const bot = Math.floor(Math.random() * (maxBot - minBot + 1)) + minBot;

    return {
        top,
        bottom: bot,
        id: level
    };
};
