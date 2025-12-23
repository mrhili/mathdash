import React, { useState, useEffect } from 'react';
import './SphereForceGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const SphereForceGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('sphere-force');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.sphereForce.', '').replace('game.dimension.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [gameState, setGameState] = useState('intro');
    const [introStep, setIntroStep] = useState(0);
    const [radius, setRadius] = useState(3);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [playPhase, setPlayPhase] = useState('block'); // 'block', 'transition', 'sphere'

    useEffect(() => {
        if (gameState === 'playing') {
            startLevel();
        }
    }, [progress.level, gameState]);

    const nextIntroStep = () => {
        if (introStep < 6) {
            setIntroStep(prev => prev + 1);
        } else {
            setGameState('playing');
        }
    };

    const startLevel = () => {
        const r = Math.floor(Math.random() * 4) + 2; // 2-5
        setRadius(r);
        setUserAnswer('');
        setFeedback(null);
        setPlayPhase('block');
    };

    const handleSubmit = () => {
        const blockVol = radius * radius * radius;
        // Logic: Block * 4/3 * 3.14
        const sphereVol = Math.round(blockVol * (4 / 3) * 3.14 * 100) / 100;
        const val = parseFloat(userAnswer);

        if (playPhase === 'block') {
            if (val === blockVol) {
                setFeedback('correct');
                setTimeout(() => {
                    setFeedback(null);
                    setPlayPhase('transition');
                    setUserAnswer('');
                }, 1500);
            } else {
                setFeedback('incorrect');
            }
        } else if (playPhase === 'sphere') {
            if (Math.abs(val - sphereVol) < 2) { // Allow margin
                setFeedback('correct');
                if (progress.level === 5) {
                    setGameState('won');
                    winGame(20); // 5 levels + 10 bonus
                } else {
                    completeLevel(progress.level + 1, progress.score + 10);
                }
            } else {
                setFeedback('incorrect');
                setGameState('lost');
            }
        }
    };

    const renderIntro = () => {
        // User's Exact Steps:
        // 0: Question: How to count volume of sphere?
        // 1: Idea: Easiest shape is a Block (Cube). Count 1 Block.
        // 2: Do 4 Blocks.
        // 3: Fill them with water.
        // 4: Ask Ratio? Pour 4 blocks into sphere.
        // 5: Conclusion: Sphere is approx 4 blocks (4.19).
        // 6: Final Rule: Block * 4/3 * 3.14

        const stepClass =
            introStep === 1 ? 'single-block-highlight' :
                introStep === 3 ? 'filling' :
                    introStep >= 4 ? 'pouring' : '';

        const IntroCube = ({ className }) => (
            <div className={`intro-cube-group ${className}`}>
                <svg width="64" height="64" viewBox="0 0 64 64" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="cubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#db2777" />
                        </linearGradient>
                    </defs>
                    <rect x="10" y="10" width="44" height="44" fill="url(#cubeGrad)" stroke="#be185d" strokeWidth="2" />
                    <path d="M10,10 L20,0 L64,0 L54,10 Z" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" />
                    <path d="M54,10 L64,0 L64,44 L54,54 Z" fill="#9d174d" opacity="0.5" />
                    {/* Water inside cube */}
                    <rect x="12" y="12" width="40" height="40" className="water-fill" />
                </svg>
            </div>
        );

        return (
            <div className="intro-container">
                <h2>{t('title')}</h2>

                <div className={`sphere-intro-group ${stepClass}`}>
                    {/* 4 Blocks */}
                    <div style={{ opacity: introStep >= 2 ? 1 : 0, transition: 'opacity 0.5s' }}>
                        <IntroCube className="cube-pack-0" />
                        <IntroCube className="cube-pack-1" />
                        <IntroCube className="cube-pack-2" />
                        <IntroCube className="cube-pack-3" />
                    </div>

                    {/* Single Block for Step 1 */}
                    {introStep === 1 && (
                        <div style={{ position: 'absolute', transform: 'scale(1.5)', zIndex: 10 }}>
                            <IntroCube className="" />
                        </div>
                    )}

                    {/* Sphere Container */}
                    <div className="intro-sphere" style={{ opacity: introStep >= 4 ? 1 : (introStep === 0 ? 1 : 0.3) }}>
                        <svg width="180" height="180" viewBox="0 0 180 180">
                            <defs>
                                <radialGradient id="sphereGlass" cx="30%" cy="30%" r="70%">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                                    <stop offset="100%" stopColor="rgba(200,200,200,0.3)" />
                                </radialGradient>
                            </defs>
                            {/* Water inside sphere (clipped) */}
                            <rect x="0" y="0" width="180" height="180" className="sphere-water" />

                            {/* Glass Sphere Outline */}
                            <circle cx="90" cy="90" r="85" fill="url(#sphereGlass)" stroke="#9ca3af" strokeWidth="2" />
                            {introStep === 0 && <text x="90" y="95" textAnchor="middle" fontSize="40">?</text>}
                        </svg>
                    </div>
                </div>

                <div className="instruction-text" style={{ minHeight: '80px' }}>
                    {introStep === 0 && t('intro0')}
                    {introStep === 1 && t('intro1')}
                    {introStep === 2 && t('intro2')}
                    {introStep === 3 && t('intro3')}
                    {introStep === 4 && t('intro4')}
                    {introStep === 5 && t('intro5')}
                    {introStep === 6 && t('intro6')}
                </div>

                <button className="btn btn-primary" onClick={nextIntroStep}>
                    {introStep < 6 ? t('nextStep') : t('btn.start')}
                </button>
            </div>
        );
    };

    const renderGame = () => {
        const scale = 30;
        const rPx = radius * scale;
        const cx = 200;
        const cy = 175;

        const isBlock = playPhase === 'block';
        const isSphere = playPhase === 'sphere';

        return (
            <div className="volume-game-area">
                <div className="hud">
                    <span>{t('level')}: {progress.level}/5</span>
                    <span>{t('score')}: {progress.score}</span>
                </div>

                <div className="instruction-text">
                    {isBlock && t('step1')}
                    {playPhase === 'transition' && t('remember')}
                    {isSphere && t('step2')}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <svg width="400" height="350" className="game-svg" style={{ overflow: 'visible' }}>
                        <defs>
                            <radialGradient id="gameSphereGrad" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#1d4ed8" />
                            </radialGradient>
                            <linearGradient id="gameBlockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f472b6" />
                                <stop offset="100%" stopColor="#db2777" />
                            </linearGradient>
                        </defs>

                        {/* Block (Cube) */}
                        <g opacity={isSphere ? 0.2 : 1} transition="opacity 0.5s">
                            <rect x={cx - rPx / 2} y={cy - rPx / 2} width={rPx} height={rPx} fill="url(#gameBlockGrad)" stroke="#be185d" strokeWidth="2" />
                            <path d={`M${cx - rPx / 2},${cy - rPx / 2} L${cx},${cy - rPx} L${cx + rPx},${cy - rPx} L${cx + rPx / 2},${cy - rPx / 2} Z`} fill="#fbcfe8" stroke="#be185d" strokeWidth="2" />
                            <path d={`M${cx + rPx / 2},${cy - rPx / 2} L${cx + rPx},${cy - rPx} L${cx + rPx},${cy} L${cx + rPx / 2},${cy + rPx / 2} Z`} fill="#9d174d" opacity="0.5" />
                        </g>

                        {/* Sphere */}
                        <g opacity={isSphere ? 1 : 0} transition="opacity 0.5s">
                            <circle cx={cx} cy={cy} r={rPx} fill="url(#gameSphereGrad)" />
                        </g>

                        {/* Radius Label */}
                        <line x1={cx} y1={cy} x2={cx + rPx} y2={cy} stroke="#1f2937" strokeWidth="2" strokeDasharray={isSphere ? "4 4" : ""} />
                        <text x={cx + rPx / 2} y={cy - 10} textAnchor="middle" fontWeight="bold" fill="#1f2937">r = {radius}</text>
                    </svg>

                    {/* Dynamic Formula Card */}
                    <div className={`formula-card ${feedback === 'correct' ? 'highlight' : ''}`}>
                        <div className="formula-text">
                            {isBlock ? "V = r³" : "V = 4/3 × π × r³"}
                        </div>
                        {feedback === 'correct' && (
                            <div className="formula-values fade-in">
                                = {radius}³
                                {isSphere && " × 4/3 × 3.14"}
                                <br />
                                = <strong>{isBlock ? Math.pow(radius, 3) : Math.round(Math.pow(radius, 3) * (4 / 3) * 3.14 * 100) / 100}</strong>
                            </div>
                        )}
                    </div>
                </div>

                {playPhase === 'transition' ? (
                    <button className="btn btn-primary" onClick={() => setPlayPhase('sphere')}>{t('calcSphere')}</button>
                ) : (
                    <div className="input-group">
                        <input
                            type="number"
                            className="area-input"
                            value={userAnswer}
                            onChange={e => setUserAnswer(e.target.value)}
                            autoFocus
                            placeholder="?"
                        />
                        <button className="btn btn-primary" onClick={handleSubmit}>{t('btn.submit')}</button>
                    </div>
                )}

                {feedback === 'incorrect' && <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{t('game.coneZone.checkMath')}</div>}
            </div>
        );
    };

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <h1>{t('title')}</h1>
            </div>
            {gameState === 'intro' && renderIntro()}
            {gameState === 'playing' && renderGame()}
            {gameState === 'won' && (
                <div className="result-card success">
                    <h2>{t('master')}</h2>
                    <p>{t('roll')}</p>
                    <button className="btn btn-primary" onClick={() => { setGameState('intro'); setIntroStep(0); completeLevel(1, 0); }}>{t('btn.play')}</button>
                </div>
            )}
            {gameState === 'lost' && (
                <div className="result-card error">
                    <h2>{t('game.dimension.gameOver')}</h2>
                    <button className="btn btn-primary" onClick={() => { setGameState('intro'); setIntroStep(0); completeLevel(1, 0); }}>{t('btn.tryAgain')}</button>
                </div>
            )}
        </div>
    );
};

export default SphereForceGame;
