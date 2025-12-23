import React, { useState, useEffect } from 'react';
import './PercentPotionGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const PercentPotionGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('percent-potion');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const [levelData, setLevelData] = useState(null);
    const [phase, setPhase] = useState('select-pair'); // select-pair, show-product, select-loner, solve
    const [selectedCells, setSelectedCells] = useState([]);
    const [product, setProduct] = useState(null);
    const [loner, setLoner] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [gameState, setGameState] = useState('intro'); // intro, playing, won, lost
    const [introStep, setIntroStep] = useState(0);

    useEffect(() => {
        if (gameState === 'playing') {
            startLevel();
        }
    }, [progress.level, gameState]);

    const startLevel = () => {
        // Generate Problem
        // Types:
        // 1. Find Part: Part = (Whole * %) / 100
        // 2. Find Percent: % = (Part * 100) / Whole
        // 3. Find Whole: Whole = (Part * 100) / %

        const type = progress.level <= 5 ? 'find-part' :
            progress.level <= 10 ? 'find-percent' : 'find-whole';

        let whole, percent, part;

        // Generate nice numbers
        if (type === 'find-part') {
            whole = Math.floor(Math.random() * 20) * 10 + 10; // 10, 20... 200
            percent = Math.floor(Math.random() * 10) * 10 + 10; // 10, 20... 100
            part = (whole * percent) / 100;
        } else if (type === 'find-percent') {
            whole = Math.floor(Math.random() * 10) * 10 + 50; // 50... 150
            percent = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
            part = (whole * percent) / 100;
        } else {
            // Find Whole
            part = Math.floor(Math.random() * 10) * 5 + 5;
            percent = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
            whole = (part * 100) / percent;
        }

        // Grid Layout:
        // [ Part ] [ % ]
        // [ Whole] [ 100 ]
        // But we need to map them to TL, TR, BL, BR
        // Let's stick to standard Proportion Table:
        // Part / Whole = % / 100
        // Col 1: Values, Col 2: Percents
        // TL: Part, TR: %
        // BL: Whole, BR: 100

        const cells = [
            { id: 'tl', val: part, label: t('part'), isTarget: type === 'find-part' },
            { id: 'tr', val: percent, label: t('percent'), isTarget: type === 'find-percent' },
            { id: 'bl', val: whole, label: t('whole'), isTarget: type === 'find-whole' },
            { id: 'br', val: 100, label: t('base'), isTarget: false }
        ];

        setLevelData({ type, cells, whole, percent, part });
        setPhase('select-pair');
        setSelectedCells([]);
        setProduct(null);
        setLoner(null);
        setUserAnswer('');
        setGameState('playing');
    };

    const handleCellClick = (cell) => {
        if (gameState !== 'playing') return;
        if (cell.isTarget) return; // Can't select the unknown

        if (phase === 'select-pair') {
            // Must select the diagonal pair of KNOWN numbers
            // Diagonals: TL-BR or TR-BL
            // We need to check if the clicked cell is part of the VALID diagonal
            // The valid diagonal is the one with NO target.

            const targetCell = levelData.cells.find(c => c.isTarget);
            const targetId = targetCell.id;

            // If target is TL, pair is TR-BL
            // If target is BR, pair is TR-BL (but BR is 100, never target usually?)
            // If target is TR, pair is TL-BR
            // If target is BL, pair is TL-BR

            let validPairIds = [];
            if (targetId === 'tl' || targetId === 'br') validPairIds = ['tr', 'bl'];
            else validPairIds = ['tl', 'br'];

            if (!validPairIds.includes(cell.id)) return; // Wrong cell

            const newSelected = [...selectedCells, cell.id];
            setSelectedCells(newSelected);

            if (newSelected.length === 2) {
                // Check if they are the correct pair (they should be if we filtered clicks)
                // Calculate Product
                const val1 = levelData.cells.find(c => c.id === newSelected[0]).val;
                const val2 = levelData.cells.find(c => c.id === newSelected[1]).val;
                setProduct(val1 * val2);
                setTimeout(() => setPhase('show-product'), 500);
            }
        } else if (phase === 'select-loner') {
            // Must select the remaining known number
            if (selectedCells.includes(cell.id)) return; // Already selected

            setLoner(cell.val);
            setTimeout(() => setPhase('solve'), 500);
        }
    };

    const handleSolve = () => {
        const val = parseFloat(userAnswer);
        const correct = levelData.cells.find(c => c.isTarget).val;

        if (Math.abs(val - correct) < 0.1) {
            if (progress.level === 15) {
                setGameState('won');
                winGame(30);
            } else {
                completeLevel(progress.level + 1, progress.score + 10);
            }
        } else {
            setGameState('lost');
        }
    };

    const renderPotion = () => {
        // Simple SVG Potion
        // Fill level depends on phase? Or just static?
        // Let's make it fill up as we progress phases
        let fill = 20;
        if (phase === 'show-product') fill = 50;
        if (phase === 'select-loner') fill = 50;
        if (phase === 'solve') fill = 80;
        if (gameState === 'won') fill = 100;

        return (
            <svg width="100" height="120" viewBox="0 0 100 120" className="potion-visual">
                <defs>
                    <linearGradient id="liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#7e22ce" />
                    </linearGradient>
                </defs>
                {/* Flask Body */}
                <path d="M30,0 L70,0 L70,30 L90,110 A10,10 0 0,1 80,120 L20,120 A10,10 0 0,1 10,110 L30,30 Z"
                    fill="rgba(255,255,255,0.2)" stroke="#475569" strokeWidth="3" />

                {/* Liquid */}
                <path d={`M30,${120 - fill} L70,${120 - fill} L90,110 A10,10 0 0,1 80,120 L20,120 A10,10 0 0,1 10,110 Z`}
                    fill="url(#liquid)" style={{ transition: 'd 1s ease' }} />

                {/* Bubbles */}
                {gameState === 'playing' && (
                    <circle cx="50" cy="100" r="3" fill="rgba(255,255,255,0.6)">
                        <animate attributeName="cy" from="100" to="40" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                )}
            </svg>
        );
    };

    const renderIntro = () => {
        // Intro Steps:
        // 0: Welcome
        // 1: Problem (20% of 500)
        // 2: The Table (Part/Whole = %/100)
        // 3: Diagonal (500 * 20)
        // 4: Product (10000)
        // 5: Loner (100)
        // 6: Result (100)

        const nextStep = () => {
            if (introStep < 6) setIntroStep(prev => prev + 1);
            else setGameState('playing');
        };

        return (
            <div className="percent-potion-container intro-mode">
                <h2>⚗️ Alchemist Training</h2>

                <div className="step-instruction" style={{ minHeight: '4rem' }}>
                    {introStep === 0 && t('intro0')}
                    {introStep === 1 && t('intro1')}
                    {introStep === 2 && t('intro2')}
                    {introStep === 3 && t('intro3')}
                    {introStep === 4 && t('intro4')}
                    {introStep === 5 && t('intro5')}
                    {introStep === 6 && t('intro6')}
                </div>

                {(introStep >= 2) && (
                    <div className="potion-grid" style={{ pointerEvents: 'none' }}>
                        <div className={`grid-cell ${introStep === 6 ? 'target' : ''}`}>
                            <span className="label">{t('part')}</span>
                            <span className="value">{introStep === 6 ? "100" : "?"}</span>
                        </div>
                        <div className={`grid-cell ${introStep >= 3 ? 'highlight-pair' : ''}`}>
                            <span className="label">{t('percent')}</span>
                            <span className="value">20</span>
                        </div>
                        <div className={`grid-cell ${introStep >= 3 ? 'highlight-pair' : ''}`}>
                            <span className="label">{t('whole')}</span>
                            <span className="value">500</span>
                        </div>
                        <div className={`grid-cell ${introStep === 5 ? 'highlight-loner' : ''}`}>
                            <span className="label">{t('base')}</span>
                            <span className="value">100</span>
                        </div>
                    </div>
                )}

                {introStep < 2 && (
                    <div className="potion-visual" style={{ marginBottom: '20px' }}>
                        <svg width="100" height="120" viewBox="0 0 100 120">
                            <path d="M30,0 L70,0 L70,30 L90,110 A10,10 0 0,1 80,120 L20,120 A10,10 0 0,1 10,110 L30,30 Z"
                                fill="rgba(255,255,255,0.2)" stroke="#475569" strokeWidth="3" />
                            <text x="50" y="80" textAnchor="middle" fill="#a855f7" fontSize="20" fontWeight="bold">500ml</text>
                        </svg>
                    </div>
                )}

                <button className="btn btn-primary" onClick={nextStep}>
                    {introStep < 6 ? t('next') : t('startBrewing')}
                </button>
            </div>
        );
    };

    if (gameState === 'intro') {
        return (
            <div className="game-container fade-in">
                <div className="game-header">
                    <button onClick={onBack} className="btn-icon">←</button>
                    <h1>{t('title')}</h1>
                </div>
                {renderIntro()}
            </div>
        );
    }

    if (!levelData) return <div>Loading...</div>;

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/15</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="percent-potion-container">
                {renderPotion()}

                <div className="step-instruction">
                    {phase === 'select-pair' && t('step1')}
                    {phase === 'show-product' && t('mixing')}
                    {phase === 'select-loner' && t('step2')}
                    {phase === 'solve' && t('finalStep')}
                </div>

                <div className="potion-grid">
                    {levelData.cells.map(cell => {
                        const isSelected = selectedCells.includes(cell.id);
                        const isLoner = loner === cell.val;
                        const isTarget = cell.isTarget;

                        let classes = "grid-cell";
                        if (isTarget) classes += " target";
                        else if (isSelected) classes += " highlight-pair";
                        else if (isLoner) classes += " highlight-loner";
                        else classes += " selectable";

                        return (
                            <div
                                key={cell.id}
                                className={classes}
                                onClick={() => handleCellClick(cell)}
                            >
                                <span className="label">{cell.label}</span>
                                <span className="value">{isTarget ? "?" : cell.val}</span>
                            </div>
                        );
                    })}

                    {/* SVG Arrows for Cross Multiply Visual could go here */}
                </div>

                {phase === 'show-product' && (
                    <div className="math-operation-display fade-in">
                        {levelData.cells.find(c => c.id === selectedCells[0]).val} × {levelData.cells.find(c => c.id === selectedCells[1]).val} = <strong>{product}</strong>
                        <br />
                        <button className="btn btn-primary" style={{ marginTop: '10px' }} onClick={() => setPhase('select-loner')}>{t('next')}</button>
                    </div>
                )}

                {phase === 'solve' && (
                    <div className="math-operation-display fade-in">
                        {product} ÷ {loner} = ?
                    </div>
                )}

                {phase === 'solve' && gameState === 'playing' && (
                    <div className="input-area">
                        <input
                            type="number"
                            className="potion-input"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="?"
                            autoFocus
                        />
                        <button className="btn btn-primary" onClick={handleSolve}>{t('mix')}</button>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="result-card success fade-in">
                        <h2>{t('wonTitle')}</h2>
                        <p>{t('wonDesc')}</p>
                        <button className="btn btn-primary" onClick={() => completeLevel(1, 0)}>{t('nextPotion')}</button>
                    </div>
                )}

                {gameState === 'lost' && (
                    <div className="result-card error fade-in">
                        <h2>{t('lostTitle')}</h2>
                        <p>{t('lostDesc')}</p>
                        <p>{t('correctAnswer').replace('{val}', levelData.cells.find(c => c.isTarget).val)}</p>
                        <button className="btn btn-primary" onClick={() => { setGameState('intro'); setIntroStep(0); completeLevel(1, 0); }}>{t('tryAgain')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PercentPotionGame;
