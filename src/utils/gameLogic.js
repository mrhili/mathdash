export const generateQuestion = (level) => {
    let number, operationValue, opType, answer;

    // Helper: Random Int [min, max]
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    // Helper: Random Float with specific decimal places
    const randomFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

    // --- LEVEL PROGRESSION ---

    // Levels 1-5: Basic Integers x10
    if (level <= 5) {
        operationValue = 10;
        opType = 'multiply';
        if (level === 1) number = 1; // 1 x 10
        else if (level === 2) number = randomInt(2, 5); // 2-5 x 10
        else if (level === 3) number = randomInt(6, 9); // 6-9 x 10
        else if (level === 4) number = randomInt(10, 20); // 10-20 x 10
        else number = randomInt(21, 99); // 21-99 x 10
    }
    // Levels 6-10: Basic Integers /10 (Result is Integer)
    else if (level <= 10) {
        operationValue = 10;
        opType = 'divide';
        if (level === 6) number = randomInt(1, 5) * 10; // 10, 20... 50 / 10
        else if (level === 7) number = randomInt(6, 9) * 10; // 60-90 / 10
        else if (level === 8) number = randomInt(10, 50) * 10; // 100-500 / 10
        else if (level === 9) number = randomInt(51, 99) * 10; // 510-990 / 10
        else number = randomInt(100, 999) * 10; // 1000-9990 / 10
    }
    // Levels 11-15: Decimals x10 (Shift decimal right)
    else if (level <= 15) {
        operationValue = 10;
        opType = 'multiply';
        if (level === 11) number = randomFloat(1.1, 5.9, 1); // e.g. 1.2 x 10
        else if (level === 12) number = randomFloat(6.1, 9.9, 1);
        else if (level === 13) number = randomFloat(10.1, 50.9, 1);
        else if (level === 14) number = randomFloat(0.1, 0.9, 1); // e.g. 0.5 x 10
        else number = randomFloat(0.01, 0.09, 2); // e.g. 0.05 x 10
    }
    // Levels 16-20: Integers /10 (Result is Decimal)
    else if (level <= 20) {
        operationValue = 10;
        opType = 'divide';
        if (level === 16) number = randomInt(1, 9); // 5 / 10 = 0.5
        else if (level === 17) number = randomInt(11, 99); // 45 / 10 = 4.5
        else if (level === 18) number = randomInt(101, 999); // 123 / 10 = 12.3
        else if (level === 19) number = randomFloat(1.1, 9.9, 1); // 1.5 / 10 = 0.15
        else number = randomFloat(0.1, 0.9, 1); // 0.5 / 10 = 0.05
    }
    // Levels 21-25: Powers of 100 (x100)
    else if (level <= 25) {
        operationValue = 100;
        opType = 'multiply';
        if (level === 21) number = randomInt(2, 9);
        else if (level === 22) number = randomInt(10, 99);
        else if (level === 23) number = randomFloat(1.1, 9.9, 1); // 1.5 x 100 = 150
        else if (level === 24) number = randomFloat(0.1, 0.9, 1); // 0.5 x 100 = 50
        else number = randomFloat(0.01, 0.09, 2); // 0.05 x 100 = 5
    }
    // Levels 26-30: Powers of 100 (/100)
    else if (level <= 30) {
        operationValue = 100;
        opType = 'divide';
        if (level === 26) number = randomInt(100, 900); // 500 / 100 = 5
        else if (level === 27) number = randomInt(10, 99); // 50 / 100 = 0.5
        else if (level === 28) number = randomInt(1, 9); // 5 / 100 = 0.05
        else if (level === 29) number = randomFloat(10.1, 99.9, 1); // 50.5 / 100 = 0.505
        else number = randomFloat(1.1, 9.9, 1); // 1.5 / 100 = 0.015
    }
    // Levels 31-35: Powers of 1000 (x1000 & /1000)
    else if (level <= 35) {
        operationValue = 1000;
        opType = Math.random() > 0.5 ? 'multiply' : 'divide';
        if (opType === 'multiply') {
            number = randomFloat(0.001, 10.999, 3);
        } else {
            number = randomInt(1000, 50000);
        }
    }
    // Levels 36-40: Fractional Multipliers (x0.1, x0.01) -> Equivalent to Division
    else if (level <= 40) {
        opType = 'multiply';
        operationValue = Math.random() > 0.5 ? 0.1 : 0.01;
        number = randomInt(10, 1000);
    }
    // Levels 41-45: Fractional Divisors (/0.1, /0.01) -> Equivalent to Multiplication
    else if (level <= 45) {
        opType = 'divide';
        operationValue = Math.random() > 0.5 ? 0.1 : 0.01;
        number = randomFloat(0.1, 100, 1);
    }
    // Levels 46-50: Mastery (Anything goes)
    else {
        const ops = [10, 100, 1000, 0.1, 0.01, 0.001];
        operationValue = ops[randomInt(0, 5)];
        opType = Math.random() > 0.5 ? 'multiply' : 'divide';
        number = randomFloat(0.001, 10000, 3);
    }

    // Calculate Answer
    if (opType === 'multiply') {
        answer = number * operationValue;
    } else {
        answer = number / operationValue;
    }

    // Precision handling
    answer = parseFloat(answer.toPrecision(10));

    return {
        number,
        operationType: opType,
        operationValue,
        answer
    };
};

export const checkAnswer = (userAnswer, correctAnswer) => {
    return Math.abs(parseFloat(userAnswer) - correctAnswer) < 0.0001;
};
