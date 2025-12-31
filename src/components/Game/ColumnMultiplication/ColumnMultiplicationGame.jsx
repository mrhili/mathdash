import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { getLevel } from './Levels';
import { translations } from './translations';
import './ColumnMultiplicationGame.css';

// --- Utility ---
const splitDigits = (num) => num.toString().split('').map(Number);

// --- Components ---

// Bot Component
const TeacherBot = ({ message }) => {
    return (
        <div className="teacher-bot">
            <div className="bot-avatar">
                🤖
            </div>
            <div className="bot-bubble">
                {message}
            </div>
        </div>
    );
};

const Numpad = ({ onInput, onToggleMode, isCarryMode, labelCarryOn, labelCarryOff }) => {
    return (
        <div className="numpad-container">
            <div className="numpad-controls">
                <button
                    className={`btn-mode-toggle ${isCarryMode ? 'mode-carry' : 'mode-normal'}`}
                    onClick={onToggleMode}
                >
                    <span className="toggle-icon">{isCarryMode ? '▲' : '▼'}</span>
                    <span className="toggle-text">
                        {isCarryMode ? labelCarryOn : labelCarryOff}
                    </span>
                    <div className="toggle-indicator"></div>
                </button>
            </div>
            <div className="numpad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                    <button key={num} className="btn-numpad" onClick={() => onInput(num)}>
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ColumnMultiplicationGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { language, t: globalT } = useLanguage();

    // Local Translation Helper
    const t = (key) => {
        if (translations[language] && translations[language][key]) {
            return translations[language][key];
        }
        return globalT(key); // Fallback to global
    };

    const { progress, saveProgress } = useGameState('column-multiplication');
    const currentLevel = isTestMode ? testLevel : (progress.level || 1);

    // --- State ---
    const [problem, setProblem] = useState(null);
    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [userInputs, setUserInputs] = useState({});
    const [phase, setPhase] = useState('SOLVING');
    const [carryMode, setCarryMode] = useState(false);
    const [failReason, setFailReason] = useState('');
    const [shakeCursor, setShakeCursor] = useState(false);

    // --- Init ---
    useEffect(() => {
        loadLevel();
    }, [currentLevel, language]);

    const loadLevel = () => {
        const lvl = getLevel(currentLevel);
        const s = generateSteps(lvl.top, lvl.bottom);
        setProblem(lvl);
        setSteps(s);
        setCurrentStepIndex(0);
        setUserInputs({});
        setPhase('SOLVING');
        setCarryMode(false);
        setFailReason('');
        setShakeCursor(false);
    };

    // --- Step Logic ---
    const generateSteps = (topVal, botVal) => {
        const topDigits = splitDigits(topVal).reverse();
        const botDigits = splitDigits(botVal).reverse();
        const generatedSteps = [];
        const partialProducts = [];

        // 1. Partial Products
        botDigits.forEach((bDigit, bIndex) => {
            let carry = 0;
            const rowBase = 4 + bIndex;

            // Placeholder Zeros
            for (let i = 0; i < bIndex; i++) {
                generatedSteps.push({
                    type: 'placeholder',
                    val: 0,
                    row: rowBase,
                    col: i,
                    hint: globalT('feedback.placeholder'),
                    phase: 'MULTIPLY'
                });
            }

            // Multiplication
            topDigits.forEach((tDigit, tIndex) => {
                const product = (tDigit * bDigit) + carry;
                const unit = product % 10;
                const newCarry = Math.floor(product / 10);
                const colIndex = tIndex + bIndex;

                // Digit
                generatedSteps.push({
                    type: 'digit',
                    val: unit,
                    row: rowBase,
                    col: colIndex,
                    refCol: colIndex,
                    highlight: { top: tIndex, bot: bIndex },
                    hint: `${tDigit} × ${bDigit} ${carry > 0 ? `+ ${carry}` : ''}`,
                    phase: 'MULTIPLY'
                });

                // Carry
                if (tIndex < topDigits.length - 1) {
                    if (newCarry > 0) {
                        generatedSteps.push({
                            type: 'carry',
                            val: newCarry,
                            col: tIndex + 1 + bIndex,
                            refCol: tIndex + 1 + bIndex,
                            highlight: { top: tIndex, bot: bIndex },
                            hint: globalT('feedback.carry'),
                            phase: 'MULTIPLY'
                        });
                    }
                } else {
                    // Final Carry
                    if (newCarry > 0) {
                        generatedSteps.push({
                            type: 'digit',
                            val: newCarry,
                            row: rowBase,
                            col: colIndex + 1,
                            refCol: colIndex + 1,
                            highlight: { top: tIndex, bot: bIndex },
                            hint: globalT('feedback.carry'),
                            phase: 'MULTIPLY'
                        });
                    }
                }
                carry = newCarry;
            });
            partialProducts.push(topVal * bDigit * Math.pow(10, bIndex));
        });

        // 2. Addition
        if (partialProducts.length > 1) {
            generatedSteps.push({ type: 'bar', row: 4 + botDigits.length, phase: 'ADD' });

            const totalSum = partialProducts.reduce((a, b) => a + b, 0);
            const sumDigits = splitDigits(totalSum).reverse();

            for (let c = 0; c < sumDigits.length; c++) {
                generatedSteps.push({
                    type: 'sum-digit',
                    val: sumDigits[c],
                    row: 4 + botDigits.length + 1,
                    col: c,
                    refCol: c,
                    hint: globalT('feedback.add_column'),
                    phase: 'ADD'
                });
            }
        }
        return generatedSteps;
    };

    // --- Interaction ---
    useEffect(() => {
        if (phase !== 'SOLVING') return;
        const step = steps[currentStepIndex];
        if (step && step.type === 'bar') {
            const timer = setTimeout(() => setCurrentStepIndex(p => p + 1), 600);
            return () => clearTimeout(timer);
        }
    }, [currentStepIndex, phase, steps]);

    const handleNumpadInput = (num) => {
        if (phase !== 'SOLVING') return;
        const step = steps[currentStepIndex];
        if (!step) return;

        // Strict Validation
        const isCarryStep = step.type === 'carry';

        if (carryMode && !isCarryStep) {
            handleFail(t('strictMode') + ": " + t('carryOff'));
            return;
        }
        if (!carryMode && isCarryStep) {
            handleFail(t('strictMode') + ": " + t('carryOn'));
            return;
        }

        if (num === step.val) {
            const key = getKey(step);
            setUserInputs(prev => ({ ...prev, [key]: num }));
            if (isCarryStep) setCarryMode(false);

            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(p => p + 1);
            } else {
                handleSuccess();
            }
        } else {
            handleFail(t('wrongDigit'));
        }
    };

    const handleFail = (reason) => {
        setFailReason(reason);
        setPhase('GAMEOVER');
        setShakeCursor(true);
    };

    const handleSuccess = () => {
        if (phase === 'SUCCESS') return;
        setPhase('SUCCESS');

        if (isTestMode && onTestComplete) {
            setTimeout(() => onTestComplete(true), 1500);
            return;
        }

        saveProgress({ level: currentLevel + 1, score: (progress.score || 0) + 100 });
    };

    const toggleMode = () => setCarryMode(!carryMode);

    // --- Grid Helpers ---
    const getKey = (step) => `${step.row || 'c'}-${step.col}`;
    const getGridCol = (colIndex) => 8 - colIndex; // Right-to-left alignment

    const getCursorPosition = () => {
        if (phase !== 'SOLVING') return null;
        const step = steps[currentStepIndex];
        if (!step || step.type === 'bar') return null;

        const colIndex = step.refCol !== undefined ? step.refCol : step.col;
        const gridCol = getGridCol(colIndex);
        let gridRow;

        if (carryMode) {
            gridRow = 1;
        } else {
            gridRow = step.row || 4;
        }

        return { gridRow, gridColumn: gridCol };
    };

    // --- Visual Guide Helpers ---
    const getArrowCoords = (step, topDigits, botDigits) => {
        if (!step || !step.highlight) return null;
        const { top, bot } = step.highlight;

        // Grid: 40px cells + 2px gap.
        // Col indices are 1-based from right (8 is rightmost visual?? No, getGridCol(i) = 8-i)
        // i=0 -> col=8. i=7 -> col=1.

        const getX = (digitIndex) => {
            const gridCol = 8 - digitIndex;
            // (col-1)*(40+2) + 20
            return (gridCol - 1) * 42 + 20;
        };

        const x1 = getX(top);
        // Row 2 is 50px-100px. Center ~ 75px.
        // Row 3 is 100px-150px. Center ~ 125px.

        return { x1, y1: 75, x2: getX(bot), y2: 125 };
    };

    if (!problem) return <div>{globalT('common.loading')}</div>;

    const topDigits = splitDigits(problem.top).reverse();
    const botDigits = splitDigits(problem.bottom).reverse();
    const activeStep = steps[currentStepIndex];
    const cursorPos = getCursorPosition();
    const arrow = getArrowCoords(activeStep, topDigits, botDigits);

    const currentPhaseText = activeStep?.phase === 'ADD'
        ? t('phaseAdd')
        : t('phaseMult');

    return (
        <div className="col-mult-game-v2">
            <div className="game-header">
                <button className="btn-back" onClick={onBack}>← {globalT('btn.back')}</button>
                <div className="header-center">
                    <div className="level-badge">{globalT('level')} {currentLevel}</div>
                    <div className="score-badge">{globalT('score')} {progress.score}</div>
                    <div className="phase-badge">{currentPhaseText}</div>
                </div>
            </div>

            <div className="game-board-notebook">
                <div className="grid-paper">

                    {/* SVG Connector Layer */}
                    <svg className="guide-arrows">
                        {arrow && (
                            <line
                                x1={arrow.x1} y1={arrow.y1}
                                x2={arrow.x2} y2={arrow.y2}
                                stroke="#FF9800" strokeWidth="2" strokeDasharray="4"
                                markerEnd="url(#arrowhead)"
                            />
                        )}
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#FF9800" />
                            </marker>
                        </defs>
                    </svg>

                    {/* Width Marker */}
                    <div style={{ gridRow: 1, gridColumn: 1, height: '1px', width: '100%' }}></div>

                    {/* Cursor */}
                    {cursorPos && (
                        <div
                            className={`cursor-box ${carryMode ? 'cursor-carry' : 'cursor-normal'} ${shakeCursor ? 'shake' : ''}`}
                            style={cursorPos}
                        >
                            <div className="cursor-label">
                                {carryMode ? "Carry" : "Result"}
                            </div>
                        </div>
                    )}

                    {/* Static Numbers with Active Highlight */}
                    {topDigits.map((d, i) => (
                        <div key={`t-${i}`}
                            className={`grid-cell static ${activeStep?.highlight?.top === i ? 'highlight-top' : ''}`}
                            style={{ gridRow: 2, gridColumn: getGridCol(i) }}>
                            {d}
                        </div>
                    ))}
                    <div className="op-sym" style={{ gridRow: 3, gridColumn: 1 }}>×</div>
                    {botDigits.map((d, i) => (
                        <div key={`b-${i}`}
                            className={`grid-cell static ${activeStep?.highlight?.bot === i ? 'highlight-bot' : ''}`}
                            style={{ gridRow: 3, gridColumn: getGridCol(i) }}>
                            {d}
                        </div>
                    ))}
                    <div className="grid-line" style={{ gridRow: 3 }} />

                    {/* Dynamic Steps */}
                    {steps.map((step, idx) => {
                        if (idx > currentStepIndex) return null;
                        if (step.type === 'bar') return <div key="bar" className="grid-line" style={{ gridRow: step.row - 1 }} />;

                        const key = getKey(step);
                        const isDone = userInputs[key] !== undefined;
                        if (!isDone) return null;

                        const isCarry = step.type === 'carry';
                        const r = step.row || 1;
                        const c = getGridCol(step.col);

                        return (
                            <div key={key} className={`grid-cell val ${isCarry ? 'val-carry' : 'val-digit'}`}
                                style={{ gridRow: r, gridColumn: c }}>
                                {userInputs[key]}
                            </div>
                        );
                    })}
                </div>

                {/* Bot Helper Helper */}
                {activeStep && (
                    <TeacherBot message={activeStep.hint} />
                )}
            </div>

            <div className="numpad-area">
                <Numpad
                    onInput={handleNumpadInput}
                    onToggleMode={toggleMode}
                    isCarryMode={carryMode}
                    labelCarryOn={t('carryOn')}
                    labelCarryOff={t('carryOff')}
                />
            </div>

            {phase === 'GAMEOVER' && (
                <div className="fail-overlay">
                    <h2>{t('gameOver')}</h2>
                    <p>{failReason}</p>
                    {isTestMode ? (
                        <button className="btn-retry" onClick={() => onTestComplete(false)}>
                            {globalT('btn.continue')} ➔
                        </button>
                    ) : (
                        <button className="btn-retry" onClick={loadLevel}>{t('retry')} ↺</button>
                    )}
                </div>
            )}
            {phase === 'SUCCESS' && (
                <div className="success-overlay">
                    <h2>{globalT('game.power10.won')}</h2>
                    <button className="btn-next" onClick={loadLevel}>{globalT('btn.next')} ➔</button>
                </div>
            )}
        </div>
    );
};

export default ColumnMultiplicationGame;
