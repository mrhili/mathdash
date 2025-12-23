import React, { useState, useEffect } from 'react';
// Reuse AreaGame styles for grid
import '../AreaQuest/AreaQuestGame.css';

import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const PerimeterPatrolGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('perimeter-patrol');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.perimeter.', '').replace('game.dimension.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [levelConfig, setLevelConfig] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        startLevel();
    }, [progress.level]);

    const startLevel = () => {
        // Generate shape based on level
        // Level 1-2: Simple Rectangles
        // Level 3-5: L-Shapes (Composite)

        const isComplex = progress.level > 2;

        let config;
        if (!isComplex) {
            const w = Math.floor(Math.random() * 5) + 3; // 3-7
            const h = Math.floor(Math.random() * 5) + 3; // 3-7
            config = {
                type: 'rectangle',
                w, h,
                perimeter: 2 * (w + h),
                segments: [
                    { x1: 0, y1: 0, x2: w, y2: 0 }, // Top
                    { x1: w, y1: 0, x2: w, y2: h }, // Right
                    { x1: w, y1: h, x2: 0, y2: h }, // Bottom
                    { x1: 0, y1: h, x2: 0, y2: 0 }  // Left
                ]
            };
        } else {
            // L-Shape
            // A big rectangle minus a corner chunk
            const w = Math.floor(Math.random() * 4) + 4; // 4-7
            const h = Math.floor(Math.random() * 4) + 4; // 4-7

            const cutW = Math.floor(Math.random() * (w - 2)) + 1;
            const cutH = Math.floor(Math.random() * (h - 2)) + 1;

            // L-shape logic: 
            // Full perimeter of bounding box is actually same as L-shape!
            // 2*(w+h)

            config = {
                type: 'l-shape',
                w, h, cutW, cutH,
                perimeter: 2 * (w + h),
                segments: [
                    { x1: 0, y1: 0, x2: w, y2: 0 }, // Top
                    { x1: w, y1: 0, x2: w, y2: h - cutH }, // Right Top
                    { x1: w, y1: h - cutH, x2: w - cutW, y2: h - cutH }, // Inner Horizontal
                    { x1: w - cutW, y1: h - cutH, x2: w - cutW, y2: h }, // Inner Vertical
                    { x1: w - cutW, y1: h, x2: 0, y2: h }, // Bottom
                    { x1: 0, y1: h, x2: 0, y2: 0 } // Left
                ]
            };
        }

        setLevelConfig(config);
        setGameState('playing');
        setUserAnswer('');
        setShowAnimation(false);
    };

    const handleSubmit = () => {
        if (gameState !== 'playing') return;

        const val = parseInt(userAnswer);
        if (val === levelConfig.perimeter) {
            setShowAnimation(true);
            setTimeout(() => {
                if (progress.level === 5) {
                    setGameState('won');
                    winGame(20);
                } else {
                    completeLevel(progress.level + 1, progress.score + 10);
                }
            }, 2000); // Wait for animation
        } else {
            setGameState('lost');
        }
    };

    const renderGrid = () => {
        if (!levelConfig) return null;

        const gridSize = 12;
        const cellSize = 30;
        const totalSize = gridSize * cellSize;

        // Center the shape
        const startX = Math.floor((gridSize - levelConfig.w) / 2) * cellSize;
        const startY = Math.floor((gridSize - levelConfig.h) / 2) * cellSize;

        // Grid lines
        const gridLines = [];
        for (let i = 0; i <= gridSize; i++) {
            const pos = i * cellSize;
            gridLines.push(<line key={`v-${i}`} x1={pos} y1={0} x2={pos} y2={totalSize} stroke="#e5e7eb" strokeWidth="1" />);
            gridLines.push(<line key={`h-${i}`} x1={0} y1={pos} x2={totalSize} y2={pos} stroke="#e5e7eb" strokeWidth="1" />);
        }

        // Shape Polygon
        let points = "";
        if (levelConfig.type === 'rectangle') {
            points = `${startX},${startY} ${startX + levelConfig.w * cellSize},${startY} ${startX + levelConfig.w * cellSize},${startY + levelConfig.h * cellSize} ${startX},${startY + levelConfig.h * cellSize}`;
        } else {
            // L-Shape Points
            const w = levelConfig.w * cellSize;
            const h = levelConfig.h * cellSize;
            const cw = levelConfig.cutW * cellSize;
            const ch = levelConfig.cutH * cellSize;

            points = `${startX},${startY} ${startX + w},${startY} ${startX + w},${startY + h - ch} ${startX + w - cw},${startY + h - ch} ${startX + w - cw},${startY + h} ${startX},${startY + h}`;
        }

        // Animation Path
        const pathD = `M${points.split(' ').join(' L')} Z`;

        return (
            <svg width={totalSize} height={totalSize} className="game-svg" style={{ overflow: 'visible' }}>
                {gridLines}

                {/* The Shape */}
                <polygon points={points} fill="rgba(16, 185, 129, 0.2)" stroke="#059669" strokeWidth="2" />

                {/* Labels for sides */}
                {levelConfig.segments.map((seg, i) => {
                    // Calculate midpoints for labels
                    // We need to map local coords to screen coords
                    const x1 = startX + seg.x1 * cellSize;
                    const y1 = startY + seg.y1 * cellSize;
                    const x2 = startX + seg.x2 * cellSize;
                    const y2 = startY + seg.y2 * cellSize;

                    const mx = (x1 + x2) / 2;
                    const my = (y1 + y2) / 2;

                    const len = Math.abs((seg.x2 - seg.x1) + (seg.y2 - seg.y1)); // Only works for rectilinear

                    // Offset label slightly
                    let ox = 0, oy = 0;
                    if (y1 === y2) { // Horizontal
                        oy = y1 < startY + (levelConfig.h * cellSize) / 2 ? -10 : 15;
                    } else { // Vertical
                        ox = x1 < startX + (levelConfig.w * cellSize) / 2 ? -15 : 10;
                    }

                    return (
                        <text key={i} x={mx + ox} y={my + oy} textAnchor="middle" fill="#023626ff" fontWeight="bold" fontSize="12">
                            {len + " cm"}
                        </text>
                    );
                })}

                {/* Patrol Bot Animation */}
                {showAnimation && (
                    <circle r="6" fill="#f59e0b" stroke="#b45309" strokeWidth="2">
                        <animateMotion
                            dur="2s"
                            repeatCount="1"
                            path={pathD}
                        />
                    </circle>
                )}
            </svg>
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

            <div className="game-area">
                <div className="instruction-text">
                    {t('instruction')}
                </div>

                <div className="coordinate-grid">
                    <div className="grid-wrapper-svg">
                        {renderGrid()}
                    </div>
                </div>

                {gameState === 'playing' && (
                    <div className="input-with-unit">
                        <input
                            type="number"
                            className="area-input"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="?"
                            autoFocus
                        />
                        <span className="unit-label">cm</span>
                        <button className="btn btn-primary" onClick={handleSubmit}>{t('btn.submit')}</button>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('pro')}</h2>
                        <p>{t('patrolled')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('game.dimension.gameOver')}</h2>
                        <p>{t('correctWas').replace('{perimeter}', levelConfig?.perimeter)}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.tryAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerimeterPatrolGame;
