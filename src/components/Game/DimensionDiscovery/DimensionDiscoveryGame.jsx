import React, { useState, useEffect } from 'react';
import './DimensionDiscoveryGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const ShapeIcon = ({ type }) => {
    const commonProps = {
        width: "100",
        height: "100",
        viewBox: "0 0 100 100",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "4",
        strokeLinecap: "round",
        strokeLinejoin: "round"
    };

    switch (type) {
        case 'Line Segment':
            return (
                <svg {...commonProps}>
                    <circle cx="10" cy="50" r="4" fill="currentColor" />
                    <line x1="10" y1="50" x2="90" y2="50" />
                    <circle cx="90" cy="50" r="4" fill="currentColor" />
                </svg>
            );
        case 'Ray':
            return (
                <svg {...commonProps}>
                    <circle cx="10" cy="50" r="4" fill="currentColor" />
                    <line x1="10" y1="50" x2="85" y2="50" />
                    <path d="M 85 45 L 95 50 L 85 55" fill="currentColor" stroke="none" />
                </svg>
            );
        case 'Square':
            return (
                <svg {...commonProps}>
                    <rect x="20" y="20" width="60" height="60" />
                </svg>
            );
        case 'Circle':
            return (
                <svg {...commonProps}>
                    <circle cx="50" cy="50" r="35" />
                </svg>
            );
        case 'Triangle':
            return (
                <svg {...commonProps}>
                    <polygon points="50,15 85,80 15,80" />
                </svg>
            );
        case 'Cube':
            return (
                <svg {...commonProps}>
                    <rect x="25" y="35" width="40" height="40" />
                    <path d="M 25 35 L 45 15 L 85 15 L 65 35" />
                    <path d="M 85 15 L 85 55 L 65 75" />
                    <path d="M 65 35 L 65 75" strokeDasharray="4 4" opacity="0.5" />
                    <path d="M 25 75 L 65 75" />
                </svg>
            );
        case 'Sphere':
            return (
                <svg {...commonProps}>
                    <circle cx="50" cy="50" r="35" />
                    <ellipse cx="50" cy="50" rx="35" ry="10" opacity="0.3" />
                    <path d="M 50 15 Q 70 30 50 85" opacity="0.3" fill="none" />
                </svg>
            );
        case 'Cylinder':
            return (
                <svg {...commonProps}>
                    <ellipse cx="50" cy="20" rx="30" ry="10" />
                    <line x1="20" y1="20" x2="20" y2="80" />
                    <line x1="80" y1="20" x2="80" y2="80" />
                    <path d="M 20 80 A 30 10 0 0 0 80 80" />
                    <path d="M 20 80 A 30 10 0 0 1 80 80" strokeDasharray="4 4" opacity="0.5" />
                </svg>
            );
        case 'Point':
            return (
                <svg {...commonProps}>
                    <circle cx="50" cy="50" r="6" fill="currentColor" />
                </svg>
            );
        case 'Rectangle':
            return (
                <svg {...commonProps}>
                    <rect x="15" y="30" width="70" height="40" />
                </svg>
            );
        case 'Cone':
            return (
                <svg {...commonProps}>
                    <ellipse cx="50" cy="80" rx="30" ry="10" />
                    <line x1="20" y1="80" x2="50" y2="15" />
                    <line x1="80" y1="80" x2="50" y2="15" />
                </svg>
            );
        case 'Pyramid':
            return (
                <svg {...commonProps}>
                    <polygon points="50,15 15,75 85,75" />
                    <line x1="50" y1="15" x2="50" y2="75" strokeDasharray="4 4" opacity="0.5" />
                    <path d="M 15 75 L 40 85 L 85 75" fill="none" />
                    <line x1="50" y1="15" x2="40" y2="85" />
                </svg>
            );
        default:
            return null;
    }
};

const SHAPES = [
    { id: 1, name: 'Line Segment', type: '1D' },
    { id: 2, name: 'Ray', type: '1D' },
    { id: 3, name: 'Square', type: '2D' },
    { id: 4, name: 'Circle', type: '2D' },
    { id: 5, name: 'Triangle', type: '2D' },
    { id: 6, name: 'Cube', type: '3D' },
    { id: 7, name: 'Sphere', type: '3D' },
    { id: 8, name: 'Cylinder', type: '3D' },
    { id: 9, name: 'Point', type: '0D' },
    { id: 10, name: 'Rectangle', type: '2D' },
    { id: 11, name: 'Cone', type: '3D' },
    { id: 12, name: 'Pyramid', type: '3D' },
];

// Filter to only 1D, 2D, 3D for the main game loop
const GAME_SHAPES = SHAPES.filter(s => ['1D', '2D', '3D'].includes(s.type));

const DimensionDiscoveryGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('dimension-discovery');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        // Check local keys first (without prefix), then global keys
        const localKey = key.replace('game.dimension.', '').replace('game.placeValue.', ''); // Handle legacy keys
        return dict[localKey] || globalT(key);
    };

    const [currentShape, setCurrentShape] = useState(null);
    const [gameState, setGameState] = useState('playing'); // playing, won, lost

    useEffect(() => {
        startLevel();
    }, [progress.level]);

    const startLevel = () => {
        const randomShape = GAME_SHAPES[Math.floor(Math.random() * GAME_SHAPES.length)];
        setCurrentShape(randomShape);
        setGameState('playing');
    };

    const handleChoice = (choice) => {
        if (gameState !== 'playing') return;

        if (choice === currentShape.type) {
            if (progress.level === 10) {
                setGameState('won');
                winGame(20); // 10 levels + 10 bonus
            } else {
                completeLevel(progress.level + 1, progress.level); // Score = level number
            }
        } else {
            setGameState('lost');
        }
    };

    const resetGame = () => {
        startLevel();
        setGameState('playing');
    };

    if (!currentShape) return <div>Loading...</div>;

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/10</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="game-area">
                {gameState === 'playing' && (
                    <div className="shape-display fade-in">
                        <div className="shape-icon-svg">
                            <ShapeIcon type={currentShape.name} />
                        </div>
                        <div className="shape-name">{currentShape.name}</div>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('victory')}</h2>
                        <p>{t('mastered')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.play')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('gameOver')}</h2>
                        <p>{t('was').replace('{shape}', currentShape.type)}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('btn.tryAgain')}</button>
                    </div>
                )}
            </div>

            {gameState === 'playing' && (
                <div className="choices-grid">
                    {['1D', '2D', '3D'].map(type => (
                        <button
                            key={type}
                            className="btn btn-lg choice-btn"
                            onClick={() => handleChoice(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DimensionDiscoveryGame;
