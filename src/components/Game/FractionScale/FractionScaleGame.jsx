import React, { useState, useEffect } from 'react';
// Reuse CSS from ScaleExplorer
import '../ScaleExplorer/ScaleExplorerGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const FractionScaleGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('fraction-scale');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.fractionScale.', '').replace('game.dimension.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
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

    const getFractionDisplay = () => {
        // Decompose targetNumber into integer + fractions
        const intPart = Math.floor(targetNumber);
        const decimalPart = targetNumber - intPart;

        const tens = Math.floor(intPart / 10) * 10;
        const ones = intPart % 10;

        const tenths = Math.floor(decimalPart * 10);
        const hundredths = Math.floor((decimalPart * 100) % 10);
        const thousandths = Math.floor((decimalPart * 1000) % 10);

        const parts = [];
        if (tens > 0) parts.push(`${tens}`);
        if (ones > 0 || tens === 0) parts.push(`${ones}`);
        if (tenths > 0) parts.push(`${tenths}/10`);
        if (hundredths > 0) parts.push(`${hundredths}/100`);
        if (thousandths > 0) parts.push(`${thousandths}/1000`);

        return parts.join(' + ');
    };

    const handleSegmentClick = (start, end) => {
        if (gameState !== 'playing') return;

        if (targetNumber >= start && targetNumber <= end) {
            setViewRange({ min: start, max: end });
            setZoomLevel(prev => prev + 1);
        } else {
            alert(t('lookCloser')); // Keep alert or use toast
            if (isTestMode && onTestComplete) {
                // Strict fail on wrong zoom choice?
                // Probably yes.
                onTestComplete(false);
            }
        }
    };

    const handleTickClick = (val) => {
        if (gameState !== 'playing') return;

        if (Math.abs(val - targetNumber) < 0.0001) {
            if (isTestMode && onTestComplete) {
                setGameState('won');
                setTimeout(() => onTestComplete(true), 1500);
                return;
            }

            if (currentLevel === 5) { // Assuming 5 levels
                setGameState('won');
                winGame(25);
            } else {
                setGameState('won');
                setTimeout(() => {
                    completeLevel(currentLevel + 1, progress.score + 10);
                }, 1500);
            }
        } else {
            if (isTestMode && onTestComplete) {
                // Wrong tick
                onTestComplete(false);
            }
        }
    };

    const renderTicks = () => {
        const ticks = [];
        const rangeSize = viewRange.max - viewRange.min;
        const step = rangeSize / 10;

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

                    // Custom Fraction Labels
                    let label = `${labelVal}`;
                    if (zoomLevel === 2) { // Tenths
                        const int = Math.floor(labelVal);
                        const frac = Math.round((labelVal - int) * 10);
                        if (frac === 0) label = `${int}`;
                        else if (frac === 10) label = `${int + 1}`;
                        else label = `${int} ${frac}/10`;
                    }
                    else if (zoomLevel === 3) { // Hundredths
                        const int = Math.floor(labelVal);
                        const frac = Math.round((labelVal - int) * 100);
                        if (frac === 0) label = `${int}`;
                        else label = `${int} ${frac}/100`;
                    }

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
                            <div className="tick-label" style={{ fontSize: zoomLevel > 1 ? '0.7rem' : '0.9rem', whiteSpace: 'nowrap' }}>
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
                    {t('target')} {getFractionDisplay()}
                </div>

                <div className="instruction-text">
                    {t('instruction')}
                </div>

                <div className="scale-container">
                    <div className="scientific-label">
                        {zoomLevel === 0 && t('tens')}
                        {zoomLevel === 1 && t('ones')}
                        {zoomLevel === 2 && t('tenths')}
                        {zoomLevel === 3 && t('hundredths')}
                        {zoomLevel === 4 && t('thousandths')}
                    </div>
                    {renderTicks()}
                </div>

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('found')}</h2>
                        <p>{t('pieced')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FractionScaleGame;
