import React, { useState, useEffect } from 'react';
import './RuleOfThreeGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const RuleOfThreeGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('rule-of-three');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    // Game State
    // phases: 'select-pair' | 'show-product' | 'select-loner' | 'solve' | 'feedback'
    const [phase, setPhase] = useState('select-pair');
    const [tableData, setTableData] = useState({ a: 0, b: 0, c: 0, d: 0 });
    const [targetKey, setTargetKey] = useState('d'); // 'a', 'b', 'c', or 'd'
    const [selectedCells, setSelectedCells] = useState([]);
    const [lonerCell, setLonerCell] = useState(null);
    const [userInput, setUserInput] = useState('');

    // Logic State
    const [diagonalProduct, setDiagonalProduct] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState(0);

    useEffect(() => {
        startLevel();
    }, [progress.level]);

    const startLevel = () => {
        // Generate numbers based on level
        // Level 1-10: Simple tables (2, 4, 3, 6)
        // Level 11+: More complex

        let base = Math.floor(Math.random() * 10) + 2;
        let factor = Math.floor(Math.random() * 5) + 2;
        let scale = Math.floor(Math.random() * 3) + 2;

        // Construct valid proportion: a/b = c/d
        // a * d = b * c
        let a = base;
        let b = base * factor;
        let c = a * scale;
        let d = b * scale;

        // Randomly hide one cell
        const keys = ['a', 'b', 'c', 'd'];
        const target = keys[Math.floor(Math.random() * 4)];

        setTableData({ a, b, c, d });
        setTargetKey(target);
        setCorrectAnswer({ a, b, c, d }[target]);

        // Reset State
        setPhase('select-pair');
        setSelectedCells([]);
        setLonerCell(null);
        setUserInput('');
    };

    const handleCellClick = (key) => {
        if (key === targetKey) return; // Can't select the empty cell

        if (phase === 'select-pair') {
            // User needs to select the two known numbers that are diagonal
            // Diagonals: (a, d) and (b, c)

            // If we already have 2, reset?
            if (selectedCells.length >= 2) {
                setSelectedCells([key]);
                return;
            }

            const newSelection = [...selectedCells, key];
            setSelectedCells(newSelection);

            if (newSelection.length === 2) {
                // Check if they are a diagonal pair
                const [k1, k2] = newSelection.sort();
                const isDiagonal1 = (k1 === 'a' && k2 === 'd');
                const isDiagonal2 = (k1 === 'b' && k2 === 'c');

                if (isDiagonal1 || isDiagonal2) {
                    // Correct pair!
                    const val1 = tableData[k1];
                    const val2 = tableData[k2];
                    setDiagonalProduct(val1 * val2);

                    setTimeout(() => {
                        setPhase('show-product');
                    }, 500);
                } else {
                    // Invalid pair
                    setTimeout(() => {
                        alert(t('invalidPair'));
                        setSelectedCells([]);
                    }, 500);
                }
            }
        } else if (phase === 'select-loner') {
            // User must select the remaining known number
            if (selectedCells.includes(key)) return; // Already part of the pair

            setLonerCell(key);
            setTimeout(() => {
                setPhase('solve');
            }, 500);
        }
    };

    const handleSolve = () => {
        const val = parseFloat(userInput);
        if (Math.abs(val - correctAnswer) < 0.01) {
            if (progress.level === 50) {
                winGame(50);
            } else {
                completeLevel(progress.level + 1, progress.score + 10);
            }
        } else {
            alert(t('checkMath').replace('{product}', diagonalProduct).replace('{loner}', tableData[lonerCell]));
        }
    };

    const getInstruction = () => {
        switch (phase) {
            case 'select-pair': return t('step1');
            case 'show-product': return t('showProduct');
            case 'select-loner': return t('step2');
            case 'solve': return t('step3');
            default: return "";
        }
    };

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/50</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="rule-of-three-container">
                <div className="instruction-panel">
                    <div className="step-indicator">
                        <div className={`step-dot ${phase === 'select-pair' ? 'active' : ''} ${phase !== 'select-pair' ? 'completed' : ''}`}></div>
                        <div className={`step-dot ${phase === 'select-loner' ? 'active' : ''} ${['solve', 'feedback'].includes(phase) ? 'completed' : ''}`}></div>
                        <div className={`step-dot ${phase === 'solve' ? 'active' : ''}`}></div>
                    </div>
                    <p className="instruction-text">{getInstruction()}</p>

                    {phase === 'show-product' && (
                        <div className="formula-display fade-in">
                            {tableData[selectedCells[0]]} × {tableData[selectedCells[1]]} = {diagonalProduct}
                            <div style={{ marginTop: '10px' }}>
                                <button className="btn btn-primary" onClick={() => setPhase('select-loner')}>{t('nextStep')}</button>
                            </div>
                        </div>
                    )}

                    {phase === 'solve' && (
                        <div className="formula-display fade-in">
                            {diagonalProduct} ÷ {tableData[lonerCell]} = ?
                        </div>
                    )}
                </div>

                <div className="rot-grid">
                    {['a', 'b', 'c', 'd'].map(key => (
                        <div
                            key={key}
                            className={`rot-cell 
                                ${key === targetKey ? 'target' : ''} 
                                ${selectedCells.includes(key) ? 'selected' : ''}
                                ${key === lonerCell ? 'loner-selected' : ''}
                            `}
                            onClick={() => handleCellClick(key)}
                        >
                            {key === targetKey ? (
                                phase === 'solve' ? (
                                    <input
                                        type="number"
                                        className="solve-input"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
                                        autoFocus
                                    />
                                ) : '?'
                            ) : tableData[key]}
                        </div>
                    ))}

                    {/* Visual Diagonal Line when pair selected */}
                    {selectedCells.length === 2 && (
                        <svg className="diagonal-line-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            {/* We would need coordinates for this, but CSS highlighting is probably enough for now. 
                                Let's keep it simple with CSS 'selected' class.
                            */}
                        </svg>
                    )}
                </div>

                {phase === 'solve' && (
                    <button className="btn btn-primary fade-in" onClick={handleSolve}>{t('checkAnswer')}</button>
                )}
            </div>
        </div>
    );
};

export default RuleOfThreeGame;
