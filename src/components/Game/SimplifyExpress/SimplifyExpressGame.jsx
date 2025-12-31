import React, { useState, useEffect } from 'react';
import './SimplifyExpressGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const SimplifyExpressGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('simplify-express');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.simplifyExpress.', '').replace('game.placeValue.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [fraction, setFraction] = useState({ n: 10, d: 20 });
    const [initialFraction, setInitialFraction] = useState({ n: 10, d: 20 }); // To calculate efficiency
    const [input, setInput] = useState('');
    const [steps, setSteps] = useState(0);

    const [feedback, setFeedback] = useState(null); // { type, msg, scoreBonus }
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
        let n, d;
        const level = currentLevel;

        // 50-Level Progression (Harder numbers)
        if (level <= 10) {
            // Multiples of 10, 5 (e.g., 50/100)
            const factor = randomInt(2, 10) * 5;
            const simpleN = randomInt(1, 5);
            const simpleD = randomInt(simpleN + 1, 8);
            n = simpleN * factor;
            d = simpleD * factor;
        } else if (level <= 20) {
            // Multiples of 12, 15 (e.g., 36/48)
            const factor = [12, 15, 18, 24][randomInt(0, 3)];
            const simpleN = randomInt(1, 5);
            const simpleD = randomInt(simpleN + 1, 8);
            n = simpleN * factor;
            d = simpleD * factor;
        } else if (level <= 35) {
            // Large numbers (e.g., 120/144)
            const factor = randomInt(10, 50);
            const simpleN = randomInt(2, 9);
            const simpleD = randomInt(simpleN + 1, 15);
            n = simpleN * factor;
            d = simpleD * factor;
        } else {
            // Massive numbers (e.g., 1024/2048)
            const factor = randomInt(50, 200);
            const simpleN = randomInt(5, 20);
            const simpleD = randomInt(simpleN + 1, 30);
            n = simpleN * factor;
            d = simpleD * factor;
        }

        const f = { n, d };
        setFraction(f);
        setInitialFraction(f);
        setSteps(0);
        setInput('');
        setFeedback(null);
        setGameState('playing');
    };

    const handleNumClick = (num) => {
        if (input.length < 4) {
            setInput(prev => prev + num);
        }
    };

    const handleClear = () => {
        setInput('');
    };

    const handleSubmit = () => {
        if (!input) return;
        const divisor = parseInt(input);

        if (isNaN(divisor) || divisor === 0) return;

        if (divisor === 1) {
            setFeedback({ type: 'info', msg: t('div1') });
            setTimeout(() => setFeedback(null), 1500);
            setInput('');
            return;
        }

        if (fraction.n % divisor === 0 && fraction.d % divisor === 0) {
            // Valid Division
            const newN = fraction.n / divisor;
            const newD = fraction.d / divisor;
            setFraction({ n: newN, d: newD });
            setSteps(prev => prev + 1);
            setInput('');

            // Check Win
            if (gcd(newN, newD) === 1) {
                // WON
                calculateScore(newN, newD, steps + 1); // +1 because current step counts
            } else {
                // Continue
                // Optional: Hint if they missed a big one?
            }
        } else {
            // Invalid
            setFeedback({ type: 'error', msg: t('oops') });
            setTimeout(() => {
                setFeedback(null);
                if (isTestMode && onTestComplete) {
                    onTestComplete(false);
                }
            }, 1500);
            setInput('');
        }
    };

    const calculateScore = (finalN, finalD, totalSteps) => {
        // Calculate Ideal Steps (1 step is always possible with GCD)
        // But let's be generous. 1 step = Perfect.

        let bonus = 0;
        let msg = '';

        if (totalSteps === 1) {
            bonus = 1000;
            msg = t('perfect');
        } else if (totalSteps === 2) {
            bonus = 500;
            msg = t('great');
        } else {
            bonus = 100;
            msg = t('solved');
        }

        setFeedback({ type: 'success', msg, scoreBonus: bonus });
        setGameState('won');

        setTimeout(() => {
            if (isTestMode && onTestComplete) {
                onTestComplete(true);
                return;
            }

            if (progress.level < 50) {
                completeLevel(progress.level + 1, bonus);
            } else {
                winGame(bonus);
            }
        }, 3000);
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

            <div className="express-game-area">
                <div className="instruction-text">
                    {t('instruction')}
                </div>

                <div className="express-fraction-container">
                    <div className="express-fraction">
                        <span>{fraction.n}</span>
                        <div className="express-line"></div>
                        <span>{fraction.d}</span>
                    </div>
                    <div className="step-tracker">
                        {Array.from({ length: steps }).map((_, i) => (
                            <div key={i} className="step-dot active"></div>
                        ))}
                    </div>
                </div>

                <div className="input-area">
                    <div className="divisor-input-display">
                        {input || '?'}
                    </div>

                    <div className="numpad">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button key={num} className="num-btn" onClick={() => handleNumClick(num)}>{num}</button>
                        ))}
                        <button className="num-btn action-btn" onClick={handleClear}>C</button>
                        <button className="num-btn" onClick={() => handleNumClick(0)}>0</button>
                        <button className="num-btn submit-btn" onClick={handleSubmit}>GO</button>
                    </div>
                </div>

                {feedback && (
                    <div className="express-feedback">
                        {feedback.scoreBonus && <div className="feedback-score">+{feedback.scoreBonus}</div>}
                        <div className="feedback-msg">{feedback.msg}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimplifyExpressGame;
