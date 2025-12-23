import React, { useState } from 'react';
import './Calculator.css';

const Calculator = ({ onClose }) => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [isNewNumber, setIsNewNumber] = useState(true);

    const handleNumber = (num) => {
        if (isNewNumber) {
            setDisplay(num.toString());
            setIsNewNumber(false);
        } else {
            setDisplay(display === '0' ? num.toString() : display + num);
        }
    };

    const handleOperator = (op) => {
        setEquation(`${display} ${op} `);
        setIsNewNumber(true);
    };

    // Safe math expression evaluator - only allows basic arithmetic
    const safeEval = (expression) => {
        // Remove all whitespace and validate the expression
        const cleaned = expression.replace(/\s/g, '');

        // Only allow numbers, decimal points, and basic operators
        if (!/^[\d+\-*/().]+$/.test(cleaned)) {
            throw new Error('Invalid characters in expression');
        }

        // Split by operators while keeping them
        const tokens = cleaned.match(/(\d+\.?\d*|[+\-*/()])/g);
        if (!tokens) throw new Error('Invalid expression');

        // Parse and evaluate using a simple recursive descent parser
        let pos = 0;

        const parseExpression = () => {
            let left = parseTerm();

            while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
                const op = tokens[pos++];
                const right = parseTerm();
                left = op === '+' ? left + right : left - right;
            }

            return left;
        };

        const parseTerm = () => {
            let left = parseFactor();

            while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
                const op = tokens[pos++];
                const right = parseFactor();
                left = op === '*' ? left * right : left / right;
            }

            return left;
        };

        const parseFactor = () => {
            if (tokens[pos] === '(') {
                pos++; // skip opening paren
                const result = parseExpression();
                pos++; // skip closing paren
                return result;
            }

            // Handle unary minus
            if (tokens[pos] === '-') {
                pos++;
                return -parseFactor();
            }

            const num = parseFloat(tokens[pos++]);
            if (isNaN(num)) throw new Error('Invalid number');
            return num;
        };

        return parseExpression();
    };

    const handleEqual = () => {
        if (!equation) return;

        try {
            // Safe evaluation using custom parser
            const result = safeEval(equation + display);

            // Check for division by zero or other errors
            if (!isFinite(result)) {
                setDisplay('Error');
            } else {
                // Round to reasonable decimals
                const rounded = Math.round(result * 100000000) / 100000000;
                setDisplay(rounded.toString());
            }
            setEquation('');
            setIsNewNumber(true);
        } catch (e) {
            setDisplay('Error');
            setEquation('');
            setIsNewNumber(true);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
        setIsNewNumber(true);
    };

    return (
        <div className="calculator-applet fade-in">
            <div className="calculator-header">
                <span>🧮 Calculator</span>
                <button className="calculator-close" onClick={onClose}>×</button>
            </div>
            <div className="calculator-display">
                <div className="calc-equation">{equation}</div>
                <div className="calc-current">{display}</div>
            </div>
            <div className="calculator-keypad">
                <button className="calc-btn op" onClick={handleClear}>C</button>
                <button className="calc-btn op" onClick={() => handleOperator('/')}>÷</button>
                <button className="calc-btn op" onClick={() => handleOperator('*')}>×</button>
                <button className="calc-btn op red" onClick={onClose}>OFF</button>

                <button className="calc-btn" onClick={() => handleNumber(7)}>7</button>
                <button className="calc-btn" onClick={() => handleNumber(8)}>8</button>
                <button className="calc-btn" onClick={() => handleNumber(9)}>9</button>
                <button className="calc-btn op" onClick={() => handleOperator('-')}>−</button>

                <button className="calc-btn" onClick={() => handleNumber(4)}>4</button>
                <button className="calc-btn" onClick={() => handleNumber(5)}>5</button>
                <button className="calc-btn" onClick={() => handleNumber(6)}>6</button>
                <button className="calc-btn op" onClick={() => handleOperator('+')}>+</button>

                <button className="calc-btn" onClick={() => handleNumber(1)}>1</button>
                <button className="calc-btn" onClick={() => handleNumber(2)}>2</button>
                <button className="calc-btn" onClick={() => handleNumber(3)}>3</button>
                <button className="calc-btn action" onClick={handleEqual} style={{ gridRow: 'span 2' }}>=</button>

                <button className="calc-btn zero" onClick={() => handleNumber(0)}>0</button>
                <button className="calc-btn" onClick={() => handleNumber('.')}>.</button>
            </div>
        </div>
    );
};

export default Calculator;
