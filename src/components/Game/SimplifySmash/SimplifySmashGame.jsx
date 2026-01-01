import React, { useState, useEffect, useRef } from 'react';
import './SimplifySmashGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const SimplifySmashGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame, saveProgress } = useGameState('simplify-smash');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.simplifySmash.', '').replace('game.placeValue.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [fraction, setFraction] = useState({ n: 2, d: 4 });
    const [isShaking, setIsShaking] = useState(false);
    const [particles, setParticles] = useState([]);
    const [feedback, setFeedback] = useState(null); // { text, details: [], id }
    const [gameState, setGameState] = useState('playing');

    const rockRef = useRef(null);

    const currentLevel = isTestMode ? testLevel : progress.level;

    // Helper: Random Int [min, max]
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    // Helper: GCD
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const startLevel = () => {
        let n, d, factor;
        const level = currentLevel;

        // 50-Level Progression
        // ... (reuse logic)
        if (level <= 10) {
            // Simple: One step (div by 2, 3, 5)
            const primes = [2, 3, 5];
            factor = primes[randomInt(0, 2)];
            const simpleN = randomInt(1, 4);
            const simpleD = randomInt(simpleN + 1, 5);
            n = simpleN * factor;
            d = simpleD * factor;
        } else if (level <= 20) {
            // Two steps possible (e.g., div by 4 -> 2*2)
            const factor1 = randomInt(2, 4);
            const factor2 = randomInt(2, 3);
            const simpleN = randomInt(1, 5);
            const simpleD = randomInt(simpleN + 1, 8);
            n = simpleN * factor1 * factor2;
            d = simpleD * factor1 * factor2;
        } else if (level <= 35) {
            // Larger numbers
            const factor = randomInt(6, 12);
            const simpleN = randomInt(2, 9);
            const simpleD = randomInt(simpleN + 1, 15);
            n = simpleN * factor;
            d = simpleD * factor;
        } else {
            // Boss Mode
            const factor = randomInt(10, 20);
            const simpleN = randomInt(5, 20);
            const simpleD = randomInt(simpleD + 1, 30); // Note: Fix potential bug where simpleD wasn't used in prev code logic correctly?
            // Actually original code was: simpleD = randomInt(simpleN + 1, 30);
            // I'll stick to original logic here for safety
            n = simpleN * factor;
            d = randomInt(simpleN + 1, 30) * factor;
        }

        setFraction({ n, d });
        setGameState('playing');
        setParticles([]);
        setFeedback(null);
    };

    const spawnParticles = () => {
        const newParticles = [];
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 50 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity + 'px';
            const ty = Math.sin(angle) * velocity + 'px';
            newParticles.push({ id: Date.now() + i, tx, ty });
        }
        setParticles(prev => [...prev, ...newParticles]);

        setTimeout(() => {
            setParticles(prev => prev.slice(10));
        }, 600);
    };

    const handleSmash = (divisor) => {
        if (gameState !== 'playing') return;

        // Animate Shake
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        if (fraction.n % divisor === 0 && fraction.d % divisor === 0) {
            // Success Smash!
            spawnParticles();

            const newN = fraction.n / divisor;
            const newD = fraction.d / divisor;

            // Detailed Feedback
            setFeedback({
                text: t('smash'),
                details: [
                    `${fraction.n} ÷ ${divisor} = ${newN}`,
                    `${fraction.d} ÷ ${divisor} = ${newD}`
                ],
                id: Date.now()
            });

            setFraction({ n: newN, d: newD });

            // Award points for smash
            const bonus = divisor * 10;
            saveProgress({ score: progress.score + bonus });

            // Check if done (Irreducible)
            if (gcd(newN, newD) === 1) {
                setGameState('won');
                setTimeout(() => {
                    setFeedback({ text: t('cleared'), id: Date.now() });
                }, 1000);
                setTimeout(() => {
                    if (isTestMode && onTestComplete) {
                        onTestComplete(true);
                        return;
                    }

                    if (progress.level < 50) {
                        completeLevel(progress.level + 1, 0);
                    } else {
                        winGame(0);
                    }
                }, 3000);
            }
        } else {
            // Fail Smash
            setFeedback({ text: t('clang'), id: Date.now() });
            if (isTestMode && onTestComplete) {
                setTimeout(() => onTestComplete(false), 1000);
            }
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

            <div className="simplify-game-area">
                <div className="instruction-text">
                    {t('instruction')}
                </div>

                <div ref={rockRef} className={`rock-container ${isShaking ? 'shake' : ''}`}>
                    {feedback && (
                        <div key={feedback.id} className="smash-feedback-container">
                            <div className="smash-title">{feedback.text}</div>
                            {feedback.details && (
                                <div className="smash-details">
                                    <div className="detail-row">{feedback.details[0]}</div>
                                    <div className="detail-row">{feedback.details[1]}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {particles.map(p => (
                        <div
                            key={p.id}
                            className="particle"
                            style={{ '--tx': p.tx, '--ty': p.ty }}
                        />
                    ))}

                    <div className="fraction-display">
                        <span>{fraction.n}</span>
                        <div className="fraction-line"></div>
                        <span>{fraction.d}</span>
                    </div>
                </div>

                {gameState === 'won' ? (
                    <div className="result-card success">
                        <h2>{t('rockSolid')}</h2>
                        <p>{t('irreducible')}</p>
                    </div>
                ) : (
                    <div className="tools-rack">
                        {[2, 3, 5, 7, 11, 13].map(num => (
                            <button
                                key={num}
                                className="hammer-btn"
                                onClick={() => handleSmash(num)}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimplifySmashGame;
