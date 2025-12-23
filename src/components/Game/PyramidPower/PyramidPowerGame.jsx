import React, { useState, useEffect } from 'react';
import './PyramidPowerGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const PyramidPowerGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('pyramid-power');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.pyramidPower.', '').replace('game.dimension.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [gameState, setGameState] = useState('intro');
    const [introStep, setIntroStep] = useState(0);
    const [dimensions, setDimensions] = useState({ w: 4, h: 4, d: 4 });
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [playPhase, setPlayPhase] = useState('prism'); // 'prism', 'transition', 'pyramid'

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
        let w = Math.floor(Math.random() * 4) + 3;
        let h = Math.floor(Math.random() * 4) + 3;
        let d = Math.floor(Math.random() * 4) + 3;

        while ((w * h * d) % 3 !== 0) {
            d = Math.floor(Math.random() * 4) + 3;
        }

        setDimensions({ w, h, d });
        setUserAnswer('');
        setFeedback(null);
        setPlayPhase('prism');
    };

    const handleSubmit = () => {
        const prismVol = dimensions.w * dimensions.h * dimensions.d;
        const pyramidVol = prismVol / 3;
        const val = parseFloat(userAnswer);

        if (playPhase === 'prism') {
            if (val === prismVol) {
                setFeedback('correct');
                setTimeout(() => {
                    setFeedback(null);
                    setPlayPhase('transition');
                    setUserAnswer('');
                }, 1500);
            } else {
                setFeedback('incorrect');
            }
        } else if (playPhase === 'pyramid') {
            if (val === pyramidVol) {
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
        // 0: Empty Prism + 3 Empty Pyramids
        // 1: Pour 1st Pyramid (1/3 full)
        // 2: Pour 2nd Pyramid (2/3 full)
        // 3: Pour 3rd Pyramid (Full)

        const IntroPyramid = ({ index }) => {
            const isPoured = introStep >= index;
            return (
                <svg width="80" height="90" viewBox="0 0 80 90" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id={`pyr-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                        <filter id="dropShadow">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
                        </filter>
                    </defs>
                    <g
                        filter="url(#dropShadow)"
                        style={{
                            transform: isPoured ? 'translate(80px, 20px) rotate(120deg) scale(0.8)' : 'translate(0,0)',
                            opacity: isPoured ? 0 : 1,
                            transition: 'all 1s ease-in-out'
                        }}
                    >
                        {/* Right Face (Shadowed) */}
                        <path d="M40,10 L70,80 L80,70 Z" fill="#92400e" />
                        {/* Front Face */}
                        <path d="M10,80 L40,10 L70,80 Z" fill={`url(#pyr-grad-${index})`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        {/* Water inside pyramid */}
                        <path d="M20,70 L40,25 L60,70 Z" fill="#3b82f6" opacity="0.8" />
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
                        {[1, 2, 3].map(i => <IntroPyramid key={i} index={i} />)}
                    </div>
                    <div className="arrow-divider">→</div>
                    <div style={{ width: '120px', height: '140px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 140" style={{ overflow: 'visible' }}>
                            {/* Prism Back */}
                            <path d="M20,30 L80,30 L80,110 L20,110 Z" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                            <path d="M20,30 L30,20 L90,20 L90,100 L80,110" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                            <line x1="80" y1="30" x2="90" y2="20" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />

                            {/* Water Fill Animation */}
                            <defs>
                                <clipPath id="introFill">
                                    <rect x="0" y={140 - (fillHeight * 1.2)} width="100" height={fillHeight * 1.2} style={{ transition: 'y 1s, height 1s' }} />
                                </clipPath>
                                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                            <g clipPath="url(#introFill)">
                                <path d="M20,30 L80,30 L80,110 L20,110 Z" fill="url(#waterGrad)" opacity="0.8" />
                                <path d="M80,30 L90,20 L90,100 L80,110 Z" fill="#1e40af" opacity="0.6" />
                            </g>

                            {/* Prism Front */}
                            <rect x="20" y="30" width="60" height="80" fill="none" stroke="#374151" strokeWidth="2" />
                            <path d="M80,30 L90,20 L90,100 L80,110" fill="none" stroke="#374151" strokeWidth="2" />
                            <line x1="20" y1="30" x2="30" y2="20" stroke="#374151" strokeWidth="2" />
                            <line x1="30" y1="20" x2="90" y2="20" stroke="#374151" strokeWidth="2" />
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
        const scale = 25;
        const wPx = dimensions.w * scale;
        const hPx = dimensions.h * scale;
        const dPx = dimensions.d * scale * 0.7;
        const startX = 150;
        const startY = 100;

        // Cabinet Projection Logic
        const p1 = { x: startX, y: startY };
        const p2 = { x: startX + wPx, y: startY };
        const p3 = { x: startX + wPx, y: startY + hPx };
        const p4 = { x: startX, y: startY + hPx };

        const angle = -Math.PI / 6;
        const shiftX = dPx * Math.cos(angle);
        const shiftY = dPx * Math.sin(angle);

        const p1_b = { x: p1.x + shiftX, y: p1.y + shiftY };
        const p2_b = { x: p2.x + shiftX, y: p2.y + shiftY };
        const p3_b = { x: p3.x + shiftX, y: p3.y + shiftY };
        const p4_b = { x: p4.x + shiftX, y: p4.y + shiftY };

        const apex = { x: (p1.x + p2_b.x) / 2, y: (p1.y + p2_b.y) / 2 };

        const isPrism = playPhase === 'prism';
        const isPyramid = playPhase === 'pyramid';

        return (
            <div className="volume-game-area">
                <div className="hud">
                    <span>{t('level')}: {progress.level}/5</span>
                    <span>{t('score')}: {progress.score}</span>
                </div>

                <div className="instruction-text">
                    {isPrism && t('step1')}
                    {playPhase === 'transition' && t('remember')}
                    {isPyramid && t('step2')}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <svg width="400" height="350" className="game-svg" style={{ overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
                            </linearGradient>
                        </defs>

                        {/* Ghost Prism Lines */}
                        <g stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4">
                            <path d={`M${p4.x},${p4.y} L${p4_b.x},${p4_b.y} L${p3_b.x},${p3_b.y}`} fill="none" />
                            <line x1={p4_b.x} y1={p4_b.y} x2={p1_b.x} y2={p1_b.y} />
                            <line x1={p1_b.x} y1={p1_b.y} x2={p2_b.x} y2={p2_b.y} />
                            <line x1={p1_b.x} y1={p1_b.y} x2={p1.x} y2={p1.y} />
                        </g>

                        {/* Prism Body (Visible in Phase 1) */}
                        <g opacity={isPyramid ? 0.1 : 1} transition="opacity 0.5s">
                            <rect x={p1.x} y={p1.y} width={wPx} height={hPx} fill="url(#faceGrad)" stroke="#3b82f6" strokeWidth="2" />
                            <path d={`M${p2.x},${p2.y} L${p2_b.x},${p2_b.y} L${p3_b.x},${p3_b.y} L${p3.x},${p3.y} Z`} fill="rgba(37, 99, 235, 0.1)" stroke="#3b82f6" strokeWidth="2" />
                            <path d={`M${p1.x},${p1.y} L${p1_b.x},${p1_b.y} L${p2_b.x},${p2_b.y} L${p2.x},${p2.y} Z`} fill="rgba(37, 99, 235, 0.1)" stroke="#3b82f6" strokeWidth="2" />
                        </g>

                        {/* Pyramid Body (Visible in Phase 2) */}
                        <g opacity={isPyramid ? 1 : 0} transition="opacity 0.5s">
                            <path d={`M${p4.x},${p4.y} L${p3.x},${p3.y} L${apex.x},${apex.y} Z`} fill="rgba(245, 158, 11, 0.4)" stroke="#d97706" strokeWidth="2" />
                            <path d={`M${p3.x},${p3.y} L${p3_b.x},${p3_b.y} L${apex.x},${apex.y} Z`} fill="rgba(180, 83, 9, 0.4)" stroke="#d97706" strokeWidth="2" />
                            <path d={`M${p4.x},${p4.y} L${p4_b.x},${p4_b.y} L${apex.x},${apex.y} Z`} fill="rgba(245, 158, 11, 0.2)" stroke="none" />
                        </g>

                        {/* Dimensions */}
                        <text x={(p4.x + p3.x) / 2} y={p4.y + 25} textAnchor="middle" fontWeight="bold" fill="#374151">w = {dimensions.w}</text>
                        <text x={p4.x - 25} y={(p1.y + p4.y) / 2} textAnchor="middle" fontWeight="bold" fill="#374151">h = {dimensions.h}</text>
                        <text x={p3.x + 20} y={p3.y - 10} fontWeight="bold" fill="#374151">d = {dimensions.d}</text>
                    </svg>

                    {/* Dynamic Formula Card */}
                    <div className={`formula-card ${feedback === 'correct' ? 'highlight' : ''}`}>
                        <div className="formula-text">
                            {isPrism ? "V = w × h × d" : "V = (w × h × d) ÷ 3"}
                        </div>
                        {feedback === 'correct' && (
                            <div className="formula-values fade-in">
                                = {dimensions.w} × {dimensions.h} × {dimensions.d}
                                {isPyramid && " ÷ 3"}
                                <br />
                                = <strong>{isPrism ? dimensions.w * dimensions.h * dimensions.d : (dimensions.w * dimensions.h * dimensions.d) / 3}</strong>
                            </div>
                        )}
                    </div>
                </div>

                {playPhase === 'transition' ? (
                    <button className="btn btn-primary" onClick={() => setPlayPhase('pyramid')}>{t('calcPyramid')}</button>
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

                {feedback === 'incorrect' && <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{t('tryAgain')}</div>}
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
                    <h2>{t('pro')}</h2>
                    <p>{t('power')}</p>
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

export default PyramidPowerGame;
