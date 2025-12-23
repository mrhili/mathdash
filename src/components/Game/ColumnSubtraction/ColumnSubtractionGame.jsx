import React, { useState, useEffect } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { getLevel } from './Levels';
import { translations } from './translations';
import './ColumnSubtractionGame.css';

// --- Utility ---
const splitDigits = (num) => num.toString().split('').map(Number);

// --- Components ---
const TeacherBot = ({ message }) => (
    <div className="teacher-bot">
        <div className="bot-avatar">🤖</div>
        <div className="bot-bubble">{message}</div>
    </div>
);

const Numpad = ({ onInput }) => (
    <div className="numpad-container">
        <div className="numpad-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                <button key={num} className="btn-numpad" onClick={() => onInput(num)}>
                    {num}
                </button>
            ))}
        </div>
    </div>
);

const ColumnSubtractionGame = ({ onBack }) => {
    const { language, t: globalT } = useLanguage();

    const t = (key, params = {}) => {
        let text = (translations[language] && translations[language][key]) || key;
        Object.keys(params).forEach(p => text = text.replace(`{${p}}`, params[p] || '?'));
        return text;
    };

    const { progress, saveProgress } = useGameState('column-subtraction');
    const currentLevel = progress.level || 1;

    // --- State ---
    const [problem, setProblem] = useState(null);
    const [phase, setPhase] = useState('SOLVING');
    const [failReason, setFailReason] = useState('');
    const [shakeCursor, setShakeCursor] = useState(false);

    const [steps, setSteps] = useState([]);
    const [currStepIdx, setCurrStepIdx] = useState(0);
    const [userInputs, setUserInputs] = useState({});

    // Borrow State: Array of { val: number, isBorrowed: bool, hasReceived: bool, original: number }
    // Indexed logically (0 = rightmost) or visually (0 = leftmost)?
    // Let's stick to VISUAL order (0 = leftmost) for rendering, but LOGIC order for algo.
    // Actually, storing as Array aligned with Digits is best.
    // Let's store reversed (0 = rightmost) to match our loop logic.
    const [modTop, setModTop] = useState([]);

    useEffect(() => {
        loadLevel();
    }, [currentLevel, language]);

    const loadLevel = () => {
        const lvl = getLevel(currentLevel);
        setProblem(lvl);

        const topRev = splitDigits(lvl.top).reverse();
        const botRev = splitDigits(lvl.bottom).reverse();

        // Init Mod State
        const initMod = topRev.map(d => ({
            val: d,
            original: d,
            isBorrowed: false,
            hasReceived: false
        }));
        setModTop(initMod);

        const generatedSteps = [];
        const simTop = JSON.parse(JSON.stringify(initMod));

        // Generate Steps based on simulation
        for (let i = 0; i < topRev.length; i++) {
            // Check Borrow Need
            const tVal = simTop[i].val;
            const bVal = botRev[i] || 0;

            if (tVal < bVal) {
                // Must Borrow
                // Simple borrow from i+1
                // If i+1 is 0? We need recursive borrow logical or just fail level limits?
                // For now, assuming simple neighbor available (handled by level gen limits or just standard algo)
                // Standard algo: if neighbor 0, keep looking left.
                // IMPLEMENTATION: Simple single borrow for now.

                generatedSteps.push({
                    type: 'borrow',
                    col: i, // The column NEEDING the borrow
                    target: i + 1, // The neighbor to click
                    hint: t('borrowPrompt', { a: tVal, b: bVal, neighbor: simTop[i + 1]?.val })
                });

                // Update Sim
                if (simTop[i + 1]) simTop[i + 1].val -= 1;
                simTop[i].val += 10;
            }

            const finalT = simTop[i].val;
            generatedSteps.push({
                type: 'subtract',
                col: i,
                val: finalT - bVal,
                hint: finalT > 9 ? t('subPromptBig', { a: finalT - 10, b: bVal, a10: finalT }) : t('subPrompt', { a: finalT, b: bVal })
            });
        }

        setSteps(generatedSteps);
        setCurrStepIdx(0);
        setUserInputs({});
        setPhase('SOLVING');
        setFailReason('');
        setShakeCursor(false);
    };

    const handleNumpadInput = (num) => {
        if (phase !== 'SOLVING') return;
        const step = steps[currStepIdx];
        if (!step) return;

        if (step.type === 'borrow') {
            // Strict Mode: User tried to answer digit when they should swap!
            handleFail("You must borrow first!");
            return;
        }

        if (num === step.val) {
            const key = `res-${step.col}`;
            setUserInputs(prev => ({ ...prev, [key]: num }));
            nextStep();
        } else {
            handleFail(t('wrong'));
        }
    };

    const handleNeighborClick = (visualIndex) => {
        if (phase !== 'SOLVING') return;
        const step = steps[currStepIdx];

        if (step.type !== 'borrow') return; // Not borrow time

        // Convert visual (left-to-right) to logical (right-to-left)
        // modTop is stored reversed (0=right).
        // visual 0 = modTop[len-1]
        // logic 0 = visual[len-1]
        const logicIdx = (modTop.length - 1) - visualIndex;

        if (logicIdx === step.target) {
            // Success Borrow
            setModTop(prev => {
                const copy = [...prev];
                // Borrow from target
                copy[step.target] = { ...copy[step.target], isBorrowed: true, val: copy[step.target].val - 1 };
                // Give to col
                copy[step.col] = { ...copy[step.col], hasReceived: true, val: copy[step.col].val + 10 };
                return copy;
            });
            nextStep();
        } else {
            handleFail("Wrong neighbor!");
        }
    };

    const nextStep = () => {
        if (currStepIdx + 1 < steps.length) {
            setCurrStepIdx(p => p + 1);
        } else {
            setPhase('SUCCESS');
            saveProgress({ level: currentLevel + 1, score: (progress.score || 0) + 100 });
        }
    };

    const handleFail = (reason) => {
        setFailReason(reason);
        setPhase('GAMEOVER');
        setShakeCursor(true);
    };

    // --- Helpers ---
    const getGridCol = (logicColIdx) => 8 - logicColIdx;

    if (!problem) return <div>{globalT('common.loading')}</div>;

    const botMsg = steps[currStepIdx] ? steps[currStepIdx].hint : t('done');

    return (
        <div className="col-mult-game-v2"> {/* Reuse layout */}
            <div className="game-header">
                <button className="btn-back" onClick={onBack}>← {globalT('btn.back')}</button>
                <div className="header-center">
                    <div className="level-badge">{globalT('level')} {currentLevel}</div>
                    <div className="phase-badge">Subtraction</div>
                </div>
            </div>

            <div className="game-board-notebook">
                <div className="grid-paper">

                    {/* Width Marker */}
                    <div style={{ gridRow: 1, gridColumn: 1, height: '1px', width: '100%' }}></div>

                    {/* Top Digits (Clickable for Borrow) */}
                    {modTop.slice().reverse().map((obj, i) => {
                        // i is visual index (0 = leftmost)
                        // Logic index is (len - 1) - i
                        const logicIdx = modTop.length - 1 - i;
                        const c = getGridCol(logicIdx);

                        const isActiveTarget = steps[currStepIdx]?.type === 'borrow' && steps[currStepIdx].target === logicIdx;

                        return (
                            <div key={`t-${i}`}
                                className={`grid-cell static ${isActiveTarget ? 'highlight-target' : ''} ${obj.isBorrowed ? 'borrowed-cross' : ''}`}
                                style={{ gridRow: 2, gridColumn: c, cursor: 'pointer' }}
                                onClick={() => handleNeighborClick(i)}
                            >
                                <span style={{ position: 'relative' }}>
                                    {obj.original}
                                    {obj.isBorrowed && <span className="borrow-note-top">{obj.val}</span>}
                                    {obj.hasReceived && <span className="borrow-note-side">1</span>}
                                </span>
                            </div>
                        );
                    })}

                    <div className="op-sym" style={{ gridRow: 3, gridColumn: 1 }}>-</div>
                    {splitDigits(problem.bottom).reverse().map((d, i) => (
                        <div key={`b-${i}`} className="grid-cell static" style={{ gridRow: 3, gridColumn: getGridCol(i) }}>{d}</div>
                    ))}
                    <div className="grid-line" style={{ gridRow: 4, gridColumn: '1 / -1' }} />

                    {/* Result Digits */}
                    {steps.map((step, idx) => {
                        if (step.type === 'borrow') return null;
                        if (idx > currStepIdx) return null;

                        const colKey = `res-${step.col}`;
                        const isDone = userInputs[colKey] !== undefined;
                        if (!isDone) return null; // Wait for input

                        return (
                            <div key={idx} className="grid-cell val-digit" style={{ gridRow: 5, gridColumn: getGridCol(step.col) }}>
                                {userInputs[colKey]}
                            </div>
                        );
                    })}

                    {/* Active Input Cursor - Just a visual box for where we are typing */}
                    {steps[currStepIdx] && steps[currStepIdx].type === 'subtract' && (
                        <div className={`cursor-box cursor-normal ${shakeCursor ? 'shake' : ''}`}
                            style={{ gridRow: 5, gridColumn: getGridCol(steps[currStepIdx].col) }}>
                        </div>
                    )}
                </div>

                <TeacherBot message={failReason || botMsg} />
            </div>

            <div className="numpad-area">
                <Numpad onInput={handleNumpadInput} />
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

export default ColumnSubtractionGame;
