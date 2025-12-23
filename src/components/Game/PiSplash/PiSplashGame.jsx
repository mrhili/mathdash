import React, { useState, useEffect } from 'react';
import './PiSplashGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const PiSplashGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('pi-splash');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.piSplash.', '').replace('game.dimension.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [phase, setPhase] = useState('intro'); // 'intro', 'playing'
    const [introStep, setIntroStep] = useState(0); // 0: Start, 1: Pour 1, 2: Pour 2, 3: Pour 3, 4: Pour 0.14, 5: Done
    const [cylinder, setCylinder] = useState({ r: 0, h: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [gameState, setGameState] = useState('playing'); // playing, won, lost

    // Animation State
    const [waterHeight, setWaterHeight] = useState(0); // 0 to 100%
    const [activeBucket, setActiveBucket] = useState(null); // 0, 1, 2, 3

    useEffect(() => {
        if (phase === 'playing') {
            startLevel();
        }
    }, [phase, progress.level]);

    const runIntroAnimation = async () => {
        // Reset
        setIntroStep(0);
        setWaterHeight(0);
        setActiveBucket(null);

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        // Step 1: Pour Bucket 1
        setIntroStep(1);
        setActiveBucket(0);
        await delay(500); // Move bucket
        await delay(1000); // Pouring
        setWaterHeight(31.8); // 1/3.14 * 100 approx 31.8%
        setActiveBucket(null);
        await delay(500);

        // Step 2: Pour Bucket 2
        setIntroStep(2);
        setActiveBucket(1);
        await delay(500);
        await delay(1000);
        setWaterHeight(63.6);
        setActiveBucket(null);
        await delay(500);

        // Step 3: Pour Bucket 3
        setIntroStep(3);
        setActiveBucket(2);
        await delay(500);
        await delay(1000);
        setWaterHeight(95.4);
        setActiveBucket(null);
        await delay(500);

        // Step 4: Pour partial Bucket 4
        setIntroStep(4);
        setActiveBucket(3);
        await delay(500);
        await delay(1000);
        setWaterHeight(100);
        setActiveBucket(null);

        setIntroStep(5);
    };

    const startLevel = () => {
        // Generate random cylinder
        // r: 2-5, h: 5-10
        const r = Math.floor(Math.random() * 4) + 2;
        const h = Math.floor(Math.random() * 6) + 5;
        setCylinder({ r, h });
        setUserAnswer('');
        setGameState('playing');
    };

    const checkAnswer = () => {
        if (gameState !== 'playing') return;

        // V = pi * r^2 * h
        // Use 3.14 for pi
        const correctVolume = 3.14 * cylinder.r * cylinder.r * cylinder.h;

        // Allow small float error or require exact string match?
        // 3.14 * int * int * int will have at most 2 decimal places.
        // Let's use float comparison with small epsilon
        const userVal = parseFloat(userAnswer);

        if (Math.abs(userVal - correctVolume) < 0.01) {
            if (progress.level === 5) {
                setGameState('won');
                winGame(15); // 5 levels + 10 bonus
            } else {
                completeLevel(progress.level + 1, progress.level);
            }
        } else {
            setGameState('lost');
        }
    };

    const renderIntro = () => {
        // SVG Visualization
        // Cylinder: 100x100 box, but let's say r=40 (width 80), h=40 (height 80)
        // Buckets: 4 cubes. side=40.

        return (
            <div className="intro-animation fade-in">
                <h2>{t('intro0')}</h2>
                <div className="animation-container">
                    <svg width="300" height="300" viewBox="0 0 300 300">
                        {/* Cylinder */}
                        <defs>
                            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
                            </linearGradient>
                        </defs>

                        {/* Glass Cylinder */}
                        <g transform="translate(100, 150)">
                            {/* Back curve */}
                            <ellipse cx="50" cy="0" rx="50" ry="10" fill="none" stroke="#9ca3af" strokeWidth="2" />
                            {/* Sides */}
                            <line x1="0" y1="0" x2="0" y2="100" stroke="#9ca3af" strokeWidth="2" />
                            <line x1="100" y1="0" x2="100" y2="100" stroke="#9ca3af" strokeWidth="2" />
                            {/* Bottom curve */}
                            <path d="M 0 100 A 50 10 0 0 0 100 100" fill="none" stroke="#9ca3af" strokeWidth="2" />

                            {/* Water */}
                            <path
                                d={`M 0 ${100 - waterHeight} 
                                   L 0 100 
                                   A 50 10 0 0 0 100 100 
                                   L 100 ${100 - waterHeight} 
                                   A 50 10 0 0 1 0 ${100 - waterHeight}`}
                                fill="url(#waterGrad)"
                                style={{ transition: 'd 1s ease' }}
                            />
                        </g>

                        {/* Buckets */}
                        {[0, 1, 2, 3].map((i) => {
                            const isActive = activeBucket === i;
                            const isUsed = introStep > i + 1;
                            const xPos = 20 + i * 70;
                            const yPos = 50;

                            return (
                                <g key={i} transform={`translate(${isActive ? 130 : xPos}, ${isActive ? 80 : yPos}) rotate(${isActive ? 45 : 0})`} className="bucket-group">
                                    <rect x="0" y="0" width="40" height="40" fill={isUsed ? "#e5e7eb" : "#60a5fa"} stroke="#2563eb" strokeWidth="2" />
                                    <text x="20" y="25" textAnchor="middle" fontSize="12" fill={isUsed ? "#9ca3af" : "white"}>{i + 1}</text>

                                    {/* Water Stream when active */}
                                    {isActive && (
                                        <path d="M 40 40 Q 50 50 50 100" stroke="#60a5fa" strokeWidth="4" fill="none" className="water-stream" />
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="explanation-card">
                    {introStep === 0 && (
                        <>
                            <p dangerouslySetInnerHTML={{ __html: t('intro1') }}></p>
                            <p dangerouslySetInnerHTML={{ __html: t('intro2') }}></p>
                            <button className="btn btn-primary" onClick={runIntroAnimation}>{t('pour')}</button>
                        </>
                    )}
                    {introStep > 0 && introStep < 5 && (
                        <p>{t('pouring').replace('{n}', introStep)}</p>
                    )}
                    {introStep === 5 && (
                        <>
                            <p dangerouslySetInnerHTML={{ __html: t('intro3') }}></p>
                            <p className="formula-highlight">{t('intro4')}</p>
                            <p>{t('intro5')}</p>
                            <button className="btn btn-primary" onClick={() => setPhase('playing')}>{t('btn.start')}</button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderGame = () => {
        return (
            <div className="game-area pi-splash-area fade-in">
                <div className="instruction-text">
                    {t('instruction')}
                </div>

                <div className="cylinder-visual">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L9,3 z" fill="#374151" />
                            </marker>
                        </defs>

                        {/* Cylinder Drawing */}
                        <g transform="translate(50, 40)">
                            <ellipse cx="50" cy="0" rx="50" ry="15" fill="#e0f2fe" stroke="#374151" strokeWidth="2" />
                            <line x1="0" y1="0" x2="0" y2="120" stroke="#374151" strokeWidth="2" />
                            <line x1="100" y1="0" x2="100" y2="120" stroke="#374151" strokeWidth="2" />
                            <path d="M 0 120 A 50 15 0 0 0 100 120" fill="#e0f2fe" stroke="#374151" strokeWidth="2" />

                            {/* Labels */}
                            {/* Radius */}
                            <line x1="50" y1="0" x2="100" y2="0" stroke="#ef4444" strokeWidth="2" />
                            <text x="75" y="-10" textAnchor="middle" fill="#ef4444" fontWeight="bold">r = {cylinder.r}</text>

                            {/* Height */}
                            <line x1="110" y1="0" x2="110" y2="120" stroke="#374151" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                            <text x="125" y="60" textAnchor="start" fill="#374151" fontWeight="bold">h = {cylinder.h}</text>
                        </g>
                    </svg>
                </div>

                <div className="formula-display">
                    V = 3.14 × {cylinder.r}² × {cylinder.h}
                </div>

                <div className="input-with-unit">
                    <input
                        type="number"
                        className="area-input"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="?"
                        autoFocus
                    />
                    <span className="unit-label">cm³</span>
                </div>
                <button className="btn btn-primary" onClick={checkAnswer}>{t('btn.submit')}</button>

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('master')}</h2>
                        <p>{t('calc')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('gameOver')}</h2>
                        <p>
                            {t('correctWas').replace('{volume}', (3.14 * cylinder.r * cylinder.r * cylinder.h).toFixed(2))}
                        </p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.tryAgain')}</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/5</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            {phase === 'intro' ? renderIntro() : renderGame()}
        </div>
    );
};

export default PiSplashGame;
