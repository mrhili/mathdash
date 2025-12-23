import React, { useState, useEffect } from 'react';
import './ConeZoneGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const ConeZoneGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('cone-zone');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.coneZone.', '').replace('game.dimension.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [gameState, setGameState] = useState('intro');
    const [introStep, setIntroStep] = useState(0);
    const [dimensions, setDimensions] = useState({ r: 3, h: 6 });
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [playPhase, setPlayPhase] = useState('cylinder');

    useEffect(() => {
        if (gameState === 'playing') {
            startLevel();
        }
    }, [progress.level, gameState]);

    const nextIntroStep = () => {
        if (introStep < 3) {
            setIntroStep(prev => prev + 1);
        } else {
            setGameState('playing');
        }
    };

    const startLevel = () => {
        let r = Math.floor(Math.random() * 3) + 2;
        let h = Math.floor(Math.random() * 4) + 4;
        while ((r * r * h) % 3 !== 0) {
            h = Math.floor(Math.random() * 4) + 4;
        }
        setDimensions({ r, h });
        setUserAnswer('');
        setFeedback(null);
        setPlayPhase('cylinder');
    };

    const handleSubmit = () => {
        const cylinderVol = Math.round(3.14 * dimensions.r * dimensions.r * dimensions.h * 100) / 100;
        const coneVol = Math.round(cylinderVol / 3 * 100) / 100;
        const val = parseFloat(userAnswer);

        if (playPhase === 'cylinder') {
            if (Math.abs(val - cylinderVol) < 0.5) {
                setFeedback('correct');
                setTimeout(() => {
                    setFeedback(null);
                    setPlayPhase('transition');
                    setUserAnswer('');
                }, 1500);
            } else {
                setFeedback('incorrect');
            }
        } else if (playPhase === 'cone') {
            if (Math.abs(val - coneVol) < 0.5) {
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
        // Intro Steps:
        // 0: Empty Cylinder + 3 Empty Cones
        // 1: Pour 1st Cone (1/3 full)
        // 2: Pour 2nd Cone (2/3 full)
        // 3: Pour 3rd Cone (Full)

        const IntroCone = ({ index }) => {
            const isPoured = introStep >= index;
            return (
                <svg width="60" height="80" viewBox="0 0 60 80" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id={`cone-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                    </defs>
                    <g
                        style={{
                            transform: isPoured ? 'translate(60px, 20px) rotate(120deg) scale(0.8)' : 'translate(0,0)',
                            opacity: isPoured ? 0 : 1,
                            transition: 'all 1s ease-in-out'
                        }}
                    >
                        <path d="M5,75 L30,5 L55,75 Z" fill={`url(#cone-grad-${index})`} stroke="#78350f" strokeWidth="1" />
                        <ellipse cx="30" cy="75" rx="25" ry="8" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                        {/* Water inside cone */}
                        <path d="M10,70 L30,15 L50,70 Z" fill="#3b82f6" opacity="0.8" />
                    </g>
                </svg>
            );
        };

        const fillHeight = (introStep / 3) * 100;

        return (
            <div className="intro-container">
                <h2>{t('title')}</h2>
                <div className="intro-visuals">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {[1, 2, 3].map(i => <IntroCone key={i} index={i} />)}
                    </div>
                    <div className="arrow-divider">→</div>
                    <div style={{ width: '100px', height: '140px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 140" style={{ overflow: 'visible' }}>
                            {/* Cylinder Back */}
                            <ellipse cx="50" cy="30" rx="35" ry="10" fill="none" stroke="#374151" strokeWidth="2" strokeDasharray="4 4" />

                            {/* Water Fill Animation */}
                            <defs>
                                <clipPath id="cylFill">
                                    <rect x="0" y={140 - (fillHeight * 1.1)} width="100" height={fillHeight * 1.1} style={{ transition: 'y 1s, height 1s' }} />
                                </clipPath>
                                <linearGradient id="waterGradCyl" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                            <g clipPath="url(#cylFill)">
                                <rect x="15" y="30" width="70" height="100" fill="url(#waterGradCyl)" opacity="0.8" />
                                <ellipse cx="50" cy={140 - (fillHeight * 1.1) + 10} rx="35" ry="10" fill="#93c5fd" opacity="0.9" style={{ transition: 'cy 1s' }} />
                            </g>

                            {/* Cylinder Front */}
                            <line x1="15" y1="30" x2="15" y2="130" stroke="#374151" strokeWidth="2" />
                            <line x1="85" y1="30" x2="85" y2="130" stroke="#374151" strokeWidth="2" />
                            <ellipse cx="50" cy="30" rx="35" ry="10" fill="none" stroke="#374151" strokeWidth="2" />
                            <ellipse cx="50" cy="130" rx="35" ry="10" fill="none" stroke="#374151" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
                <div className="instruction-text">
                    {introStep === 0 && t('intro0')}
                    {introStep === 1 && t('intro1')}
                    {introStep === 2 && t('intro2')}
                    {introStep === 3 && t('intro3')}
                </div>
                <button className="btn btn-primary" onClick={nextIntroStep}>
                    {introStep < 3 ? t('pourNext') : t('btn.start')}
                </button>
            </div>
        );
    };

    const renderGame = () => {
        const { r, h } = dimensions;
        const scale = 20;
        const rPx = r * scale;
        const hPx = h * scale;
        const cx = 200;
        const topY = 80;
        const botY = topY + hPx;

        const isCylinder = playPhase === 'cylinder';
        const isCone = playPhase === 'cone';

        return (
            <div className="volume-game-area">
                <div className="hud">
                    <span>{t('level')}: {progress.level}/5</span>
                    <span>{t('score')}: {progress.score}</span>
                </div>

                <div className="instruction-text">
                    {isCylinder && t('step1')}
                    {playPhase === 'transition' && t('remember')}
                    {isCone && t('step2')}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <svg width="400" height="350" className="game-svg" style={{ overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="cylBody" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
                                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.0)" />
                                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                            </linearGradient>
                        </defs>

                        {/* Cylinder Body */}
                        <g opacity={isCone ? 0.2 : 1} transition="opacity 0.5s">
                            <ellipse cx={cx} cy={topY} rx={rPx} ry={rPx * 0.3} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                            <path d={`M${cx - rPx},${topY} L${cx - rPx},${botY} A${rPx},${rPx * 0.3} 0 0,0 ${cx + rPx},${botY} L${cx + rPx},${topY}`}
                                fill="url(#cylBody)" stroke="#3b82f6" strokeWidth={isCylinder ? 2 : 1} />
                            <ellipse cx={cx} cy={botY} rx={rPx} ry={rPx * 0.3} fill="none" stroke="#3b82f6" strokeWidth={isCylinder ? 2 : 1} />
                            <ellipse cx={cx} cy={topY} rx={rPx} ry={rPx * 0.3} fill="none" stroke="#3b82f6" strokeWidth={isCylinder ? 2 : 1} />
                        </g>

                        {/* Cone Body */}
                        <g opacity={isCone ? 1 : 0} transition="opacity 0.5s">
                            <ellipse cx={cx} cy={botY} rx={rPx} ry={rPx * 0.3} fill="rgba(245, 158, 11, 0.2)" stroke="none" />
                            <path d={`M${cx - rPx},${botY} L${cx},${topY} L${cx + rPx},${botY}`} fill="rgba(245, 158, 11, 0.3)" stroke="#d97706" strokeWidth="2" />
                        </g>

                        {/* Dimensions */}
                        <line x1={cx} y1={botY} x2={cx + rPx} y2={botY} stroke="#374151" strokeWidth="2" />
                        <text x={cx + rPx / 2} y={botY + 20} textAnchor="middle" fontWeight="bold" fill="#374151">r = {r}</text>

                        <line x1={cx - rPx - 20} y1={topY} x2={cx - rPx - 20} y2={botY} stroke="#374151" strokeWidth="2" />
                        <line x1={cx - rPx - 25} y1={topY} x2={cx - rPx - 15} y2={topY} stroke="#374151" strokeWidth="2" />
                        <line x1={cx - rPx - 25} y1={botY} x2={cx - rPx - 15} y2={botY} stroke="#374151" strokeWidth="2" />
                        <text x={cx - rPx - 35} y={(topY + botY) / 2} textAnchor="middle" fontWeight="bold" fill="#374151">h = {h}</text>
                    </svg>

                    {/* Dynamic Formula Card */}
                    <div className={`formula-card ${feedback === 'correct' ? 'highlight' : ''}`}>
                        <div className="formula-text">
                            {isCylinder ? "V = π × r² × h" : "V = (π × r² × h) ÷ 3"}
                        </div>
                        {feedback === 'correct' && (
                            <div className="formula-values fade-in">
                                = 3.14 × {dimensions.r}² × {dimensions.h}
                                {isCone && " ÷ 3"}
                                <br />
                                = <strong>{isCylinder ? Math.round(3.14 * dimensions.r * dimensions.r * dimensions.h * 100) / 100 : Math.round((3.14 * dimensions.r * dimensions.r * dimensions.h) / 3 * 100) / 100}</strong>
                            </div>
                        )}
                    </div>
                </div>

                {playPhase === 'transition' ? (
                    <button className="btn btn-primary" onClick={() => setPlayPhase('cone')}>{t('calcCone')}</button>
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

                {feedback === 'incorrect' && <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{t('checkMath')}</div>}
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
                    <h2>{t('champion')}</h2>
                    <p>{t('mastered')}</p>
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

export default ConeZoneGame;
