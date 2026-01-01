import React, { useState, useEffect } from 'react';
import './FractionSlicerGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const FractionSlicerGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('fraction-slicer');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.fractionSlicer.', '');
        return dict[localKey] || globalT(key);
    };

    const currentLevel = isTestMode ? testLevel : progress.level;

    const [targetNumerator, setTargetNumerator] = useState(1);
    const [targetDenominator, setTargetDenominator] = useState(2);

    const [currentCuts, setCurrentCuts] = useState(1); // How many pieces the circle is cut into
    const [filledSlices, setFilledSlices] = useState([]); // Indices of filled slices

    const [phase, setPhase] = useState('cut'); // 'cut' (choosing denominator) or 'fill' (choosing numerator)
    const [feedback, setFeedback] = useState(null);
    const [gameState, setGameState] = useState('playing');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper: Random Int [min, max]
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const startLevel = () => {
        let num, den;
        const level = currentLevel;

        // 50-Level Progression
        // ... (reuse logic)
        if (level <= 5) {
            // Halves, Quarters (2, 4)
            const dens = [2, 4];
            den = dens[randomInt(0, 1)];
            num = randomInt(1, den - 1);
        } else if (level <= 15) {
            // Thirds, Sixths, Eighths (3, 6, 8)
            const dens = [3, 6, 8];
            den = dens[randomInt(0, 2)];
            num = randomInt(1, den - 1);
        } else if (level <= 30) {
            // Fifths, Tenths, Twelfths (5, 10, 12)
            const dens = [5, 10, 12];
            den = dens[randomInt(0, 2)];
            num = randomInt(1, den - 1);
        } else {
            // Primes/Odd (7, 9, 11, 13)
            const dens = [7, 9, 11, 13];
            den = dens[randomInt(0, 3)];
            num = randomInt(1, den - 1);
        }

        setTargetNumerator(num);
        setTargetDenominator(den);
        setCurrentCuts(1); // Start with 1 piece (whole circle)
        setFilledSlices([]);
        setPhase('cut');
        setFeedback(null);
        setGameState('playing');
        setIsSubmitting(false);
    };

    // --- SVG LOGIC ---
    // ... (unchanged)
    const getSlicePath = (index, total) => {
        if (total === 1) {
            return "M 150 150 m -145 0 a 145 145 0 1 0 290 0 a 145 145 0 1 0 -290 0"; // Full circle
        }

        const radius = 145;
        const center = 150;
        const startAngle = (index * 360) / total;
        const endAngle = ((index + 1) * 360) / total;

        // Convert polar to cartesian
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        // SVG Path command
        // M center,center L x1,y1 A radius,radius 0 largeArc,1 x2,y2 Z
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    // --- INTERACTION ---
    const handleCutChange = (delta) => {
        if (phase !== 'cut') return;
        const newCuts = Math.max(1, Math.min(20, currentCuts + delta));
        setCurrentCuts(newCuts);
    };

    const confirmCut = () => {
        if (currentCuts === targetDenominator) {
            setPhase('fill');
            setFeedback(t('good'));
        } else {
            setFeedback(t('incorrectCuts'));
            setTimeout(() => {
                setFeedback(null);
                if (isTestMode && onTestComplete) {
                    // Strict fail in test mode? Or should we allow them to fix it?
                    // Let's allow fixing cut as it's part of the process, but maybe track it?
                    // If we want strict, we could fail here.
                    // Decision: Allow retrying cut, but checkAnswer is the final commit.
                }
            }, 1500);
        }
    };

    const handleSliceClick = (index) => {
        if (phase !== 'fill' || isSubmitting) return;

        let newFilled;
        if (filledSlices.includes(index)) {
            newFilled = filledSlices.filter(i => i !== index);
        } else {
            newFilled = [...filledSlices, index];
        }
        setFilledSlices(newFilled);
        setFeedback(null);
    };

    const checkAnswer = () => {
        if (isSubmitting) return;

        if (filledSlices.length === targetNumerator) {
            // Win!
            setIsSubmitting(true);
            const decimal = (targetNumerator / targetDenominator).toFixed(2).replace(/\.00$/, '');

            setFeedback(`${t('correct')} ${targetNumerator}/${targetDenominator} = ${decimal}`);

            // Show success state briefly before moving on
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
            }, 2500);
        } else {
            setFeedback(t('wrongSelection').replace('{count}', filledSlices.length).replace('{target}', targetNumerator));
            setTimeout(() => {
                if (isTestMode && onTestComplete) {
                    onTestComplete(false);
                }
            }, 1500);
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

            <div className="fraction-game-area">
                <div className="target-fraction">
                    <span>{targetNumerator}</span>
                    <div className="fraction-line"></div>
                    <span>{targetDenominator}</span>
                </div>

                <div className="instruction-text">
                    {feedback || (phase === 'cut' ? t('step1') : t('step2'))}
                </div>

                <div className="pizza-container">
                    <svg className="pizza-svg" viewBox="0 0 300 300">
                        {Array.from({ length: currentCuts }).map((_, i) => (
                            <path
                                key={i}
                                d={getSlicePath(i, currentCuts)}
                                className={`slice ${filledSlices.includes(i) ? 'filled' : ''}`}
                                onClick={() => handleSliceClick(i)}
                            />
                        ))}
                    </svg>
                </div>

                <div className="controls">
                    {phase === 'cut' ? (
                        <>
                            <div className="control-group">
                                <button className="control-btn" onClick={() => handleCutChange(-1)}>-</button>
                                <span className="cut-count">{currentCuts}</span>
                                <button className="control-btn" onClick={() => handleCutChange(1)}>+</button>
                            </div>
                            <button className="btn btn-primary" onClick={confirmCut}>{t('btn.submit')}</button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <button className="btn btn-primary" onClick={checkAnswer}>{t('btn.submit')}</button>
                        </div>
                    )}
                </div>

                {gameState === 'won' && (
                    <div className="result-card success">
                        <h2>{t('master')}</h2>
                        <p>{t('finalScore')}: {progress.score}</p>
                        <button className="btn btn-primary" onClick={() => { completeLevel(1, 0); setGameState('playing'); }}>{t('btn.play')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FractionSlicerGame;
