import React, { useState, useEffect } from 'react';
import './AreaQuestGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const AreaQuestGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('area-quest');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.areaQuest.', '').replace('game.placeValue.', ''); // Handle legacy keys

        // Handle nested keys (e.g. rule.sideSide)
        if (localKey.includes('.')) {
            const parts = localKey.split('.');
            let current = dict;
            for (const part of parts) {
                if (current[part]) {
                    current = current[part];
                } else {
                    return globalT(key);
                }
            }
            return current;
        }

        return dict[localKey] || globalT(key);
    };

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [shapeType, setShapeType] = useState('square'); // 'square', 'rectangle', 'triangle', 'parallelogram', 'trapezoid', 'rhombus'
    const [phase, setPhase] = useState('select-rule'); // 'select-rule', 'calculate'
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [userAnswer, setUserAnswer] = useState('');
    const [ruleOptions, setRuleOptions] = useState([]);

    const currentLevel = isTestMode ? testLevel : progress.level;

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const startLevel = () => {
        // Determine shape type based on level
        let type = 'square';
        if (currentLevel === 2) type = 'rectangle';
        if (currentLevel === 3) type = 'triangle';
        if (currentLevel === 4) type = 'parallelogram';
        if (currentLevel === 5) type = 'trapezoid';
        if (currentLevel === 6) type = 'rhombus';

        // For levels > 6, mix them up
        if (currentLevel > 6) {
            const rand = Math.random();
            if (rand < 0.16) type = 'square';
            else if (rand < 0.33) type = 'rectangle';
            else if (rand < 0.5) type = 'triangle';
            else if (rand < 0.66) type = 'parallelogram';
            else if (rand < 0.83) type = 'trapezoid';
            else type = 'rhombus';
        }
        setShapeType(type);

        let width, height, topWidth = 0, shift = 0;

        // Common random generation
        width = Math.floor(Math.random() * 5) + 3; // 3 to 7
        height = Math.floor(Math.random() * 5) + 3; // 3 to 7

        if (type === 'square') {
            width = height; // Make it a square
        } else if (type === 'rectangle') {
            if (width === height) width += 1; // Ensure not square
        } else if (type === 'parallelogram') {
            shift = Math.floor(Math.random() * 2) + 1; // 1 or 2 shift
        } else if (type === 'trapezoid') {
            // Ensure topWidth is different from width (bottom base)
            topWidth = Math.max(2, width - 2);
            if (topWidth === width) topWidth = width - 1;
            // Ensure (width + topWidth) is even so area is integer
            if ((width + topWidth) % 2 !== 0) {
                width += 1; // Adjust width to make sum even
            }
        } else if (type === 'rhombus') {
            // For Rhombus, width and height represent Diagonals d1 and d2
            // Area = (d1 * d2) / 2. Ensure product is even for integer area.
            if ((width * height) % 2 !== 0) {
                width += 1;
            }
        }

        setDimensions({ width, height, topWidth, shift });

        // Generate Rule Options
        let options = [];
        if (type === 'square') {
            options = [
                { id: 'side*side', label: 'rule.sideSide', correct: true },
                { id: 'side+side', label: 'rule.sidePlusSide', correct: false },
                { id: 'side*4', label: 'rule.side4', correct: false },
            ];
        } else if (type === 'rectangle') {
            options = [
                { id: 'l*w', label: 'rule.lw', correct: true },
                { id: 'l+w', label: 'rule.lPlusW', correct: false },
                { id: '2*(l+w)', label: 'rule.x2lw', correct: false },
            ];
        } else if (type === 'triangle') {
            options = [
                { id: 'b*h/2', label: 'rule.bh2', correct: true },
                { id: 'b*h', label: 'rule.bh', correct: false },
                { id: 'b+h', label: 'rule.bPlusH', correct: false },
            ];
        } else if (type === 'parallelogram') {
            options = [
                { id: 'b*h', label: 'rule.bh', correct: true },
                { id: 'b*h/2', label: 'rule.bh2', correct: false },
                { id: '2*(b+h)', label: 'rule.x2bh', correct: false },
            ];
        } else if (type === 'trapezoid') {
            options = [
                { id: 'trap', label: 'rule.trap', correct: true },
                { id: 'b*h', label: 'rule.bh', correct: false },
                { id: 'wrong', label: 'rule.trapWrong', correct: false },
            ];
        } else if (type === 'rhombus') {
            options = [
                { id: 'd1*d2/2', label: 'rule.d1d22', correct: true },
                { id: 'd1*d2', label: 'rule.d1d2', correct: false },
                { id: 'd1+d2', label: 'rule.d1Plusd2', correct: false },
            ];
        }
        setRuleOptions(shuffleArray(options));

        setPhase('select-rule');
        setGameState('playing');
        setUserAnswer('');
    };

    const handleRuleSelect = (isCorrect) => {
        if (gameState !== 'playing' || phase !== 'select-rule') return;

        if (isCorrect) {
            setPhase('calculate');
        } else {
            setGameState('lost');
            if (isTestMode && onTestComplete) {
                setTimeout(() => onTestComplete(false), 1000);
            }
        }
    };

    const handleAreaSubmit = () => {
        if (gameState !== 'playing' || phase !== 'calculate') return;

        let correctArea;
        if (shapeType === 'triangle') {
            correctArea = (dimensions.width * dimensions.height) / 2;
        } else if (shapeType === 'trapezoid') {
            correctArea = ((dimensions.width + dimensions.topWidth) / 2) * dimensions.height;
        } else if (shapeType === 'rhombus') {
            correctArea = (dimensions.width * dimensions.height) / 2;
        } else {
            // Square, Rectangle, Parallelogram all use w * h (Base * Height)
            correctArea = dimensions.width * dimensions.height;
        }

        // Allow flexible input (e.g. 12 or 12.0)
        if (parseFloat(userAnswer) === correctArea) {
            if (isTestMode && onTestComplete) {
                setGameState('won');
                setTimeout(() => onTestComplete(true), 1000);
                return;
            }

            if (currentLevel === 6) {
                setGameState('won');
                winGame(16); // 6 levels + 10 bonus
            } else {
                completeLevel(currentLevel + 1, progress.level);
            }
        } else {
            setGameState('lost');
            if (isTestMode && onTestComplete) {
                setTimeout(() => onTestComplete(false), 1000);
            }
        }
    };

    const renderSVG = () => {
        const gridSize = 12; // Increased grid size
        const cellSize = 30;
        const totalSize = gridSize * cellSize;

        // Center calculations
        const effectiveWidth = shapeType === 'parallelogram' ? dimensions.width + dimensions.shift : dimensions.width;
        const startX = Math.floor((gridSize - effectiveWidth) / 2) * cellSize;
        const startY = Math.floor((gridSize - dimensions.height) / 2) * cellSize;

        const w = dimensions.width * cellSize;
        const h = dimensions.height * cellSize;
        const shiftPx = (dimensions.shift || 0) * cellSize;
        const topW = (dimensions.topWidth || 0) * cellSize;

        // Grid lines
        const gridLines = [];
        for (let i = 0; i <= gridSize; i++) {
            const pos = i * cellSize;
            gridLines.push(<line key={`v-${i}`} x1={pos} y1={0} x2={pos} y2={totalSize} stroke="#e5e7eb" strokeWidth="1" />);
            gridLines.push(<line key={`h-${i}`} x1={0} y1={pos} x2={totalSize} y2={pos} stroke="#e5e7eb" strokeWidth="1" />);
        }

        let shapeSvg = null;
        let ghostSvg = null;
        let labels = null;

        if (shapeType === 'square' || shapeType === 'rectangle') {
            shapeSvg = (
                <rect x={startX} y={startY} width={w} height={h} fill="rgba(16, 185, 129, 0.5)" stroke="#059669" strokeWidth="3" />
            );
            labels = (
                <>
                    <text x={startX + w / 2} y={startY + h + 20} textAnchor="middle" fill="#374151" fontWeight="bold">
                        {shapeType === 'square' ? 'Side' : 'Width'}: {dimensions.width} cm
                    </text>
                    <text x={startX - 10} y={startY + h / 2} textAnchor="middle" transform={`rotate(-90, ${startX - 10}, ${startY + h / 2})`} fill="#374151" fontWeight="bold">
                        {shapeType === 'square' ? 'Side' : 'Length'}: {dimensions.height} cm
                    </text>
                </>
            );
        } else if (shapeType === 'triangle') {
            // PRESERVED TRIANGLE LOGIC & VISUALS
            ghostSvg = (
                <rect x={startX} y={startY} width={w} height={h} fill="rgba(200, 200, 200, 0.2)" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
            );
            shapeSvg = (
                <polygon points={`${startX},${startY + h} ${startX + w},${startY + h} ${startX},${startY}`} fill="rgba(16, 185, 129, 0.5)" stroke="#059669" strokeWidth="3" />
            );
            labels = (
                <>
                    <text x={startX + w / 2} y={startY + h + 20} textAnchor="middle" fill="#374151" fontWeight="bold">Base: {dimensions.width} cm</text>
                    <text x={startX - 10} y={startY + h / 2} textAnchor="middle" transform={`rotate(-90, ${startX - 10}, ${startY + h / 2})`} fill="#374151" fontWeight="bold">Height: {dimensions.height} cm</text>
                </>
            );
        } else if (shapeType === 'parallelogram') {
            const points = `${startX},${startY + h} ${startX + w},${startY + h} ${startX + w + shiftPx},${startY} ${startX + shiftPx},${startY}`;

            ghostSvg = (
                <rect x={startX + shiftPx} y={startY} width={w} height={h} fill="rgba(200, 200, 200, 0.2)" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
            );

            shapeSvg = (
                <polygon points={points} fill="rgba(16, 185, 129, 0.5)" stroke="#059669" strokeWidth="3" />
            );
            labels = (
                <>
                    <text x={startX + w / 2} y={startY + h + 20} textAnchor="middle" fill="#374151" fontWeight="bold">Base: {dimensions.width} cm</text>
                    <text x={startX - 10} y={startY + h / 2} textAnchor="middle" transform={`rotate(-90, ${startX - 10}, ${startY + h / 2})`} fill="#374151" fontWeight="bold">Height: {dimensions.height} cm</text>
                </>
            );
        } else if (shapeType === 'trapezoid') {
            const offset = (w - topW) / 2;

            // Double Trapezoid Visual: Original + Flipped Copy = Parallelogram
            const totalVisualWidth = w + topW + offset;
            const centeredStartX = Math.floor((gridSize * cellSize - totalVisualWidth) / 2);

            const origPoints = `${centeredStartX},${startY + h} ${centeredStartX + w},${startY + h} ${centeredStartX + offset + topW},${startY} ${centeredStartX + offset},${startY}`;

            const ghostPoints = `${centeredStartX + w},${startY + h} ${centeredStartX + w + topW},${startY + h} ${centeredStartX + w + topW + offset},${startY} ${centeredStartX + offset + topW},${startY}`;

            ghostSvg = (
                <polygon points={ghostPoints} fill="rgba(200, 200, 200, 0.2)" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
            );

            shapeSvg = (
                <polygon points={origPoints} fill="rgba(16, 185, 129, 0.5)" stroke="#059669" strokeWidth="3" />
            );
            labels = (
                <>
                    <text x={centeredStartX + w / 2} y={startY + h + 20} textAnchor="middle" fill="#374151" fontWeight="bold">Base 1: {dimensions.width} cm</text>
                    <text x={centeredStartX + w / 2} y={startY - 10} textAnchor="middle" fill="#374151" fontWeight="bold">Base 2: {dimensions.topWidth} cm</text>
                    <text x={centeredStartX - 10} y={startY + h / 2} textAnchor="middle" transform={`rotate(-90, ${centeredStartX - 10}, ${startY + h / 2})`} fill="#374151" fontWeight="bold">Height: {dimensions.height} cm</text>
                </>
            );
        } else if (shapeType === 'rhombus') {
            const cx = startX + w / 2;
            const cy = startY + h / 2;

            const points = `${cx},${startY} ${startX + w},${cy} ${cx},${startY + h} ${startX},${cy}`;

            ghostSvg = (
                <rect x={startX} y={startY} width={w} height={h} fill="rgba(200, 200, 200, 0.2)" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
            );

            shapeSvg = (
                <polygon points={points} fill="rgba(16, 185, 129, 0.5)" stroke="#059669" strokeWidth="3" />
            );

            labels = (
                <>
                    <line x1={startX} y1={cy} x2={startX + w} y2={cy} stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />
                    <text x={cx} y={cy - 5} textAnchor="middle" fill="#374151" fontWeight="bold">d1: {dimensions.width} cm</text>

                    <line x1={cx} y1={startY} x2={cx} y2={startY + h} stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />
                    <text x={cx + 5} y={startY + 15} textAnchor="start" fill="#374151" fontWeight="bold">d2: {dimensions.height} cm</text>
                </>
            );
        }

        return (
            <svg width={totalSize} height={totalSize} className="game-svg">
                {gridLines}
                {ghostSvg}
                {shapeSvg}
                {phase === 'calculate' && labels}
            </svg>
        );
    };

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/6</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="game-area area-quest-area">
                <div className="instruction-text">
                    {phase === 'select-rule'
                        ? t('chooseRule').replace('{shape}', shapeType.charAt(0).toUpperCase() + shapeType.slice(1))
                        : t('calc')}
                </div>

                <div className="coordinate-grid">
                    <div className="y-axis-label">Y (cm)</div>
                    <div className="grid-wrapper-svg">
                        {renderSVG()}
                    </div>
                    <div className="x-axis-label">X (cm)</div>
                </div>

                {gameState === 'playing' && phase === 'select-rule' && (
                    <div className="rules-grid">
                        {ruleOptions.map((option) => (
                            <button
                                key={option.id}
                                className="btn btn-secondary rule-btn"
                                onClick={() => handleRuleSelect(option.correct)}
                            >
                                {t(option.label)}
                            </button>
                        ))}
                    </div>
                )}

                {gameState === 'playing' && phase === 'calculate' && (
                    <div className="calc-input-area">
                        <div className="formula-display">
                            {(() => {
                                if (shapeType === 'triangle') return `Area = (${dimensions.width} × ${dimensions.height}) / 2`;
                                if (shapeType === 'trapezoid') return `Area = ((${dimensions.width} + ${dimensions.topWidth}) / 2) × ${dimensions.height}`;
                                if (shapeType === 'rhombus') return `Area = (${dimensions.width} × ${dimensions.height}) / 2`;
                                return `Area = ${dimensions.width} × ${dimensions.height}`;
                            })()}
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
                            <span className="unit-label">cm²</span>
                        </div>
                        <button className="btn btn-primary" onClick={handleAreaSubmit}>{t('btn.submit')}</button>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('master')}</h2>
                        <p>{t('mastered')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('game.dimension.gameOver')}</h2>
                        <p>
                            {phase === 'select-rule'
                                ? t('wrongFormula')
                                : t('areaWas').replace('{area}', (() => {
                                    if (shapeType === 'triangle') return (dimensions.width * dimensions.height) / 2;
                                    if (shapeType === 'trapezoid') return ((dimensions.width + dimensions.topWidth) / 2) * dimensions.height;
                                    if (shapeType === 'rhombus') return (dimensions.width * dimensions.height) / 2;
                                    return dimensions.width * dimensions.height;
                                })())}
                        </p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.tryAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AreaQuestGame;
