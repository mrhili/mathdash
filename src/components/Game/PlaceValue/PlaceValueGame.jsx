import React, { useState, useEffect } from 'react';
import './PlaceValueGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const PlaceValueGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('place-value');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.placeValue.', '').replace('game.powerRebuilder.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const currentLevel = isTestMode ? testLevel : progress.level;

    const [targetNumber, setTargetNumber] = useState(null);
    const [digits, setDigits] = useState([]);
    const [selectedDigitIndex, setSelectedDigitIndex] = useState(null);
    const [completedIndices, setCompletedIndices] = useState([]); // Indices of correctly identified digits
    const [gameState, setGameState] = useState('playing'); // playing, won
    const [feedback, setFeedback] = useState(null);

    // Helper: Random Int [min, max]
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    // Helper: Random Float
    const randomFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const startLevel = () => {
        let num;
        const level = currentLevel;

        // 50-Level Progression
        // ... (reuse existing logic or refactor out if complex. For now keeping inline as it wasn't too long)
        if (level <= 5) {
            num = randomInt(0, 9);
        } else if (level <= 10) {
            num = randomInt(10, 99);
        } else if (level <= 15) {
            num = randomFloat(0.1, 0.9, 1);
        } else if (level <= 20) {
            num = randomFloat(1.1, 9.9, 1);
        } else if (level <= 30) {
            num = randomInt(100, 999);
        } else if (level <= 40) {
            num = randomFloat(0.01, 9.99, 2);
        } else if (level <= 45) {
            num = randomFloat(0.001, 0.999, 3);
        } else {
            if (Math.random() > 0.5) {
                num = randomFloat(100.01, 999.99, 2);
            } else {
                num = randomFloat(0.0001, 0.0099, 4);
            }
        }

        setTargetNumber(num);

        // Parse digits and their powers
        const str = num.toString();
        const pointIndex = str.indexOf('.');
        const newDigits = [];

        for (let i = 0; i < str.length; i++) {
            if (str[i] === '.') continue;

            let power;
            if (pointIndex === -1) {
                power = str.length - 1 - i;
            } else {
                if (i < pointIndex) {
                    power = pointIndex - 1 - i;
                } else {
                    power = pointIndex - i;
                }
            }

            newDigits.push({
                val: str[i],
                power: power,
                originalIndex: i
            });
        }

        setDigits(newDigits);
        setCompletedIndices([]);
        setSelectedDigitIndex(null);
        setFeedback(null);
        setGameState('playing');
    };

    const handleDigitClick = (index) => {
        if (completedIndices.includes(index)) return;
        setSelectedDigitIndex(index);
        setFeedback(null);
    };

    const handlePowerSelect = (power) => {
        if (selectedDigitIndex === null) return;

        const currentDigit = digits[selectedDigitIndex];
        if (currentDigit.power === power) {
            // Correct
            const newCompleted = [...completedIndices, selectedDigitIndex];
            setCompletedIndices(newCompleted);
            setSelectedDigitIndex(null);

            // Check Win
            if (newCompleted.length === digits.length) {
                setFeedback('correct');
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
                }, 1000);
            }
        } else {
            // Incorrect
            setFeedback('incorrect');
            setTimeout(() => {
                setFeedback(null);
                // Similar to other games, if strict test mode, fail on first wrong guess or let them retry?
                // Place value involves multiple clicks, maybe allow retries but track mistakes?
                // For simplicity now, let them retry in component but if we wanted strict:
                // if (isTestMode) onTestComplete(false);
            }, 1000);
        }
    };

    // ... (rest of methods: getPowerOptions, renderFormula)
    const getPowerOptions = () => {
        const powers = digits.map(d => d.power);
        const minP = Math.min(...powers);
        const maxP = Math.max(...powers);
        const options = new Set();
        for (let p = minP - 1; p <= maxP + 1; p++) {
            options.add(p);
        }
        return Array.from(options).sort((a, b) => b - a);
    };

    const renderFormula = () => {
        return (
            <div className="formula-display">
                {digits.map((d, i) => {
                    if (!completedIndices.includes(i)) return null;
                    return (
                        <span key={i} className="formula-part new">
                            {d.val} × 10<sup>{d.power}</sup>
                            {i < digits.length - 1 && completedIndices.includes(i + 1) ? ' + ' : ''}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span>{t('level')}: {currentLevel}</span>
                    <span>{t('score')}: {isTestMode ? 'TEST' : progress.score}</span>
                </div>
            </div>

            <div className="place-value-game-area">
                <h2>{t('instruction')}</h2>

                <div className="number-display">
                    {targetNumber && targetNumber.toString().split('').map((char, i) => {
                        if (char === '.') return <span key={i} className="decimal-point">.</span>;
                        let digitIndex = i;
                        if (targetNumber.toString().includes('.') && i > targetNumber.toString().indexOf('.')) {
                            digitIndex = i - 1;
                        }

                        const isCompleted = completedIndices.includes(digitIndex);
                        const isSelected = selectedDigitIndex === digitIndex;

                        return (
                            <div
                                key={i}
                                className={`digit-box ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleDigitClick(digitIndex)}
                            >
                                {char}
                            </div>
                        );
                    })}
                </div>

                {renderFormula()}

                {selectedDigitIndex !== null && (
                    <div className="power-selector">
                        {getPowerOptions().map(p => (
                            <button key={p} className="power-btn" onClick={() => handlePowerSelect(p)}>
                                10<sup>{p}</sup>
                            </button>
                        ))}
                    </div>
                )}

                {feedback === 'incorrect' && <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' }}>{t('notQuite')}</div>}

                {gameState === 'won' && (
                    <div className="result-card success">
                        <h2>{t('won')}</h2>
                        <p>{t('finalScore')}: {progress.score}</p>
                        {!isTestMode && <button className="btn btn-primary" onClick={() => { completeLevel(1, 0); setGameState('playing'); }}>{t('btn.play')}</button>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaceValueGame;
