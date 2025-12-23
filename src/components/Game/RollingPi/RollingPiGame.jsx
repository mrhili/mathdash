import React, { useState, useEffect, useRef } from 'react';
import './RollingPiGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const RollingPiGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('rolling-pi');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    // Intro State
    // 0: Intro Start (Show Wheel)
    // 1: Show Diameter (1m)
    // 2: Show Radius (0.5m)
    // 3: Ready to Roll
    // 4: Rolling
    // 5: Measured (Show 3.14m)
    // 6: Conclusion (Formula)
    const [introStep, setIntroStep] = useState(0);
    const [rollProgress, setRollProgress] = useState(0);

    // Game State
    const [radius, setRadius] = useState(5);
    const [userAnswer, setUserAnswer] = useState('');
    const [gameState, setGameState] = useState('intro');

    const animationRef = useRef(null);

    useEffect(() => {
        if (progress.level > 1) {
            setGameState('playing');
            generateLevel();
        }
    }, [progress.level]);

    const nextIntroStep = () => {
        setIntroStep(prev => prev + 1);
    };

    const startRoll = () => {
        setIntroStep(4);
        let start = null;
        const duration = 4000; // Slow roll (4s)

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const p = Math.min(elapsed / duration, 1);

            setRollProgress(p);

            if (p < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setIntroStep(5);
            }
        };
        animationRef.current = requestAnimationFrame(animate);
    };

    const generateLevel = () => {
        const r = Math.floor(Math.random() * 8) + 3;
        setRadius(r);
        setUserAnswer('');
    };

    const checkAnswer = () => {
        const d = radius * 2;
        const simpleExpected = (3.14 * d).toFixed(2);
        const val = parseFloat(userAnswer);

        if (Math.abs(val - parseFloat(simpleExpected)) < 0.1) {
            if (progress.level === 5) {
                winGame(30);
                setGameState('won');
            } else {
                completeLevel(progress.level + 1, progress.score + 10);
                generateLevel();
            }
        } else {
            alert(t('notQuite').replace('{expected}', simpleExpected));
        }
    };

    // Visual calculations for Intro
    // Let's pretend 1 meter = 100px for the visual scale
    const pixelsPerMeter = 100;
    const diameterMeters = 1;
    const wheelDiameterPx = diameterMeters * pixelsPerMeter; // 100px
    const wheelRadiusPx = wheelDiameterPx / 2; // 50px

    const distanceRolledMeters = rollProgress * 3.14159 * diameterMeters;
    const distanceRolledPx = distanceRolledMeters * pixelsPerMeter;
    const rotation = rollProgress * 360;

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/5</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="rolling-pi-area">
                {gameState === 'intro' && (
                    <>
                        <div className="instruction-text" style={{ minHeight: '60px' }}>
                            {introStep === 0 && t('intro0')}
                            {introStep === 1 && t('intro1')}
                            {introStep === 2 && t('intro2')}
                            {introStep === 3 && t('intro3')}
                            {introStep === 4 && t('intro4')}
                            {introStep === 5 && t('intro5')}
                            {introStep === 6 && t('intro6')}
                        </div>

                        <div className="animation-stage">
                            <div
                                className="unicycle-container"
                                style={{
                                    transform: `translateX(${50 + distanceRolledPx}px)`,
                                    width: `${wheelDiameterPx}px`,
                                    left: '0'
                                }}
                            >
                                <div className="seat"></div>
                                <div className="seat-post"></div>
                                <div
                                    className="wheel"
                                    style={{
                                        width: `${wheelDiameterPx}px`,
                                        height: `${wheelDiameterPx}px`,
                                        transform: `rotate(${rotation}deg)`
                                    }}
                                >
                                    <div className="spoke" style={{ transform: 'rotate(0deg)' }}></div>
                                    <div className="spoke" style={{ transform: 'rotate(90deg)' }}></div>
                                    <div className="marker"></div>

                                    {/* Overlays for teaching */}
                                    {introStep === 1 && (
                                        <div style={{
                                            position: 'absolute', top: '50%', left: 0, width: '100%', height: '4px', background: '#ef4444', transform: 'translateY(-50%)'
                                        }}></div>
                                    )}
                                    {introStep === 2 && (
                                        <div style={{
                                            position: 'absolute', top: '50%', right: 0, width: '50%', height: '4px', background: '#10b981', transform: 'translateY(-50%)'
                                        }}></div>
                                    )}
                                </div>
                                {/* Labels below wheel */}
                                {introStep === 1 && <div style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '5px' }}>{t('diameter')}</div>}
                                {introStep === 2 && <div style={{ color: '#10b981', fontWeight: 'bold', marginTop: '5px' }}>{t('radius')}</div>}
                            </div>

                            {/* Path Trace */}
                            <div
                                className="path-trace"
                                style={{
                                    left: `${50 + wheelRadiusPx}px`, // Start at center of wheel start pos
                                    width: `${distanceRolledPx}px`
                                }}
                            ></div>

                            {/* Ruler / Measurement */}
                            {introStep >= 5 && (
                                <div className="measurement-label" style={{ left: `${50 + wheelRadiusPx + distanceRolledPx / 2}px`, bottom: '40px', fontSize: '1.5rem' }}>
                                    {distanceRolledMeters.toFixed(2)} meters
                                </div>
                            )}
                        </div>

                        <div className="controls-area">
                            {introStep < 3 && (
                                <button className="btn btn-primary" onClick={nextIntroStep}>{t('nextStep')}</button>
                            )}
                            {introStep === 3 && (
                                <button className="btn btn-primary" onClick={startRoll}>{t('rollIt')}</button>
                            )}
                            {introStep === 5 && (
                                <button className="btn btn-primary" onClick={nextIntroStep}>{t('analyze')}</button>
                            )}
                            {introStep === 6 && (
                                <div className="formula-card fade-in">
                                    <div className="formula-step visible">
                                        {t('rolled')} <span className="highlight">1 meter</span> diameter.
                                    </div>
                                    <div className="formula-step visible" style={{ transitionDelay: '0.5s' }}>
                                        {t('got')} <span className="highlight">3.14 meters</span> distance.
                                    </div>
                                    <div className="formula-step visible" style={{ transitionDelay: '1.5s' }}>
                                        {t('piIs')} <strong>Pi (π)</strong>.
                                    </div>
                                    <div className="formula-step visible" style={{ transitionDelay: '2.5s' }}>
                                        {t('formula')} <strong>Circumference = π × Diameter</strong>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '20px' }}
                                        onClick={() => {
                                            setGameState('playing');
                                            completeLevel(1, 0);
                                        }}
                                    >
                                        {t('startChallenge')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {gameState === 'playing' && (
                    <div className="game-play-area">
                        <div className="question-card">
                            <h2>{t('calcCircumference')}</h2>
                            <div className="visual-circle" style={{
                                width: `${radius * 10}px`,
                                height: `${radius * 10}px`,
                                border: '4px solid #3b82f6',
                                borderRadius: '50%',
                                margin: '20px auto',
                                position: 'relative'
                            }}>
                                {/* Radius Line */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '50%',
                                    height: '2px',
                                    background: '#ef4444',
                                    transformOrigin: 'left'
                                }}></div>
                                <span style={{
                                    position: 'absolute',
                                    top: '40%',
                                    left: '60%',
                                    color: '#ef4444',
                                    fontWeight: 'bold'
                                }}>r = {radius}</span>
                            </div>

                            <p>{t('ifRadius')} <strong>{radius}</strong>...</p>
                            <p>Diameter = {radius * 2}</p>
                            <p>{t('circumference')} = 3.14 × {radius * 2} = ?</p>

                            <div className="input-group">
                                <input
                                    type="number"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="?"
                                    className="answer-input"
                                />
                                <button className="btn btn-primary" onClick={checkAnswer}>{t('check')}</button>
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('onRoll')}</h2>
                        <p>{t('mastered')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('playAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RollingPiGame;
