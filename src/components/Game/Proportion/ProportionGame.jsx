import React, { useState, useEffect } from 'react';
import './ProportionGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const ProportionGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('proportion-game');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    // Game State
    const [phase, setPhase] = useState('identify-relation');
    const [tableData, setTableData] = useState({
        a: 1, b: 100,
        c: null, d: 50
    });
    const [targetCell, setTargetCell] = useState('d');

    // Strategy State
    const [strategy, setStrategy] = useState('horizontal');
    const [direction, setDirection] = useState('forward');

    // User Inputs
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [factorInput, setFactorInput] = useState('');
    const [targetInput, setTargetInput] = useState('');

    // Logic
    const [relation, setRelation] = useState({ op: '*', val: 100 });

    useEffect(() => {
        startLevel();
    }, [progress.level]);

    const startLevel = () => {
        // 1. Decide Strategy
        const strategies = ['horizontal', 'vertical', 'cross'];
        let strat = strategies[Math.floor(Math.random() * (progress.level > 10 ? 3 : 2))];

        // 2. Decide Direction
        let dir = Math.random() > 0.5 ? 'forward' : 'reverse';
        if (strat === 'cross') dir = 'forward';

        setStrategy(strat);
        setDirection(dir);

        // 3. Generate Numbers
        let base = Math.floor(Math.random() * 10) + 1;
        let factor = Math.floor(Math.random() * 5) + 2;

        let a, b, c, d;

        if (strat === 'horizontal') {
            a = base;
            b = a * factor;

            let scale = Math.floor(Math.random() * 3) + 2;
            c = a * scale;
            d = b * scale;

            if (dir === 'reverse') {
                setRelation({ op: '/', val: factor });
            } else {
                setRelation({ op: '*', val: factor });
            }
        } else if (strat === 'vertical') {
            a = base;
            c = a * factor;

            let scale = Math.floor(Math.random() * 3) + 2;
            b = a * scale;
            d = c * scale;

            if (dir === 'reverse') {
                setRelation({ op: '/', val: factor });
            } else {
                setRelation({ op: '*', val: factor });
            }
        } else {
            // Cross Product
            a = Math.floor(Math.random() * 5) + 1;
            b = Math.floor(Math.random() * 5) + 1;
            let k = Math.floor(Math.random() * 3) + 2;
            c = a * k;
            d = b * k;
        }

        // 4. Hide a cell
        let target = 'd';

        if (strat === 'horizontal') {
            if (dir === 'forward') target = Math.random() > 0.5 ? 'b' : 'd';
            else target = Math.random() > 0.5 ? 'a' : 'c';
        } else if (strat === 'vertical') {
            if (dir === 'forward') target = Math.random() > 0.5 ? 'c' : 'd';
            else target = Math.random() > 0.5 ? 'a' : 'b';
        } else {
            target = 'd';
        }

        setTableData({ a, b, c, d });
        setTargetCell(target);

        setPhase(strat === 'cross' ? 'solve-target' : 'identify-relation');
        setSelectedOperator(null);
        setFactorInput('');
        setTargetInput('');
    };

    const checkRelation = () => {
        const val = parseFloat(factorInput);
        if (selectedOperator === relation.op && val === relation.val) {
            setPhase('solve-target');
        } else {
            alert(t('lookClosely'));
        }
    };

    const checkTarget = () => {
        const val = parseFloat(targetInput);
        const correct = tableData[targetCell];

        if (Math.abs(val - correct) < 0.01) {
            if (progress.level === 50) {
                winGame(50);
            } else {
                completeLevel(progress.level + 1, progress.score + 10);
            }
        } else {
            alert(t('notQuite'));
        }
    };

    // SVG Arrow Components
    const HorizontalArrow = ({ reverse, label }) => (
        <svg className="arrow-svg horizontal" viewBox="0 0 200 60">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
            </defs>
            <path
                d={reverse ? "M 180 30 L 20 30" : "M 20 30 L 180 30"}
                stroke="#64748b"
                strokeWidth="4"
                fill="none"
                markerEnd="url(#arrowhead)"
            />
            {label && (
                <g transform="translate(100, 20)">
                    <rect x="-30" y="-15" width="60" height="20" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontWeight="bold" fontSize="14">
                        {label}
                    </text>
                </g>
            )}
        </svg>
    );

    const VerticalArrow = ({ reverse, label }) => (
        <svg className="arrow-svg vertical" viewBox="0 0 60 200">
            <defs>
                <marker id="arrowhead-v" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
            </defs>
            <path
                d={reverse ? "M 30 180 L 30 20" : "M 30 20 L 30 180"}
                stroke="#64748b"
                strokeWidth="4"
                fill="none"
                markerEnd="url(#arrowhead-v)"
            />
            {label && (
                <g transform="translate(30, 100)">
                    <rect x="-25" y="-10" width="50" height="20" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
                    <text x="0" y="4" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontWeight="bold" fontSize="14">
                        {label}
                    </text>
                </g>
            )}
        </svg>
    );

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}/50</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="proportion-game-area">
                <div className="instruction-step">
                    {strategy === 'cross'
                        ? t('crossMultiply')
                        : (phase === 'identify-relation'
                            ? t('step1').replace('{strategy}', strategy)
                            : t('step2'))
                    }
                </div>

                <div className="proportion-grid-container">
                    {/* Horizontal Arrows */}
                    {strategy === 'horizontal' && (
                        <>
                            <div className="arrow-overlay top">
                                <HorizontalArrow
                                    reverse={direction === 'reverse'}
                                    label={phase === 'solve-target' ? `${relation.op} ${relation.val}` : '?'}
                                />
                            </div>
                            <div className="arrow-overlay bottom">
                                <HorizontalArrow
                                    reverse={direction === 'reverse'}
                                    label={phase === 'solve-target' ? `${relation.op} ${relation.val}` : '?'}
                                />
                            </div>
                        </>
                    )}

                    {/* Vertical Arrows */}
                    {strategy === 'vertical' && (
                        <>
                            <div className="arrow-overlay left">
                                <VerticalArrow
                                    reverse={direction === 'reverse'}
                                    label={phase === 'solve-target' ? `${relation.op} ${relation.val}` : '?'}
                                />
                            </div>
                            <div className="arrow-overlay right">
                                <VerticalArrow
                                    reverse={direction === 'reverse'}
                                    label={phase === 'solve-target' ? `${relation.op} ${relation.val}` : '?'}
                                />
                            </div>
                        </>
                    )}

                    <div className="proportion-table">
                        <div className={`cell ${targetCell === 'a' ? 'target' : ''} ${strategy === 'cross' ? 'cross-highlight' : ''}`}>
                            {targetCell === 'a' && phase === 'solve-target' ? (
                                <input
                                    type="number" className="solve-input"
                                    value={targetInput} onChange={(e) => setTargetInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && checkTarget()} autoFocus
                                />
                            ) : (targetCell === 'a' ? '?' : tableData.a)}
                        </div>

                        <div className={`cell ${targetCell === 'b' ? 'target' : ''} ${strategy === 'cross' ? 'cross-highlight' : ''}`}>
                            {targetCell === 'b' && phase === 'solve-target' ? (
                                <input
                                    type="number" className="solve-input"
                                    value={targetInput} onChange={(e) => setTargetInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && checkTarget()} autoFocus
                                />
                            ) : (targetCell === 'b' ? '?' : tableData.b)}
                        </div>

                        <div className={`cell ${targetCell === 'c' ? 'target' : ''} ${strategy === 'cross' ? 'cross-highlight' : ''}`}>
                            {targetCell === 'c' && phase === 'solve-target' ? (
                                <input
                                    type="number" className="solve-input"
                                    value={targetInput} onChange={(e) => setTargetInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && checkTarget()} autoFocus
                                />
                            ) : (targetCell === 'c' ? '?' : tableData.c)}
                        </div>

                        <div className={`cell ${targetCell === 'd' ? 'target' : ''}`}>
                            {targetCell === 'd' && phase === 'solve-target' ? (
                                <input
                                    type="number" className="solve-input"
                                    value={targetInput} onChange={(e) => setTargetInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && checkTarget()} autoFocus
                                />
                            ) : (targetCell === 'd' ? '?' : tableData.d)}
                        </div>
                    </div>
                </div>

                {phase === 'identify-relation' && (
                    <div className="relation-input-area fade-in">
                        <span>{t('rule')}</span>
                        <button
                            className={`operator-btn ${selectedOperator === '*' ? 'selected' : ''}`}
                            onClick={() => setSelectedOperator('*')}
                        >×</button>
                        <button
                            className={`operator-btn ${selectedOperator === '/' ? 'selected' : ''}`}
                            onClick={() => setSelectedOperator('/')}
                        >÷</button>
                        <input
                            type="number"
                            className="factor-input"
                            placeholder="?"
                            value={factorInput}
                            onChange={(e) => setFactorInput(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={checkRelation}>{t('confirmRule')}</button>
                    </div>
                )}

                {phase === 'solve-target' && (
                    <button className="btn btn-primary fade-in" onClick={checkTarget}>{t('checkAnswer')}</button>
                )}
            </div>
        </div>
    );
};

export default ProportionGame;
