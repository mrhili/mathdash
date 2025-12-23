import React, { useState, useEffect } from 'react';
import './VolumeQuestGame.css';
// Reuse AreaGame styles for grid
import '../AreaQuest/AreaQuestGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const VolumeQuestGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('volume-quest');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.volumeQuest.', '').replace('game.dimension.', '').replace('game.areaQuest.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [dimensions, setDimensions] = useState({ width: 0, height: 0, depth: 0 }); // Added depth
    const [shapeType, setShapeType] = useState('square');
    const [phase, setPhase] = useState('area'); // 'area', 'extrude', 'volume'
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [userAnswer, setUserAnswer] = useState('');
    const [areaValue, setAreaValue] = useState(null); // Store calculated area

    // Animation state
    const [extrusionProgress, setExtrusionProgress] = useState(0); // 0 to 1

    useEffect(() => {
        startLevel();
    }, [progress.level]);

    const startLevel = () => {
        // Determine shape type based on level
        // Level 1: Square Prism (Cube/Cuboid)
        // Level 2: Rectangular Prism
        // Level 3: Triangular Prism
        // Level 4: Parallelogram Prism
        // Level 5: Trapezoidal Prism

        let type = 'square';
        if (progress.level === 2) type = 'rectangle';
        if (progress.level === 3) type = 'triangle';
        if (progress.level === 4) type = 'parallelogram';
        if (progress.level === 5) type = 'trapezoid';

        // Mix for > 5
        if (progress.level > 5) {
            const rand = Math.random();
            if (rand < 0.2) type = 'square';
            else if (rand < 0.4) type = 'rectangle';
            else if (rand < 0.6) type = 'triangle';
            else if (rand < 0.8) type = 'parallelogram';
            else type = 'trapezoid';
        }

        setShapeType(type);

        let width, height, topWidth = 0, shift = 0;

        // Dimensions for Base
        width = Math.floor(Math.random() * 4) + 3; // 3 to 6
        height = Math.floor(Math.random() * 4) + 3; // 3 to 6

        // Depth (Height of prism)
        const depth = Math.floor(Math.random() * 4) + 3; // 3 to 6

        if (type === 'square') {
            width = height;
        } else if (type === 'rectangle') {
            if (width === height) width += 1;
        } else if (type === 'parallelogram') {
            shift = 1;
        } else if (type === 'trapezoid') {
            topWidth = Math.max(2, width - 2);
            if (topWidth === width) topWidth = width - 1;
            if ((width + topWidth) % 2 !== 0) width += 1;
        }

        setDimensions({ width, height, topWidth, shift, depth });
        setPhase('area');
        setGameState('playing');
        setUserAnswer('');
        setExtrusionProgress(0);
        setAreaValue(null);
    };

    const calculateCorrectArea = () => {
        if (shapeType === 'triangle') return (dimensions.width * dimensions.height) / 2;
        if (shapeType === 'trapezoid') return ((dimensions.width + dimensions.topWidth) / 2) * dimensions.height;
        return dimensions.width * dimensions.height;
    };

    const handleSubmit = () => {
        if (gameState !== 'playing') return;

        const val = parseFloat(userAnswer);

        if (phase === 'area') {
            const correct = calculateCorrectArea();
            if (val === correct) {
                setAreaValue(correct);
                setPhase('extrude');
                setUserAnswer('');
                // Trigger animation
                setTimeout(() => setExtrusionProgress(1), 100);
                setTimeout(() => setPhase('volume'), 1500); // Wait for animation
            } else {
                setGameState('lost');
            }
        } else if (phase === 'volume') {
            let correctVolume = areaValue * dimensions.depth;

            if (val === correctVolume) {
                if (progress.level === 5) {
                    setGameState('won');
                    winGame(15); // 5 levels + 10 bonus
                } else {
                    completeLevel(progress.level + 1, progress.score + 2); // 2 points per level
                }
            } else {
                setGameState('lost');
            }
        }
    };

    const renderSVG = () => {
        const gridSize = 12;
        const cellSize = 30;
        const totalSize = gridSize * cellSize;

        // Base Shape Logic (Same as AreaGame)
        const effectiveWidth = shapeType === 'parallelogram' ? dimensions.width + dimensions.shift : dimensions.width;
        const startX = Math.floor((gridSize - effectiveWidth) / 2) * cellSize;
        const startY = Math.floor((gridSize - dimensions.height) / 2) * cellSize;

        const w = dimensions.width * cellSize;
        const h = dimensions.height * cellSize;
        const shiftPx = (dimensions.shift || 0) * cellSize;
        const topW = (dimensions.topWidth || 0) * cellSize;

        // Extrusion Vector (Up and Right)
        // Max extrusion depth in pixels
        const maxExtrudeX = 20 * dimensions.depth;
        const maxExtrudeY = -20 * dimensions.depth;

        const currentExX = maxExtrudeX * extrusionProgress;
        const currentExY = maxExtrudeY * extrusionProgress;

        // Grid lines
        const gridLines = [];
        for (let i = 0; i <= gridSize; i++) {
            const pos = i * cellSize;
            gridLines.push(<line key={`v-${i}`} x1={pos} y1={0} x2={pos} y2={totalSize} stroke="#e5e7eb" strokeWidth="1" />);
            gridLines.push(<line key={`h-${i}`} x1={0} y1={pos} x2={totalSize} y2={pos} stroke="#e5e7eb" strokeWidth="1" />);
        }

        let basePoints = "";
        let topPoints = ""; // The extruded face

        // Define Base Points string
        if (shapeType === 'square' || shapeType === 'rectangle') {
            basePoints = `${startX},${startY} ${startX + w},${startY} ${startX + w},${startY + h} ${startX},${startY + h}`;
        } else if (shapeType === 'triangle') {
            basePoints = `${startX},${startY + h} ${startX + w},${startY + h} ${startX},${startY}`;
        } else if (shapeType === 'parallelogram') {
            basePoints = `${startX},${startY + h} ${startX + w},${startY + h} ${startX + w + shiftPx},${startY} ${startX + shiftPx},${startY}`;
        } else if (shapeType === 'trapezoid') {
            const offset = (w - topW) / 2;
            const totalVisualWidth = w + topW + offset;
            const tStartX = Math.floor((gridSize * cellSize - totalVisualWidth) / 2);
            basePoints = `${tStartX},${startY + h} ${tStartX + w},${startY + h} ${tStartX + offset + topW},${startY} ${tStartX + offset},${startY}`;
        }

        // Generate Extruded Points
        // We need to parse basePoints to shift them
        const pointsArray = basePoints.split(' ').map(p => {
            const [x, y] = p.split(',').map(Number);
            return { x, y };
        });

        let extrudedPointsArray = [];
        let extrudedPointsStr = "";
        let connectors = null;

        extrudedPointsArray = pointsArray.map(p => ({
            x: p.x + currentExX,
            y: p.y + currentExY
        }));

        extrudedPointsStr = extrudedPointsArray.map(p => `${p.x},${p.y}`).join(' ');

        connectors = pointsArray.map((p, i) => {
            const ep = extrudedPointsArray[i];
            return <line key={i} x1={p.x} y1={p.y} x2={ep.x} y2={ep.y} stroke="#059669" strokeWidth="2" opacity={extrusionProgress} />;
        });

        return (
            <svg width={totalSize} height={totalSize} className="game-svg" style={{ overflow: 'visible' }}>
                {gridLines}

                {connectors}

                <polygon points={extrudedPointsStr} fill="rgba(16, 185, 129, 0.3)" stroke="#059669" strokeWidth="2" opacity={extrusionProgress} />

                {/* Front Face (Base) */}
                <polygon points={basePoints} fill="rgba(16, 185, 129, 0.8)" stroke="#059669" strokeWidth="3" />

                {/* Labels */}
                {phase === 'area' && (
                    <text x={totalSize / 2} y={totalSize - 10} textAnchor="middle" fill="#374151" fontWeight="bold">
                        {t('calcArea').replace('{shape}', shapeType)}
                    </text>
                )}

                {
                    phase === 'volume' && (
                        <>
                            {/* Height/Depth Label */}
                            <line
                                x1={pointsArray[0].x} y1={pointsArray[0].y}
                                x2={extrudedPointsArray[0].x} y2={extrudedPointsArray[0].y}
                                stroke="#ef4444" strokeWidth="2"
                            />
                            <text
                                x={(pointsArray[0].x + extrudedPointsArray[0].x) / 2 - 10}
                                y={(pointsArray[0].y + extrudedPointsArray[0].y) / 2}
                                fill="#ef4444" fontWeight="bold"
                            >
                                h={dimensions.depth}
                            </text>
                        </>
                    )
                }
            </svg >
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

            <div className="game-area volume-quest-area">
                <div className="phase-indicator">
                    <div className={`phase-step ${phase === 'area' ? 'active' : 'completed'}`}>1. {t('step1')}</div>
                    <div className={`phase-step ${phase === 'volume' ? 'active' : ''}`}>2. {t('step2')}</div>
                </div>

                <div className="instruction-text">
                    {phase === 'area'
                        ? t('step1') + ": " + t('calcArea').replace('{shape}', shapeType.charAt(0).toUpperCase() + shapeType.slice(1))
                        : t('step2') + ": " + t('calcVol').replace('{height}', dimensions.depth)}
                </div>

                <div className="coordinate-grid">
                    <div className="grid-wrapper-svg">
                        {renderSVG()}
                    </div>
                </div>

                {gameState === 'playing' && (
                    <div className="volume-input-area">
                        {phase === 'volume' && (
                            <div className="formula-display">
                                {t('formula').replace('{area}', areaValue).replace('{height}', dimensions.depth)}
                            </div>
                        )}

                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="area-input"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="?"
                                autoFocus
                            />
                            <span className="unit-label">{phase === 'area' ? 'cm²' : 'cm³'}</span>
                        </div>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            {phase === 'area' ? t('next') : t('btn.submit')}
                        </button>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('victor')}</h2>
                        <p>{t('fill')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('gameOver')}</h2>
                        <p>
                            {phase === 'area'
                                ? t('areaWas').replace('{area}', calculateCorrectArea())
                                : t('correctWas').replace('{answer}', areaValue * dimensions.depth)}
                        </p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.tryAgain')}</button>
                    </div>
                )}
            </div>
        </div >
    );
};

export default VolumeQuestGame;
