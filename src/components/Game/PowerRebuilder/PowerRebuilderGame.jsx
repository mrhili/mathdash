import React, { useState, useEffect } from 'react';
import './PowerRebuilderGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const PowerRebuilderGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('power-rebuilder');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.powerRebuilder.', '').replace('game.power10.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const currentLevel = isTestMode ? testLevel : progress.level;

    const [question, setQuestion] = useState([]); // Array of terms { coeff, power }
    const [targetNumber, setTargetNumber] = useState(0);
    const [input, setInput] = useState('');

    const [feedback, setFeedback] = useState(null); // { type, msg, explanation }
    const [gameState, setGameState] = useState('playing');

    // Helper: Random Int [min, max]
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const startLevel = () => {
        let num;
        const level = currentLevel;

        // 50-Level Progression
        // ... (reuse logic)
        if (level <= 10) {
            num = randomInt(10, 99);
        } else if (level <= 20) {
            num = randomInt(100, 999);
        } else if (level <= 30) {
            num = randomInt(10, 99) / 10;
        } else if (level <= 40) {
            num = randomInt(100, 999) / 10;
        } else {
            const type = randomInt(0, 1);
            if (type === 0) num = randomInt(100, 999) / 100;
            else num = randomInt(1000, 9999) / 100;
        }

        // Decompose into powers of 10
        const terms = decompose(num);

        setTargetNumber(num);
        setQuestion(terms);
        setInput('');
        setFeedback(null);
        setGameState('playing');
    };

    const decompose = (num) => {
        const str = num.toString();
        const terms = [];

        // Handle decimals
        const parts = str.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] || '';

        // Integer part (Powers >= 0)
        for (let i = 0; i < integerPart.length; i++) {
            const digit = parseInt(integerPart[i]);
            const power = integerPart.length - 1 - i;
            if (digit !== 0) {
                terms.push({ coeff: digit, power });
            }
        }

        // Decimal part (Powers < 0)
        for (let i = 0; i < decimalPart.length; i++) {
            const digit = parseInt(decimalPart[i]);
            const power = -(i + 1);
            if (digit !== 0) {
                terms.push({ coeff: digit, power });
            }
        }

        return terms;
    };

    const handleNumClick = (char) => {
        if (input.length < 8) {
            setInput(prev => prev + char);
        }
    };

    const handleClear = () => {
        setInput('');
    };

    const handleSubmit = () => {
        if (!input) return;
        const userNum = parseFloat(input);

        if (Math.abs(userNum - targetNumber) < 0.0001) {
            // Correct
            const explanation = question.map(t => {
                const val = t.coeff * Math.pow(10, t.power);
                // Format nicely (avoid floating point weirdness)
                return parseFloat(val.toFixed(Math.abs(t.power) + 1));
            }).join(' + ') + ` = ${targetNumber}`;

            setFeedback({
                type: 'success',
                msg: t('game.power10.correct'),
                explanation
            });
            setGameState('won');

            setTimeout(() => {
                if (isTestMode && onTestComplete) {
                    onTestComplete(true);
                    return;
                }

                if (currentLevel < 50) {
                    completeLevel(currentLevel + 1, 10);
                } else {
                    winGame(10);
                }
            }, 3000);
        } else {
            // Incorrect
            setFeedback({ type: 'error', msg: t('notQuite') });
            setTimeout(() => {
                setFeedback(null);
                if (isTestMode && onTestComplete) {
                    // Strict fail for test mode for now
                    onTestComplete(false);
                    return;
                }
            }, 1500);
            if (!isTestMode) setInput('');
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

            <div className="rebuilder-game-area">
                <div className="instruction-text">
                    {t('instruction')}
                </div>

                <div className="blueprint-container">
                    <div className="blueprint-title">{t('blueprint')}</div>
                    <div className="expanded-form">
                        {question.map((term, i) => (
                            <React.Fragment key={i}>
                                <div className="power-term">
                                    {term.coeff} × 10<sup>{term.power}</sup>
                                </div>
                                {i < question.length - 1 && <span className="operator">+</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="build-area">
                    <div className="build-input-display">
                        {input || '?'}
                    </div>

                    <div className="numpad">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button key={num} className="num-btn" onClick={() => handleNumClick(num.toString())}>{num}</button>
                        ))}
                        <button className="num-btn" onClick={() => handleNumClick('.')}>.</button>
                        <button className="num-btn" onClick={() => handleNumClick('0')}>0</button>
                        <button className="num-btn action-btn" onClick={handleClear}>C</button>
                    </div>
                    <button className="btn btn-primary submit-btn" style={{ width: '100%' }} onClick={handleSubmit}>{t('buildIt')}</button>
                </div>

                {feedback && (
                    <div className="rebuilder-feedback">
                        <div className="feedback-title">{feedback.msg}</div>
                        {feedback.explanation && (
                            <div className="feedback-explanation">
                                <div>{t('youBuiltIt')}</div>
                                <div className="calc-step">{feedback.explanation}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PowerRebuilderGame;
