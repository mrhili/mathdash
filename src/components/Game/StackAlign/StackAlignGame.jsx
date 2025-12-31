import React, { useState, useEffect } from 'react';
import './StackAlignGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const StackAlignGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('stack-align');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.stackAlign.', '').replace('game.placeValue.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const currentLevel = isTestMode ? testLevel : progress.level;

    const [topNumber, setTopNumber] = useState('');
    const [bottomNumber, setBottomNumber] = useState('');
    const [offset, setOffset] = useState(0); // Horizontal shift of bottom number
    const [gameState, setGameState] = useState('playing'); // playing, won, lost

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const generateNumber = (lvl) => {
        // Generate numbers with varying decimal places based on level
        const isDecimal = Math.random() > (lvl < 3 ? 0.8 : 0.2); // Mostly integers early on
        const maxVal = lvl * 50 + 10;

        if (!isDecimal) {
            return Math.floor(Math.random() * maxVal).toString();
        } else {
            const decimalPlaces = Math.floor(Math.random() * 3) + 1;
            return (Math.random() * maxVal).toFixed(decimalPlaces);
        }
    };

    const startLevel = () => {
        const top = generateNumber(currentLevel);
        const bottom = generateNumber(currentLevel);
        setTopNumber(top);
        setBottomNumber(bottom);

        // Random initial offset to ensure they aren't already aligned
        // Range: -3 to +3, but not 0 (if 0 is correct)
        let initialOffset = Math.floor(Math.random() * 7) - 3;
        setOffset(initialOffset);
        setGameState('playing');
    };

    const handleShift = (direction) => {
        if (gameState !== 'playing') return;
        setOffset(prev => prev + direction);
    };

    const getDecimalIndex = (numStr) => {
        const idx = numStr.indexOf('.');
        return idx === -1 ? numStr.length : idx;
    };

    const checkAlignment = () => {
        if (gameState !== 'playing') return;

        const topDec = getDecimalIndex(topNumber);
        const bottomDec = getDecimalIndex(bottomNumber);

        if (topDec === bottomDec + offset) {
            if (isTestMode && onTestComplete) {
                setGameState('won'); // Visual feedback
                setTimeout(() => onTestComplete(true), 1000);
                return;
            }

            if (currentLevel === 10) {
                setGameState('won');
                winGame(20);
            } else {
                completeLevel(currentLevel + 1, currentLevel);
                // Note: useGameState might handle level persistence. 
                // In normal play, completeLevel updates state and might trigger re-render -> effect -> startLevel
                // But simplified here is fine.
            }
        } else {
            setGameState('lost');
            if (isTestMode && onTestComplete) {
                setTimeout(() => onTestComplete(false), 1500);
            }
        }
    };

    // Helper to render grid cells
    const renderRow = (numStr, rowOffset = 0, isTop = false) => {
        const cells = [];
        const len = numStr.length;

        // We need a fixed grid width to render comfortably.
        // Let's assume a grid of 15 columns.
        // Center point roughly at index 7.
        // If isTop (offset 0), we might want to center the number visually?
        // For simplicity, let's just render relative to a start column.

        const startCol = 4; // Arbitrary start column for Top number

        // For Bottom number, it starts at startCol + offset
        const actualStart = startCol + rowOffset;

        // Render empty cells before
        for (let i = 0; i < 15; i++) {
            let char = '';
            let isActive = false;

            if (i >= actualStart && i < actualStart + len) {
                char = numStr[i - actualStart];
                isActive = true;
            }

            cells.push(
                <div key={i} className={`grid-cell ${isActive ? (isTop ? 'top-cell' : 'bottom-cell') : ''}`}>
                    {char}
                </div>
            );
        }
        return cells;
    };

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/10</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="game-area stack-align-area">
                <div className="instruction-text">
                    {t('instruction')} <strong>{t('unit')}</strong> {t('orDecimal')}
                </div>

                <div className="grid-board">
                    <div className="grid-row">
                        {renderRow(topNumber, 0, true)}
                    </div>
                    <div className="grid-row">
                        {renderRow(bottomNumber, offset, false)}
                    </div>

                    {/* Visual Guide Line */}
                    <div className="guide-line" style={{ left: `calc(var(--cell-size) * ${4 + getDecimalIndex(topNumber)} + var(--cell-size) / 2)` }}></div>
                </div>

                {gameState === 'playing' && (
                    <div className="controls">
                        <button className="btn btn-secondary shift-btn" onClick={() => handleShift(-1)}>{t('shiftLeft')}</button>
                        <button className="btn btn-primary check-btn" onClick={checkAlignment}>{t('check')}</button>
                        <button className="btn btn-secondary shift-btn" onClick={() => handleShift(1)}>{t('shiftRight')}</button>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('perfect')}</h2>
                        <p>{t('ready')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('misaligned')}</h2>
                        <p>
                            {t('tip')}
                        </p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.tryAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StackAlignGame;
