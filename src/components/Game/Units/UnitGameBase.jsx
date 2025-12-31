import React, { useState, useEffect } from 'react';
import './UnitGameBase.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const UnitGameBase = ({ config, onBack, isTestMode, testLevel, onTestComplete }) => {
    const { id, title, units, intro, color, steps } = config;
    const { progress, completeLevel, winGame } = useGameState(id);
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const [gameState, setGameState] = useState('intro'); // intro, playing, won, lost
    const [introStep, setIntroStep] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);

    const currentLevel = isTestMode ? testLevel : progress.level;

    useEffect(() => {
        if (isTestMode) {
            setGameState('playing');
            generateLevel();
        } else if (gameState === 'playing') {
            generateLevel();
        }
    }, [currentLevel, gameState, isTestMode]);

    const generateLevel = () => {
        // Difficulty Scaling
        // 1-10: Neighbors (x10 or /10)
        // 11-20: 2-3 Steps (x100, x1000)
        // 21-30: Decimals (1.5 km -> m)
        // 31-40: Reverse (m -> km)
        // 41-50: Complex

        const level = currentLevel;
        let fromUnit, toUnit, value;

        // Helper to get random unit index
        const randIdx = (max) => Math.floor(Math.random() * max);

        // Filter units that are "main" vs "secondary" if needed, but for now use all
        const availableUnits = units;

        if (level <= 10) {
            // Neighbors
            const startIdx = randIdx(availableUnits.length - 1);
            fromUnit = availableUnits[startIdx];
            toUnit = availableUnits[startIdx + 1];
            // Randomly swap direction
            if (Math.random() > 0.5) [fromUnit, toUnit] = [toUnit, fromUnit];

            value = Math.floor(Math.random() * 10) + 1; // Simple integer
        } else if (level <= 20) {
            // 2-3 Steps
            const startIdx = randIdx(availableUnits.length - 2);
            const jump = Math.floor(Math.random() * 2) + 1; // 1 or 2 steps
            fromUnit = availableUnits[startIdx];
            toUnit = availableUnits[Math.min(startIdx + jump, availableUnits.length - 1)];
            if (Math.random() > 0.5) [fromUnit, toUnit] = [toUnit, fromUnit];

            value = Math.floor(Math.random() * 20) + 1;
        } else if (level <= 30) {
            // Decimals
            const startIdx = randIdx(availableUnits.length - 2);
            fromUnit = availableUnits[startIdx];
            toUnit = availableUnits[startIdx + 1]; // Neighbor
            value = (Math.random() * 10).toFixed(1); // 1.5
        } else {
            // Any to Any
            const idx1 = randIdx(availableUnits.length);
            let idx2 = randIdx(availableUnits.length);
            while (idx1 === idx2) idx2 = randIdx(availableUnits.length);

            fromUnit = availableUnits[idx1];
            toUnit = availableUnits[idx2];
            value = Math.floor(Math.random() * 100) / 10; // 0.1 to 10.0
        }

        setCurrentQuestion({ from: fromUnit, to: toUnit, val: parseFloat(value) });
        setUserAnswer('');
        setFeedback(null);
    };

    const checkAnswer = () => {
        if (!currentQuestion) return;

        const { from, to, val } = currentQuestion;

        // Calculate correct answer
        // We need the factor difference.
        // Each unit should have a 'factor' property (e.g., m=1, km=1000).

        const correct = (val * from.factor) / to.factor;

        // Allow small float error
        const userVal = parseFloat(userAnswer);

        // Precision check: handle floating point mess
        const epsilon = 0.000001;
        if (Math.abs(userVal - correct) < epsilon) {
            setFeedback('correct');
            if (isTestMode && onTestComplete) {
                setGameState('won');
                setTimeout(() => onTestComplete(true), 1000);
                return;
            }

            setTimeout(() => {
                if (currentLevel === 50) {
                    setGameState('won');
                    winGame(50);
                } else {
                    completeLevel(currentLevel + 1, progress.score + 10);
                }
            }, 1000);
        } else {
            setFeedback('incorrect');
            setGameState('lost');
            if (isTestMode && onTestComplete) {
                setTimeout(() => onTestComplete(false), 1000);
            }
        }
    };

    const renderIntro = () => {
        const step = intro[introStep];

        const handleIntroAnswer = (e) => {
            if (e.key === 'Enter') {
                const val = parseFloat(e.target.value);
                if (Math.abs(val - step.interaction.answer) < 0.1) {
                    nextIntro();
                } else {
                    e.target.classList.add('error-shake');
                    setTimeout(() => e.target.classList.remove('error-shake'), 500);
                }
            }
        };

        const nextIntro = () => {
            if (introStep < intro.length - 1) setIntroStep(prev => prev + 1);
            else setGameState('playing');
        };

        return (
            <div className="unit-game-container intro-mode">
                <h2 style={{ color: color }}>{title}</h2>
                <div className="intro-slide">
                    <div className="step-instruction" style={{ fontSize: '1.2rem', minHeight: '80px' }}>
                        {step.text}
                    </div>
                    {step.visual && <div className="intro-visual">{step.visual}</div>}

                    {step.interaction ? (
                        <div className="intro-interaction">
                            <input
                                type="number"
                                className="unit-input"
                                placeholder="?"
                                onKeyDown={handleIntroAnswer}
                                autoFocus
                            />
                            <p className="hint-text" style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '10px' }}>
                                {t('pressEnter')}
                            </p>
                        </div>
                    ) : (
                        <button className="btn btn-primary" onClick={nextIntro} style={{ backgroundColor: color }}>
                            {introStep < intro.length - 1 ? t('next') : t('startChallenge')}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderLadder = () => {
        return (
            <div className="unit-ladder">
                {units.map((u, i) => {
                    const isFrom = currentQuestion?.from.symbol === u.symbol;
                    const isTo = currentQuestion?.to.symbol === u.symbol;
                    let classes = "ladder-step";
                    if (isFrom || isTo) classes += " active";

                    return (
                        <div key={u.symbol} className={classes}>
                            <span className="unit-name">{u.name}</span>
                            <span className="unit-symbol">{u.symbol}</span>
                            {u.subtitle && <span className="unit-subtitle" style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>{u.subtitle}</span>}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (gameState === 'intro') {
        return (
            <div className="game-container fade-in">
                <div className="game-header">
                    <button onClick={onBack} className="btn-icon">←</button>
                    <h1>{title}</h1>
                </div>
                {renderIntro()}
            </div>
        );
    }

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/50</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="unit-game-container">
                {renderLadder()}

                <div className="game-question">
                    {t('convert')} <strong>{currentQuestion?.val} {currentQuestion?.from.symbol}</strong> {t('to')} <strong>{currentQuestion?.to.symbol}</strong>
                </div>

                <div className="input-group">
                    <input
                        type="number"
                        className="unit-input"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="?"
                        autoFocus
                    />
                    <span className="unit-label">{currentQuestion?.to.symbol}</span>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ marginTop: '20px', backgroundColor: color }}
                    onClick={checkAnswer}
                >
                    {t('btnConvert')}
                </button>

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('masterOf').replace('{title}', title)}</h2>
                        <p>{t('conquered')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('playAgain')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('incorrect')}</h2>
                        <p>
                            {currentQuestion?.val} {currentQuestion?.from.symbol} =
                            <strong> {(currentQuestion?.val * currentQuestion?.from.factor / currentQuestion?.to.factor)} {currentQuestion?.to.symbol}</strong>
                        </p>
                        <button className="btn btn-primary" onClick={() => { setGameState('intro'); setIntroStep(0); completeLevel(1, 0); }}>{t('tryAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnitGameBase;
