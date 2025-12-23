import React, { useState, useEffect } from 'react';
import './ScaleExplorerGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const ScaleExplorerGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('scale-explorer');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const [targetNumber, setTargetNumber] = useState(0);
    const [viewRange, setViewRange] = useState({ min: 0, max: 100 });
    const [zoomLevel, setZoomLevel] = useState(0); // 0: Tens, 1: Ones, 2: Tenths, 3: Hundredths
    const [gameState, setGameState] = useState('playing');

    useEffect(() => {
        startLevel();
    }, [progress.level]);

    const startLevel = () => {
        // Level 1: Integer (e.g., 42) -> Zoom 0 to 1
        // Level 2: 1 Decimal (e.g., 42.5) -> Zoom 0 to 2
        // Level 3: 2 Decimals (e.g., 42.53) -> Zoom 0 to 3
        // Level 4: 3 Decimals (e.g., 42.531) -> Zoom 0 to 4
        // Level 5: Chaos (Random large number + decimals)

        let decimals = 0;
        if (progress.level === 2) decimals = 1;
        if (progress.level === 3) decimals = 2;
        if (progress.level >= 4) decimals = 3;

        // Generate target
        let num = Math.random() * 100;
        if (progress.level === 1) num = Math.floor(num);
        else num = parseFloat(num.toFixed(decimals));

        setTargetNumber(num);
        setViewRange({ min: 0, max: 100 });
        setZoomLevel(0);
        setGameState('playing');
    };

    const getPowerLabel = () => {
        // 0-100 (Tens) -> 10^1
        // 20-30 (Ones) -> 10^0
        // 28-29 (Tenths) -> 10^-1
        // 28.5-28.6 (Hundredths) -> 10^-2

        const power = 1 - zoomLevel;
        return t('scale').replace('{power}', power);
    };

    const handleSegmentClick = (start, end) => {
        if (gameState !== 'playing') return;

        // Check if target is within this range
        if (targetNumber >= start && targetNumber <= end) {
            // Zoom in!
            setViewRange({ min: start, max: end });
            setZoomLevel(prev => prev + 1);

            // Check win condition
            // If we are deep enough to isolate the number
            // Level 1: Zoom 1 (Range size 10) -> Click specific integer? 
            // Actually, let's say we win when the range size matches the precision needed.

            // Current Range Size = end - start
            // Level 1 (Integer): Need range size 1 (e.g. 42-43? No, exact number)
            // Let's make the last step clicking the exact tick mark.
        } else {
            // Wrong segment
            // Shake effect or feedback?
            // For now, just simple feedback
            alert(t('lookCloser'));
        }
    };

    const handleTickClick = (val) => {
        if (gameState !== 'playing') return;

        // Floating point comparison tolerance
        if (Math.abs(val - targetNumber) < 0.0001) {
            if (progress.level === 5) {
                setGameState('won');
                winGame(25);
            } else {
                setGameState('won'); // Temporary state
                setTimeout(() => {
                    completeLevel(progress.level + 1, progress.score + 10);
                }, 1500);
            }
        }
    };

    const renderTicks = () => {
        const ticks = [];
        const rangeSize = viewRange.max - viewRange.min;
        const step = rangeSize / 10;

        for (let i = 0; i <= 10; i++) {
            const val = viewRange.min + (step * i);
            // Fix floating point uglyness
            const label = parseFloat(val.toFixed(4));

            // Determine if this is a segment or a point
            // If we are at the target precision, we click ticks.
            // Otherwise we click segments between ticks.

            let isTargetPrecision = false;
            if (progress.level === 1 && zoomLevel === 1) isTargetPrecision = true; // Integers, range is 10 (0-10), step is 1.
            if (progress.level === 2 && zoomLevel === 2) isTargetPrecision = true; // 1 dec, range 1, step 0.1
            if (progress.level === 3 && zoomLevel === 3) isTargetPrecision = true;
            if (progress.level >= 4 && zoomLevel === 4) isTargetPrecision = true;

            ticks.push(
                <div key={i} className="tick-wrapper" style={{ position: 'absolute', left: `${i * 10}%` }}>
                    <div
                        className="tick-mark"
                        onClick={() => isTargetPrecision && handleTickClick(label)}
                        style={{ background: isTargetPrecision && Math.abs(label - targetNumber) < 0.0001 ? '#10b981' : '' }}
                    ></div>
                    <div className="tick-label">{label}</div>

                    {/* Segment Area (between this and next) */}
                    {!isTargetPrecision && i < 10 && (
                        <div
                            className="tick-segment"
                            style={{ width: '100%', left: '0' }} // Actually this needs to be absolute relative to parent line
                            onClick={() => handleSegmentClick(val, val + step)}
                        ></div>
                    )}
                </div>
            );
        }

        // Render segments properly
        // The above loop structure is tricky for segments. 
        // Let's just render ticks, and put segments in between.
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
                            title={`Zoom into ${parseFloat(val.toFixed(4))} - ${parseFloat(nextVal.toFixed(4))}`}
                        />
                    );
                })}

                {/* Ticks */}
                {Array.from({ length: 11 }).map((_, i) => {
                    const val = viewRange.min + (step * i);
                    const label = parseFloat(val.toFixed(4));

                    let isTargetPrecision = false;
                    if (progress.level === 1 && zoomLevel === 1) isTargetPrecision = true;
                    if (progress.level === 2 && zoomLevel === 2) isTargetPrecision = true;
                    if (progress.level === 3 && zoomLevel === 3) isTargetPrecision = true;
                    if (progress.level >= 4 && zoomLevel === 4) isTargetPrecision = true;

                    return (
                        <div key={`tick-${i}`} style={{ position: 'absolute', left: `${i * 10}%`, transform: 'translateX(-50%)' }}>
                            <div
                                className="tick-mark"
                                onClick={() => isTargetPrecision && handleTickClick(label)}
                                style={{
                                    height: isTargetPrecision ? '30px' : '20px',
                                    background: isTargetPrecision ? '#ef4444' : '#334155'
                                }}
                            />
                            <div className="tick-label">{label}</div>
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
                    {t('target').replace('{number}', targetNumber)}
                </div>

                <div className="instruction-text">
                    {zoomLevel === 0 && t('start')}
                    {zoomLevel > 0 && t('zoom')}
                </div>

                <div className="scale-container">
                    <div className="scientific-label">{getPowerLabel()}</div>
                    {renderTicks()}
                </div>

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('foundIt')}</h2>
                        <p>{t('precision')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('playAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScaleExplorerGame;
