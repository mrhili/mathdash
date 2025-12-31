import React, { useState, useEffect } from 'react';
import './UnitMasterGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const UnitMasterGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { progress, completeLevel, winGame } = useGameState('unit-master');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.unitMaster.', '').replace('game.placeValue.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const currentLevel = isTestMode ? testLevel : progress.level;

    const [currentNumberStr, setCurrentNumberStr] = useState('');
    const [correctIndex, setCorrectIndex] = useState(-1);
    const [gameState, setGameState] = useState('playing'); // playing, won, lost

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const generateNumberForLevel = (lvl) => {
        let num;
        if (lvl <= 5) {
            // Integers: 1 to 999
            num = Math.floor(Math.random() * 999) + 1;
            return num.toString();
        } else if (lvl <= 10) {
            // Simple decimals: 1.1 to 99.9
            num = (Math.random() * 99).toFixed(1);
            return num;
        } else if (lvl <= 15) {
            // More complex decimals
            num = (Math.random() * 999).toFixed(2);
            return num;
        } else {
            // Tricky ones: 0.xxx, etc.
            if (Math.random() > 0.5) {
                num = (Math.random()).toFixed(3); // 0.123
            } else {
                num = (Math.random() * 10000).toFixed(2);
            }
            return num;
        }
    };

    const startLevel = () => {
        const numStr = generateNumberForLevel(currentLevel);
        setCurrentNumberStr(numStr);

        // Find correct index (Ones place)
        // If decimal exists, it's the char before '.'
        // If no decimal, it's the last char
        const decimalIndex = numStr.indexOf('.');
        let idx;
        if (decimalIndex !== -1) {
            idx = decimalIndex - 1;
        } else {
            idx = numStr.length - 1;
        }
        setCorrectIndex(idx);
        setGameState('playing');
    };

    const handleDigitClick = (index, char) => {
        if (gameState !== 'playing') return;

        // Ignore clicks on non-digits (like the decimal point)
        if (char === '.') return;

        if (index === correctIndex) {
            if (isTestMode && onTestComplete) {
                setGameState('won');
                setTimeout(() => onTestComplete(true), 1000);
                return;
            }

            if (currentLevel === 20) {
                setGameState('won');
                winGame(30);
            } else {
                completeLevel(currentLevel + 1, currentLevel);
            }
        } else {
            setGameState('lost');
            if (isTestMode && onTestComplete) {
                setTimeout(() => onTestComplete(false), 1500);
            }
        }
    };

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/20</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="game-area">
                <div className="instruction-text">
                    {t('instruction')} <strong>{t('unit')}</strong> {t('onesPlace')}
                </div>

                {gameState === 'playing' && (
                    <div className="number-display fade-in">
                        {currentNumberStr.split('').map((char, index) => (
                            <span
                                key={index}
                                className={`digit ${char === '.' ? 'decimal-point' : ''}`}
                                onClick={() => handleDigitClick(index, char)}
                            >
                                {char}
                            </span>
                        ))}
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('victory')}</h2>
                        <p>{t('youAreMaster')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('gameOver')}</h2>
                        <p>
                            {t('was')} <strong>{currentNumberStr}</strong>.<br />
                            {t('unitWas')} <strong>{currentNumberStr[correctIndex]}</strong>.
                        </p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.tryAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnitMasterGame;
