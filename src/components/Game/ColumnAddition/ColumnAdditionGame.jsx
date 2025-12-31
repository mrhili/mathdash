import React, { useState, useEffect } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { getLevel } from './Levels';
import { translations } from './translations';
import './ColumnAdditionGame.css';

// --- Utility ---
const splitDigits = (num) => num.toString().split('').map(Number);

// --- Components ---
const TeacherBot = ({ message }) => (
    <div className="teacher-bot">
        <div className="bot-avatar">🤖</div>
        <div className="bot-bubble">{message}</div>
    </div>
);

const Numpad = ({ onInput, onToggleMode, isCarryMode, labelCarryOn, labelCarryOff }) => (
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

const ColumnAdditionGame = ({ onBack }) => {
    const { language, t: globalT } = useLanguage();

    const t = (key) => {
        if (translations[language] && translations[language][key]) {
            return translations[language][key];
        }
        return globalT(key);
    };

    const { progress, saveProgress } = useGameState('column-addition');
    const currentLevel = progress.level || 1;

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

    const generateSteps = (topVal, botVal) => {
        const topDigits = splitDigits(topVal).reverse();
        const botDigits = splitDigits(botVal).reverse();
        const generatedSteps = [];
        const maxLen = Math.max(topDigits.length, botDigits.length);
        let carry = 0;

        for (let i = 0; i < maxLen; i++) {
            const d1 = topDigits[i] || 0;
            const d2 = botDigits[i] || 0;
            const sum = d1 + d2 + carry;
            const unit = sum % 10;
            const nextCarry = Math.floor(sum / 10);

            // 1. Result Digit
            generatedSteps.push({
                type: 'digit',
                val: unit,
                col: i, // Logic column (0 is rightmost)
                row: 5, // Visual row
                highlight: { col: i },
                hint: `${d1} + ${d2} ${carry ? `+ ${carry}` : ''} = ?`,
                phase: 'ADD'
            });

            // 2. Carry
            if (nextCarry > 0) {
                if (i < maxLen - 1) {
                    // Carry to next column
                    generatedSteps.push({
                        type: 'carry',
                        val: nextCarry,
                        col: i + 1,
                        row: 1, // Visual row
                        highlight: { col: i }, // Still highlight current col processing
                        hint: `Sum is ${sum}`,
                        phase: 'ADD'
                    });
                } else {
                    // Final overflow digit (new column)
                    generatedSteps.push({
                        type: 'digit',
                        val: nextCarry,
                        col: i + 1,
                        row: 5,
                        highlight: { col: i },
                        hint: `Write the final digit.`,
                        phase: 'ADD'
                    });
                }
            }
            carry = nextCarry;
        }

        return generatedSteps;
    };

    // --- Interaction ---
    const handleNumpadInput = (num) => {
        if (phase !== 'SOLVING') return;
        const step = steps[currentStepIndex];
        if (!step) return;

        const isCarryStep = step.type === 'carry';

        // Strict Mode Logic
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
            if (isCarryStep) setCarryMode(false); // Auto-turn off carry mode after correct input? 
            // In val-carry step, meaningful to reset. 

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
        saveProgress({ level: currentLevel + 1, score: (progress.score || 0) + 100 });
    };

    const toggleMode = () => setCarryMode(!carryMode);

    // --- Grid Helpers ---
    const getKey = (step) => `${step.row}-${step.col}`;
    const getGridCol = (logicColIdx) => 8 - logicColIdx; // Right-to-left alignment

    const getCursorPosition = () => {
        if (phase !== 'SOLVING') return null;
        const step = steps[currentStepIndex];
        if (!step) return null;

        // "Stay in place" Logic:
        // If it's a CARRY step, but user is NOT in carry mode, 
        // keep the cursor on the Result row of the PREVIOUS column (where they just typed).
        if (step.type === 'carry' && !carryMode) {
            // step.col is calculation column index (0..N).
            // Logic index: step.col - 1 is the previous column.
            const gridCol = getGridCol(step.col - 1);
            return { gridRow: 5, gridColumn: gridCol };
        }

        const gridCol = getGridCol(step.col);
        // Visual Row logic:
        // Carry steps are row 1. Result steps are row 5.
        // But what if carryMode is ON but we are at a result step? usage of carryMode determines cursor color mainly.
        // Actually, for consistency with multiplication:
        // If Carry Mode is ON, cursor should be at "Carry Row" (top) visually?
        // In Addition, Carry is Row 1. Result is Row 5.
        // If step is Carry, row is 1. If step is Digit, row is 5.
        // We should respect the STEP's target row for the cursor position, 
        // BUT strict mode implies the user must align their intention.

        let gridRow = step.row;
        // If user has wrong mode, we still show cursor at the TARGET? 
        // Or do we show cursor where the user IS (based on mode)?
        // Let's show cursor at the TARGET to guide them, but style indicates mode.
        return { gridRow, gridColumn: gridCol };
    };

    if (!problem) return <div>{globalT('common.loading')}</div>;

    const topDigits = splitDigits(problem.top).reverse();
    const botDigits = splitDigits(problem.bottom).reverse();
    const activeStep = steps[currentStepIndex];
    const cursorPos = getCursorPosition();

    return (
        <div className="col-mult-game-v2"> {/* We reuse the v2 class structure for layout */}
            <div className="game-header">
                <button className="btn-back" onClick={onBack}>← {globalT('btn.back')}</button>
                <div className="header-center">
                    <div className="level-badge">{globalT('level')} {currentLevel}</div>
                    <div className="score-badge">{globalT('score')} {progress.score}</div>
                    <div className="phase-badge">{t('phaseAdd')}</div>
                </div>
            </div>

            <div className="game-board-notebook">
                <div className="grid-paper">

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

                    {/* Digits */}
                    {topDigits.map((d, i) => (
                        <div key={`t-${i}`}
                            className={`grid-cell static`}
                            style={{ gridRow: 2, gridColumn: getGridCol(i) }}>
                            {d}
                        </div>
                    ))}
                    <div className="op-sym" style={{ gridRow: 3, gridColumn: 1 }}>+</div>
                    {botDigits.map((d, i) => (
                        <div key={`b-${i}`}
                            className={`grid-cell static`}
                            style={{ gridRow: 3, gridColumn: getGridCol(i) }}>
                            {d}
                        </div>
                    ))}
                    <div className="grid-line" style={{ gridRow: 4, gridColumn: '1 / -1' }} />

                    {/* Dynamic Steps */}
                    {steps.map((step, idx) => {
                        if (idx > currentStepIndex) return null;

                        const key = getKey(step);
                        const isDone = userInputs[key] !== undefined;
                        if (!isDone) return null;

                        const r = step.row;
                        const c = getGridCol(step.col);
                        const isCarry = step.type === 'carry';

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
                    <button className="btn-retry" onClick={loadLevel}>{t('retry')} ↺</button>
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

export default ColumnAdditionGame;
