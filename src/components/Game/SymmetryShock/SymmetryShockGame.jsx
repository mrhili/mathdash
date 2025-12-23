import React, { useState, useEffect, useRef } from 'react';
import './SymmetryShockGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const SymmetryShockGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('symmetry-shock');
    const { language, t: globalT } = useLanguage();

    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [levelConfig, setLevelConfig] = useState(null);
    const [userPoints, setUserPoints] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    // Coordinate system constants
    const GRID_SIZE = 20; // -10 to 10
    const CELL_SIZE = 20;
    const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
    const CENTER = CANVAS_SIZE / 2;

    useEffect(() => {
        startLevel(progress.level);
        return () => clearInterval(timerRef.current);
    }, [progress.level]);

    useEffect(() => {
        if (timeLeft > 0 && gameState === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setGameState('lost');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, gameState]);

    const startLevel = (level) => {
        const config = generateLevel(level);
        setLevelConfig(config);
        setUserPoints([]);
        setFeedback(null);
        setGameState('playing');
        if (config.timeLimit) {
            setTimeLeft(config.timeLimit);
        } else {
            setTimeLeft(0);
        }
    };

    const generateLevel = (level) => {
        // Difficulty progression
        // 1-10: X or Y axis, single point
        // 11-20: X or Y axis, shapes (3-4 points)
        // 21-30: Origin symmetry, shapes
        // 31-40: Diagonal (y=x, y=-x), shapes
        // 41-50: Chaos (Multiple axes, time limits)

        let axis = 'x'; // x, y, origin, diag1 (y=x), diag2 (y=-x)
        let numPoints = 1;
        let timeLimit = 0;

        if (level <= 10) {
            axis = Math.random() > 0.5 ? 'x' : 'y';
            numPoints = 1;
        } else if (level <= 20) {
            axis = Math.random() > 0.5 ? 'x' : 'y';
            numPoints = Math.floor(Math.random() * 2) + 3; // 3-4 points
        } else if (level <= 30) {
            axis = 'origin';
            numPoints = Math.floor(Math.random() * 3) + 3; // 3-5 points
        } else if (level <= 40) {
            axis = Math.random() > 0.5 ? 'diag1' : 'diag2';
            numPoints = Math.floor(Math.random() * 3) + 3;
        } else {
            // Chaos mode
            const axes = ['x', 'y', 'origin', 'diag1', 'diag2'];
            axis = axes[Math.floor(Math.random() * axes.length)];
            numPoints = Math.floor(Math.random() * 4) + 4; // 4-7 points
            timeLimit = 30 - Math.floor((level - 40) * 1.5); // Decreasing time
        }

        const points = [];
        for (let i = 0; i < numPoints; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * 16) - 8; // -8 to 8
                y = Math.floor(Math.random() * 16) - 8;
            } while (points.some(p => p.x === x && p.y === y) || (x === 0 && y === 0)); // Avoid duplicates and origin
            points.push({ x, y });
        }

        return { level, axis, points, timeLimit };
    };

    const handleGridClick = (e) => {
        if (gameState !== 'playing') return;

        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert to grid coordinates
        const gridX = Math.round((clickX - CENTER) / CELL_SIZE);
        const gridY = Math.round((CENTER - clickY) / CELL_SIZE); // Y is inverted in SVG

        // Toggle point
        setUserPoints(prev => {
            const exists = prev.find(p => p.x === gridX && p.y === gridY);
            if (exists) {
                return prev.filter(p => p !== exists);
            } else {
                return [...prev, { x: gridX, y: gridY }];
            }
        });
    };

    const checkSolution = () => {
        if (!levelConfig) return;

        const { axis, points } = levelConfig;
        const expectedPoints = points.map(p => reflectPoint(p, axis));

        // Check if user points match expected points (order doesn't matter)
        if (userPoints.length !== expectedPoints.length) {
            handleIncorrect();
            return;
        }

        const allCorrect = userPoints.every(up =>
            expectedPoints.some(ep => ep.x === up.x && ep.y === up.y)
        );

        if (allCorrect) {
            setFeedback('correct');
            setTimeout(() => {
                if (progress.level === 50) {
                    setGameState('won');
                    winGame(100);
                } else {
                    completeLevel(progress.level + 1, progress.score + (levelConfig.timeLimit ? 20 : 10));
                }
            }, 1000);
        } else {
            handleIncorrect();
        }
    };

    const handleIncorrect = () => {
        setFeedback('incorrect');
        setGameState('lost');
    };

    const reflectPoint = (p, axis) => {
        switch (axis) {
            case 'x': return { x: p.x, y: -p.y };
            case 'y': return { x: -p.x, y: p.y };
            case 'origin': return { x: -p.x, y: -p.y };
            case 'diag1': return { x: p.y, y: p.x }; // y=x -> swap x,y
            case 'diag2': return { x: -p.y, y: -p.x }; // y=-x -> swap and negate
            default: return p;
        }
    };

    const getAxisLabel = (axis) => {
        switch (axis) {
            case 'x': return t('axisX');
            case 'y': return t('axisY');
            case 'origin': return t('origin');
            case 'diag1': return "y = x";
            case 'diag2': return "y = -x";
            default: return "";
        }
    };

    if (!levelConfig) return null;

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <h1>{t('title')}</h1>
                <div className="hud">
                    <span>{t('level')}: {progress.level}/50</span>
                    <span>{t('score')}: {progress.score}</span>
                    {timeLeft > 0 && <span className="timer" style={{ color: timeLeft < 10 ? 'red' : 'inherit' }}>⏳ {timeLeft}s</span>}
                </div>
            </div>

            <div className="instruction-text">
                {t('instruction')} <strong>{getAxisLabel(levelConfig.axis)}</strong>
            </div>

            <div className="symmetry-board-container">
                <svg
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className={`symmetry-grid ${feedback}`}
                    onClick={handleGridClick}
                >
                    {/* Grid Lines */}
                    <defs>
                        <pattern id="grid" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
                            <path d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`} fill="none" stroke="#e5e7eb" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Axes */}
                    <line x1="0" y1={CENTER} x2={CANVAS_SIZE} y2={CENTER} stroke="#9ca3af" strokeWidth="2" />
                    <line x1={CENTER} y1="0" x2={CENTER} y2={CANVAS_SIZE} stroke="#9ca3af" strokeWidth="2" />

                    {/* Reflection Axis Highlight */}
                    {levelConfig.axis === 'x' && <line x1="0" y1={CENTER} x2={CANVAS_SIZE} y2={CENTER} stroke="#ef4444" strokeWidth="4" opacity="0.5" />}
                    {levelConfig.axis === 'y' && <line x1={CENTER} y1="0" x2={CENTER} y2={CANVAS_SIZE} stroke="#ef4444" strokeWidth="4" opacity="0.5" />}
                    {levelConfig.axis === 'diag1' && <line x1="0" y1={CANVAS_SIZE} x2={CANVAS_SIZE} y2="0" stroke="#ef4444" strokeWidth="4" opacity="0.5" />}
                    {levelConfig.axis === 'diag2' && <line x1="0" y1="0" x2={CANVAS_SIZE} y2={CANVAS_SIZE} stroke="#ef4444" strokeWidth="4" opacity="0.5" />}
                    {levelConfig.axis === 'origin' && <circle cx={CENTER} cy={CENTER} r="6" fill="#ef4444" opacity="0.8" />}

                    {/* Target Points (Blue) */}
                    {levelConfig.points.map((p, i) => (
                        <circle
                            key={`target-${i}`}
                            cx={CENTER + p.x * CELL_SIZE}
                            cy={CENTER - p.y * CELL_SIZE}
                            r="6"
                            fill="#3b82f6"
                        />
                    ))}

                    {/* User Points (Green) */}
                    {userPoints.map((p, i) => (
                        <circle
                            key={`user-${i}`}
                            cx={CENTER + p.x * CELL_SIZE}
                            cy={CENTER - p.y * CELL_SIZE}
                            r="6"
                            fill="#10b981"
                            stroke="white"
                            strokeWidth="2"
                        />
                    ))}
                </svg>
            </div>

            <div className="controls">
                <button className="btn btn-primary" onClick={checkSolution} disabled={userPoints.length === 0}>
                    {t('submit')}
                </button>
            </div>

            {gameState === 'lost' && (
                <div className="result-card error">
                    <h2>{t('gameOver')}</h2>
                    <p>{t('chaos')}</p>
                    <button className="btn btn-primary" onClick={() => startLevel(progress.level)}>{t('tryAgain')}</button>
                </div>
            )}
            {gameState === 'won' && (
                <div className="result-card success">
                    <h2>{t('master')}</h2>
                    <button className="btn btn-primary" onClick={onBack}>{t('back')}</button>
                </div>
            )}
        </div>
    );
};

export default SymmetryShockGame;
