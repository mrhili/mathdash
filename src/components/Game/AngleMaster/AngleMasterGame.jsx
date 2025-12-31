import React, { useState, useEffect, useRef } from 'react';
import './AngleMasterGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const AngleMasterGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('angle-master');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.angleMaster.', '').replace('game.dimension.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [targetAngle, setTargetAngle] = useState(45);
    const [baseRotation, setBaseRotation] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [gameState, setGameState] = useState('playing');

    // Protractor State
    const [position, setPosition] = useState({ x: 300, y: 200 });
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const currentLevel = isTestMode ? testLevel : progress.level;

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const startLevel = () => {
        // Level 1-2: Horizontal base (0 rotation)
        // Level 3-5: Random base rotation
        const isRotated = currentLevel > 2;

        const angle = Math.floor(Math.random() * 160) + 10; // 10 to 170 degrees
        const base = isRotated ? Math.floor(Math.random() * 360) : 0;

        setTargetAngle(angle);
        setBaseRotation(base);
        setGameState('playing');
        setUserAnswer('');

        // Reset Protractor
        setPosition({ x: 300, y: 300 });
        setRotation(0);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch Support
    const handleTouchStart = (e) => {
        setIsDragging(true);
        const touch = e.touches[0];
        dragStart.current = {
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        };
    };

    const handleTouchMove = (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragStart.current.x,
                y: touch.clientY - dragStart.current.y
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleSubmit = () => {
        const val = parseInt(userAnswer);
        if (Math.abs(val - targetAngle) <= 2) { // 2 degree tolerance
            if (isTestMode && onTestComplete) {
                setGameState('won');
                setTimeout(() => onTestComplete(true), 1000);
                return;
            }

            if (currentLevel === 5) {
                setGameState('won');
                winGame(20);
            } else {
                setGameState('correct'); // Intermediate state for feedback
                setTimeout(() => {
                    completeLevel(progress.level + 1, progress.score + 10);
                }, 1500);
            }
        } else {
            setGameState('lost');
            if (isTestMode && onTestComplete) {
                setTimeout(() => onTestComplete(false), 1000);
            }
        }
    };

    const renderProtractor = () => {
        // SVG Protractor
        return (
            <g
                transform={`translate(${position.x}, ${position.y}) rotate(${rotation})`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="protractor"
            >
                {/* Semi-transparent body */}
                <path d="M-150,0 A150,150 0 0,1 150,0 L0,0 Z" fill="rgba(59, 130, 246, 0.3)" stroke="#2563eb" strokeWidth="2" />

                {/* Center Point */}
                <circle cx="0" cy="0" r="5" fill="#ef4444" />
                <line x1="-150" y1="0" x2="150" y2="0" stroke="#2563eb" strokeWidth="1" />
                <line x1="0" y1="0" x2="0" y2="-150" stroke="#2563eb" strokeWidth="1" />

                {/* Ticks and Labels */}
                {Array.from({ length: 19 }).map((_, i) => {
                    const deg = i * 10;
                    const rad = (deg * Math.PI) / 180;
                    // Outer ticks (0 to 180)
                    const x1 = -150 * Math.cos(rad);
                    const y1 = -150 * Math.sin(rad);
                    const x2 = -130 * Math.cos(rad);
                    const y2 = -130 * Math.sin(rad);

                    // Text pos
                    const tx = -115 * Math.cos(rad);
                    const ty = -115 * Math.sin(rad);

                    return (
                        <g key={i}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e40af" strokeWidth={i % 9 === 0 ? 2 : 1} />
                            <text
                                x={tx} y={ty}
                                fontSize="10"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#1e3a8a"
                                transform={`rotate(${-rotation + 90 - deg}, ${tx}, ${ty})`} // Keep text upright-ish? No, let it rotate with protractor
                            >
                                {deg}
                            </text>
                        </g>
                    );
                })}
            </g>
        );
    };

    const renderAngle = () => {
        const cx = 300;
        const cy = 200;
        const len = 120;

        // Base Ray
        const baseRad = (baseRotation * Math.PI) / 180;
        const bx = cx + len * Math.cos(baseRad);
        const by = cy + len * Math.sin(baseRad);

        // Target Ray
        // Angle is usually counter-clockwise from base in math, but SVG y is down.
        // Let's stick to standard math: CCW is negative Y in SVG if we treat 0 as right.
        // Actually, let's just use simple addition of degrees.
        const targetRad = ((baseRotation - targetAngle) * Math.PI) / 180; // Negative for CCW visual
        const tx = cx + len * Math.cos(targetRad);
        const ty = cy + len * Math.sin(targetRad);

        return (
            <g>
                {/* Vertex */}
                <circle cx={cx} cy={cy} r="4" fill="#000" />

                {/* Rays */}
                <line x1={cx} y1={cy} x2={bx} y2={by} stroke="#000" strokeWidth="3" strokeLinecap="round" />
                <line x1={cx} y1={cy} x2={tx} y2={ty} stroke="#000" strokeWidth="3" strokeLinecap="round" />

                {/* Arc hint (small) */}
                {/* <path d="..." fill="none" stroke="#666" strokeDasharray="4 4" /> */}
            </g>
        );
    };

    return (
        <div className="game-container fade-in"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/5</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="angle-game-area">
                <div className="instruction-text">
                    {t('instruction')}
                </div>

                <div className="protractor-container">
                    <svg width="100%" height="100%" viewBox="0 0 600 400">
                        {renderAngle()}
                        {renderProtractor()}
                    </svg>
                </div>

                {/* Manual Controls (Plan B) */}
                <div className="manual-controls">
                    <div className="control-group">
                        <span className="control-label">{t('move') || 'Move'}</span>
                        <div className="d-pad">
                            <button className="d-btn up" onClick={() => setPosition(p => ({ ...p, y: p.y - 5 }))}>▲</button>
                            <div className="d-row">
                                <button className="d-btn left" onClick={() => setPosition(p => ({ ...p, x: p.x - 5 }))}>◀</button>
                                <button className="d-btn right" onClick={() => setPosition(p => ({ ...p, x: p.x + 5 }))}>▶</button>
                            </div>
                            <button className="d-btn down" onClick={() => setPosition(p => ({ ...p, y: p.y + 5 }))}>▼</button>
                        </div>
                    </div>

                    <div className="control-group">
                        <span className="control-label">{t('rotate') || 'Rotate'}</span>
                        <div className="rotate-controls">
                            <button className="d-btn" onClick={() => setRotation(r => (r - 1 + 360) % 360)}>↺</button>
                            <button className="d-btn" onClick={() => setRotation(r => (r + 1) % 360)}>↻</button>
                        </div>
                    </div>
                </div>

                <div className="controls-area">
                    <div className="slider-group">
                        <span>{t('rotate')}</span>
                        <input
                            type="range"
                            min="0" max="360"
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="rotation-slider"
                        />
                        <span>{rotation}°</span>
                    </div>

                    {gameState === 'playing' && (
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="angle-input"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="?"
                            />
                            <span className="unit-label">°</span>
                            <button className="btn btn-primary" onClick={handleSubmit}>{t('btn.submit')}</button>
                        </div>
                    )}
                </div>

                {gameState === 'correct' && (
                    <div className="result-card success fade-in">
                        <h2>{t('correct')}</h2>
                        <p>{t('thatIs').replace('{angle}', targetAngle)}</p>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('master')}</h2>
                        <p>{t('sharp')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('game.dimension.gameOver')}</h2>
                        <p>{t('angleWas').replace('{angle}', targetAngle)}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.tryAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AngleMasterGame;
