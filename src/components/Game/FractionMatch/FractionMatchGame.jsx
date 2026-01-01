import React, { useState, useEffect } from 'react';
import './FractionMatchGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const FractionMatchGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('fraction-match');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.fractionMatch.', '').replace('game.placeValue.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    // Fraction State: [ {n, d}, {n, d} ]
    const [fractions, setFractions] = useState([{ n: 1, d: 2 }, { n: 1, d: 4 }]);
    const [operator, setOperator] = useState('+'); // '+' or '-'
    const [result, setResult] = useState(null); // {n, d} or null if not solved yet

    const [selectedFractionIndex, setSelectedFractionIndex] = useState(null); // 0, 1, or 'result'
    const [actionType, setActionType] = useState(null); // 'multiply', 'divide'

    const [feedback, setFeedback] = useState(null);
    const [gameState, setGameState] = useState('playing');

    const currentLevel = isTestMode ? testLevel : progress.level;

    // Helper: Random Int [min, max]
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    // Helper: GCD
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const startLevel = () => {
        let f1, f2, op = '+';
        const level = currentLevel;

        // 50-Level Progression
        // ... (reuse logic)
        if (level <= 10) {
            // Simple Multiples (e.g., 1/2 + 1/4)
            const base = randomInt(2, 5);
            const mult = randomInt(2, 3);
            f1 = { n: 1, d: base };
            f2 = { n: randomInt(1, base * mult - 1), d: base * mult };
        } else if (level <= 20) {
            // Common Factors (e.g., 1/6 + 1/4 -> 12)
            f1 = { n: 1, d: 4 };
            f2 = { n: 1, d: 6 };
            if (Math.random() > 0.5) { f1.d = 6; f2.d = 9; }
        } else if (level <= 30) {
            // Primes (e.g., 1/3 + 1/5 -> 15)
            f1 = { n: randomInt(1, 2), d: 3 };
            f2 = { n: randomInt(1, 4), d: 5 };
        } else {
            // Harder
            f1 = { n: randomInt(1, 5), d: randomInt(3, 8) };
            f2 = { n: randomInt(1, 5), d: randomInt(3, 8) };
        }

        // Randomize operator for higher levels
        if (level > 30 && Math.random() > 0.5) op = '-';

        // Ensure result isn't negative for subtraction
        if (op === '-') {
            if (f1.n / f1.d < f2.n / f2.d) {
                [f1, f2] = [f2, f1]; // Swap
            }
        }

        setFractions([f1, f2]);
        setOperator(op);
        setResult(null);
        setSelectedFractionIndex(null);
        setActionType(null);
        setFeedback(null);
        setGameState('playing');
    };

    const handleFractionClick = (index) => {
        if (gameState !== 'playing') return;

        // If result exists, we can only click result (index 'result')
        if (result && index !== 'result') return;
        // If result doesn't exist, we can only click 0 or 1
        if (!result && index === 'result') return;

        if (selectedFractionIndex === index) {
            // Deselect
            setSelectedFractionIndex(null);
            setActionType(null);
        } else {
            setSelectedFractionIndex(index);
            setActionType(null); // Reset action when switching selection
        }
    };

    const handleActionSelect = (type) => {
        setActionType(type);
    };

    const applyFactor = (factor) => {
        if (selectedFractionIndex === null || !actionType) return;

        let target;
        if (selectedFractionIndex === 'result') {
            target = { ...result };
        } else {
            target = { ...fractions[selectedFractionIndex] };
        }

        if (actionType === 'multiply') {
            target.n *= factor;
            target.d *= factor;
            updateFraction(target);
        } else if (actionType === 'divide') {
            // Validation: Must result in integers
            if (target.n % factor !== 0 || target.d % factor !== 0) {
                const decimalN = target.n / factor;
                const decimalD = target.d / factor;
                setFeedback({ type: 'error', msg: t('noDecimals') });
                setTimeout(() => {
                    setFeedback(null);
                    // Strict mode penalty for invalid division?
                    // if (isTestMode) onTestComplete(false);
                }, 3000);
                return;
            }
            target.n /= factor;
            target.d /= factor;
            updateFraction(target);
        }
    };

    const updateFraction = (newFraction) => {
        if (selectedFractionIndex === 'result') {
            setResult(newFraction);
            checkWin(newFraction);
        } else {
            const newFractions = [...fractions];
            newFractions[selectedFractionIndex] = newFraction;
            setFractions(newFractions);
            setSelectedFractionIndex(null);
            setActionType(null);
        }
    };

    const handleSolve = () => {
        const [f1, f2] = fractions;

        // Validation: Denominators must match
        if (f1.d !== f2.d) {
            setFeedback({ type: 'error', msg: t('matchDenom') });
            setTimeout(() => {
                setFeedback(null);
                if (isTestMode && onTestComplete) {
                    // Fail if trying to solve without matching denoms
                    onTestComplete(false);
                }
            }, 2000);
            return;
        }

        // Calculate Result
        let resN;
        if (operator === '+') resN = f1.n + f2.n;
        else resN = f1.n - f2.n;

        const res = { n: resN, d: f1.d };
        setResult(res);

        // Check if already simplified (Win condition)
        checkWin(res);
    };

    const checkWin = (res) => {
        // Check if simplified
        const common = gcd(res.n, res.d);
        if (common === 1) {
            // Win!
            setFeedback({ type: 'success', msg: `${t('correctResult')} ${res.n}/${res.d}` });
            setGameState('won');
            setTimeout(() => {
                if (isTestMode && onTestComplete) {
                    onTestComplete(true);
                    return;
                }

                if (currentLevel < 50) {
                    completeLevel(currentLevel + 1, 20);
                } else {
                    winGame(20);
                }
            }, 3000);
        } else {
            setFeedback({ type: 'info', msg: t('simplify') });
            setTimeout(() => setFeedback(null), 2000);
        }
    };

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span>{t('level')}: {progress.level}</span>
                    <span>{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="fraction-match-game-area">
                <div className="equation-display">
                    {/* Fraction 1 */}
                    <div
                        className={`fraction ${selectedFractionIndex === 0 ? 'selected' : ''}`}
                        onClick={() => handleFractionClick(0)}
                    >
                        <span className="fraction-num">{fractions[0].n}</span>
                        <span className="fraction-den">{fractions[0].d}</span>
                    </div>

                    <span className="operator">{operator}</span>

                    {/* Fraction 2 */}
                    <div
                        className={`fraction ${selectedFractionIndex === 1 ? 'selected' : ''}`}
                        onClick={() => handleFractionClick(1)}
                    >
                        <span className="fraction-num">{fractions[1].n}</span>
                        <span className="fraction-den">{fractions[1].d}</span>
                    </div>

                    <button className="solve-btn" onClick={handleSolve}>=</button>

                    {/* Result (Hidden until solved) */}
                    {result && (
                        <div
                            className={`fraction ${selectedFractionIndex === 'result' ? 'selected' : ''} ${gameState === 'won' ? 'solved' : ''}`}
                            onClick={() => handleFractionClick('result')}
                        >
                            <span className="fraction-num">{result.n}</span>
                            <span className="fraction-den">{result.d}</span>
                        </div>
                    )}
                </div>

                {/* Action Popup */}
                {selectedFractionIndex !== null && gameState !== 'won' && (
                    <div className="action-popup">
                        <div className="action-row">
                            <button
                                className={`action-btn ${actionType === 'multiply' ? 'active' : ''}`}
                                onClick={() => handleActionSelect('multiply')}
                            >
                                {t('multiply')}
                            </button>
                            <button
                                className={`action-btn ${actionType === 'divide' ? 'active' : ''}`}
                                onClick={() => handleActionSelect('divide')}
                            >
                                {t('divide')}
                            </button>
                        </div>

                        {actionType && (
                            <div className="factor-grid">
                                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <button
                                        key={num}
                                        className="factor-btn"
                                        onClick={() => applyFactor(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {feedback && (
                    <div className={`feedback-toast ${feedback.type}`}>
                        {feedback.msg}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FractionMatchGame;
