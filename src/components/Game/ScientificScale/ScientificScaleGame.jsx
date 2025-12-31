import React, { useState, useEffect } from 'react';
// Reuse CSS from ScaleExplorer
import '../ScaleExplorer/ScaleExplorerGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const ScientificScaleGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('scientific-scale');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const [targetNumber, setTargetNumber] = useState(0);
    const [viewRange, setViewRange] = useState({ min: 0, max: 100 });
    const [zoomLevel, setZoomLevel] = useState(0);
    const [gameState, setGameState] = useState('playing');

    const currentLevel = isTestMode ? testLevel : progress.level;

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const startLevel = () => {
        let decimals = 0;
        if (currentLevel === 2) decimals = 1;
        if (currentLevel === 3) decimals = 2;
        if (currentLevel >= 4) decimals = 3;

        let num = Math.random() * 100;
        if (currentLevel === 1) num = Math.floor(num);
        else num = parseFloat(num.toFixed(decimals));

        setTargetNumber(num);
        setViewRange({ min: 0, max: 100 });
        setZoomLevel(0);
        setGameState('playing');
    };

    const getScientificLabel = () => {
        // Target display in scientific notation
        return targetNumber.toExponential(2).replace('e+', ' × 10^').replace('e-', ' × 10^-');
    };

    const handleSegmentClick = (start, end) => {
        if (gameState !== 'playing') return;

        if (targetNumber >= start && targetNumber <= end) {
            setViewRange({ min: start, max: end });
            setZoomLevel(prev => prev + 1);
        } else {
            alert(t('lookCloser'));
            if (isTestMode && onTestComplete) {
                onTestComplete(false);
            }
        }
    };

    const handleTickClick = (val) => {
        if (gameState !== 'playing') return;

        if (Math.abs(val - targetNumber) < 0.0001) {
            if (isTestMode && onTestComplete) {
                setGameState('won');
                setTimeout(() => onTestComplete(true), 1000);
                return;
            }

            if (currentLevel === 5) {
                setGameState('won');
                winGame(25);
            } else {
                setGameState('won');
                setTimeout(() => {
                    completeLevel(currentLevel + 1, progress.score + 10);
                }, 1500);
            }
        }
    };

    const renderTicks = () => {
        const ticks = [];
        const rangeSize = viewRange.max - viewRange.min;
        const step = rangeSize / 10;

        // Determine current power of 10 for the scale
        // Zoom 0 (0-100): Tens (10^1)
        // Zoom 1 (20-30): Ones (10^0)
        // Zoom 2 (28-29): Tenths (10^-1)
        const currentPower = 1 - zoomLevel;

        return (
            <div className="number-line">
                {/* Segments */}
                {Array.from({ length: 10 }).map((_, i) => {
                    const val = viewRange.min + (step * i);
                    const nextVal = val + step;

                    let isTargetPrecision = false;
                    if (progress.level === 1 && zoomLevel === 1) isTargetPrecision = true;
                    if (progress.level === 2 && zoomLevel === 2) isTargetPrecision = true;
                    if (progress.level === 3 && zoomLevel === 3) isTargetPrecision = true;
                    if (progress.level >= 4 && zoomLevel === 4) isTargetPrecision = true;

                    if (isTargetPrecision) return null;

                    return (
                        <div
                            key={`seg-${i}`}
                            className="tick-segment"
                            style={{
                                left: `${i * 10}%`,
                                width: '10%',
                                top: '-20px', bottom: '-20px'
                            }}
                            onClick={() => handleSegmentClick(val, nextVal)}
                        />
                    );
                })}

                {/* Ticks */}
                {Array.from({ length: 11 }).map((_, i) => {
                    const val = viewRange.min + (step * i);
                    const labelVal = parseFloat(val.toFixed(4));

                    // Format label in scientific notation relative to the current scale?
                    // Or just standard scientific notation?
                    // Let's use standard scientific notation for consistency
                    const label = labelVal === 0 ? "0" : labelVal.toExponential(1).replace('e+', '×10^').replace('e-', '×10^-');

                    let isTargetPrecision = false;
                    if (progress.level === 1 && zoomLevel === 1) isTargetPrecision = true;
                    if (progress.level === 2 && zoomLevel === 2) isTargetPrecision = true;
                    if (progress.level === 3 && zoomLevel === 3) isTargetPrecision = true;
                    if (progress.level >= 4 && zoomLevel === 4) isTargetPrecision = true;

                    return (
                        <div key={`tick-${i}`} style={{ position: 'absolute', left: `${i * 10}%`, transform: 'translateX(-50%)' }}>
                            <div
                                className="tick-mark"
                                onClick={() => isTargetPrecision && handleTickClick(labelVal)}
                                style={{
                                    height: isTargetPrecision ? '30px' : '20px',
                                    background: isTargetPrecision ? '#ef4444' : '#334155'
                                }}
                            />
                            <div className="tick-label" style={{ fontSize: '0.7rem', transform: 'translateX(-50%) rotate(-45deg)', marginTop: '10px' }}>
                                {label}
                            </div>
                        </div>
                    );
                })}
            </div>
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

            <div className="scale-game-area">
                <div className="target-display">
                    {t('target').replace('{number}', getScientificLabel())}
                </div>

                <div className="instruction-text">
                    {t('start')}
                </div>

                <div className="scale-container">
                    <div className="scientific-label">{t('scale').replace('{power}', 1 - zoomLevel)}</div>
                    {renderTicks()}
                </div>

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('discovery')}</h2>
                        <p>{t('mastered')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('playAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScientificScaleGame;
