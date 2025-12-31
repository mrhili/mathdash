import React, { useState, useEffect } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { getLevel } from './Levels';
import { translations } from './translations';
import './ColumnSubtractionGame.css';

// --- Utility ---
const splitDigits = (num) => num.toString().split('').map(Number);
const getColumnName = (index, totalDigits, lang = 'en') => {
    const names = {
        en: ['units', 'tens', 'hundreds', 'thousands'],
        fr: ['unités', 'dizaines', 'centaines', 'milliers'],
        ar: ['الوحدات', 'العشرات', 'المئات', 'الآلاف']
    };
    return names[lang]?.[totalDigits - 1 - index] || `column ${totalDigits - index}`;
};

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
    const currentScore = progress.score || 0;

    // --- State ---
    const [problem, setProblem] = useState(null);
    const [phase, setPhase] = useState('SOLVING');
    const [failReason, setFailReason] = useState('');
    const [shakeCursor, setShakeCursor] = useState(false);
    const [levelScore, setLevelScore] = useState(0);

    const [steps, setSteps] = useState([]);
    const [currStepIdx, setCurrStepIdx] = useState(0);
    const [userInputs, setUserInputs] = useState({});

    // State for modified numbers (Equal Additions Method)
    const [modifiedTop, setModifiedTop] = useState([]);
    const [modifiedBottom, setModifiedBottom] = useState([]);

    useEffect(() => {
        loadLevel();
    }, [currentLevel, language]);

    const loadLevel = () => {
        const lvl = getLevel(currentLevel);
        setProblem(lvl);
        setLevelScore(0);

        const topDigits = splitDigits(lvl.top);
        const bottomDigits = splitDigits(lvl.bottom);

        // Pad bottom digits with leading zeros if needed
        const paddedBottom = [];
        for (let i = 0; i < topDigits.length; i++) {
            const bottomIdx = i - (topDigits.length - bottomDigits.length);
            paddedBottom[i] = bottomIdx >= 0 ? bottomDigits[bottomIdx] : 0;
        }

        // Initialize modified numbers
        setModifiedTop(topDigits.map(d => ({ original: d, current: d, addedTen: false })));
        setModifiedBottom(paddedBottom.map(d => ({ original: d, current: d, addedOne: false })));

        // Generate steps for Equal Additions Method
        const generatedSteps = [];
        const simTop = [...topDigits];
        const simBottom = [...paddedBottom];

        // We need to process from right to left
        for (let i = topDigits.length - 1; i >= 0; i--) {
            const colName = getColumnName(i, topDigits.length, language);

            // Check if we need to do equal addition
            if (simTop[i] < simBottom[i]) {
                // Step 1: Add 10 to current top digit
                generatedSteps.push({
                    type: 'addTen',
                    col: i,
                    target: i,
                    colName: colName,
                    originalTop: simTop[i],
                    bottom: simBottom[i],
                    hint: t('equalAddTen', {
                        col: colName,
                        a: simTop[i],
                        b: simBottom[i],
                        newVal: simTop[i] + 10
                    })
                });

                // Update simulation
                simTop[i] += 10;

                // Step 2: Add 1 to the bottom digit in the next column (to the left)
                if (i > 0) { // Check if there's a column to the left
                    const leftColName = getColumnName(i - 1, topDigits.length, language);
                    generatedSteps.push({
                        type: 'addOne',
                        col: i - 1, // Column to the left
                        target: i - 1,
                        colName: leftColName,
                        originalBottom: simBottom[i - 1],
                        hint: t('equalAddOne', {
                            col: leftColName,
                            a: simBottom[i - 1] || 0,
                            newVal: (simBottom[i - 1] || 0) + 1
                        })
                    });

                    // Update simulation
                    simBottom[i - 1] = (simBottom[i - 1] || 0) + 1;
                }
            }

            // Step 3: Subtract
            const result = simTop[i] - simBottom[i];
            generatedSteps.push({
                type: 'subtract',
                col: i,
                val: result,
                colName: getColumnName(i, topDigits.length, language),
                hint: t('subResult', {
                    col: getColumnName(i, topDigits.length, language),
                    a: simTop[i],
                    b: simBottom[i],
                    result: result
                })
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

        if (step.type === 'subtract') {
            if (num === step.val) {
                const key = `res-${step.col}`;
                setUserInputs(prev => ({ ...prev, [key]: num }));
                // Add points for correct subtraction
                setLevelScore(prev => prev + 30);
                nextStep();
            } else {
                handleFail(t('wrong'));
            }
        } else {
            handleFail(t('doStepFirst'));
        }
    };

    const handleTopDigitClick = (visualIndex) => {
        if (phase !== 'SOLVING') return;
        const step = steps[currStepIdx];

        if (step.type === 'addTen' && step.col === visualIndex) {
            // Add 10 to this top digit
            setModifiedTop(prev => {
                const newTop = [...prev];
                const newValue = newTop[visualIndex].original + 10;
                newTop[visualIndex] = {
                    ...newTop[visualIndex],
                    current: newValue,
                    addedTen: true
                };
                return newTop;
            });
            // Add points for correct addition
            setLevelScore(prev => prev + 20);
            nextStep();
        } else if (step.type === 'addTen') {
            handleFail(t('clickCorrectDigit'));
        }
    };

    const handleBottomDigitClick = (visualIndex) => {
        if (phase !== 'SOLVING') return;
        const step = steps[currStepIdx];

        if (step.type === 'addOne' && step.col === visualIndex) {
            // Add 1 to this bottom digit
            setModifiedBottom(prev => {
                const newBottom = [...prev];
                const newValue = newBottom[visualIndex].original + 1;
                newBottom[visualIndex] = {
                    ...newBottom[visualIndex],
                    current: newValue,
                    addedOne: true
                };
                return newBottom;
            });
            // Add points for correct addition
            setLevelScore(prev => prev + 20);
            nextStep();
        } else if (step.type === 'addOne') {
            handleFail(t('clickCorrectColumn'));
        }
    };

    const nextStep = () => {
        if (currStepIdx + 1 < steps.length) {
            setCurrStepIdx(p => p + 1);
        } else {
            const totalScore = currentScore + levelScore;
            setPhase('SUCCESS');
            saveProgress({
                level: currentLevel + 1,
                score: totalScore,
                lastLevelScore: levelScore
            });
        }
    };

    const handleFail = (reason) => {
        setFailReason(reason);
        setPhase('GAMEOVER');
        setShakeCursor(true);
    };

    // --- Helpers ---
    const getGridCol = (visualIndex) => {
        if (!modifiedTop.length) return 1;
        // Center the numbers in the grid
        const totalCols = 8;
        const numDigits = modifiedTop.length;
        const startCol = Math.floor((totalCols - numDigits) / 2) + 1;
        return startCol + visualIndex;
    };

    if (!problem) return <div>{globalT('common.loading')}</div>;

    const botMsg = steps[currStepIdx] ? steps[currStepIdx].hint : t('done');

    return (
        <div className="col-mult-game-v2">
            <div className="game-header">
                <button className="btn-back" onClick={onBack}>← {globalT('btn.back')}</button>
                <div className="header-center">
                    <div className="level-badge">{globalT('level')} {currentLevel}</div>
                    <div className="phase-badge">Equal Additions Method</div>
                    <div className="score-display">Score: {currentScore}</div>
                </div>
                <div className="score-level">This Level: {progress.level}</div>
            </div>

            <div className="game-board-notebook">
                <div className="grid-paper">

                    {/* Width Marker */}
                    <div style={{ gridRow: 1, gridColumn: 1, height: '1px', width: '100%' }}></div>

                    {/* Top Digits */}
                    {modifiedTop.map((digit, i) => {
                        const isActive = steps[currStepIdx]?.type === 'addTen' && steps[currStepIdx].col === i;

                        return (
                            <div key={`t-${i}`}
                                className={`grid-cell static ${isActive ? 'highlight-target' : ''}`}
                                style={{ gridRow: 2, gridColumn: getGridCol(i) }}
                                onClick={() => handleTopDigitClick(i)}
                            >
                                <span style={{ position: 'relative', display: 'inline-block', minWidth: '40px' }}>
                                    {digit.addedTen ? (
                                        <>
                                            <span className="original-digit">{digit.original}</span>
                                            <span className="new-digit">{digit.current}</span>
                                            <span className="equal-addition-note">+10</span>
                                        </>
                                    ) : (
                                        <span>{digit.current}</span>
                                    )}
                                </span>
                            </div>
                        );
                    })}

                    <div className="op-sym" style={{ gridRow: 3, gridColumn: getGridCol(0) - 1 }}>-</div>

                    {/* Bottom Digits */}
                    {modifiedBottom.map((digit, i) => {
                        const isActive = steps[currStepIdx]?.type === 'addOne' && steps[currStepIdx].col === i;

                        return (
                            <div key={`b-${i}`}
                                className={`grid-cell static ${isActive ? 'highlight-target' : ''}`}
                                style={{ gridRow: 3, gridColumn: getGridCol(i) }}
                                onClick={() => handleBottomDigitClick(i)}
                            >
                                <span style={{ position: 'relative', display: 'inline-block', minWidth: '40px' }}>
                                    {digit.addedOne ? (
                                        <>
                                            <span className="original-digit">{digit.original}</span>
                                            <span className="new-digit">{digit.current}</span>
                                            <span className="equal-addition-note">+1</span>
                                        </>
                                    ) : (
                                        <span>{digit.current}</span>
                                    )}
                                </span>
                            </div>
                        );
                    })}

                    <div className="grid-line" style={{ gridRow: 4, gridColumn: `${getGridCol(0)} / span ${modifiedTop.length}` }} />

                    {/* Result Digits */}
                    {steps.map((step, idx) => {
                        if (step.type !== 'subtract') return null;
                        if (idx > currStepIdx) return null;

                        const colKey = `res-${step.col}`;
                        const isDone = userInputs[colKey] !== undefined;
                        if (!isDone) return null;

                        return (
                            <div key={idx} className="grid-cell val-digit" style={{ gridRow: 5, gridColumn: getGridCol(step.col) }}>
                                {userInputs[colKey]}
                            </div>
                        );
                    })}

                    {/* Active Input Cursor */}
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
                    <p>Level Score: {levelScore}</p>
                    <button className="btn-retry" onClick={loadLevel}>{t('retry')} ↺</button>
                </div>
            )}
            {phase === 'SUCCESS' && (
                <div className="success-overlay">
                    <h2>🎉 {globalT('game.power10.won')} 🎉</h2>
                    <div className="score-summary">
                        <p>Level Score: <span className="score-value">+{levelScore}</span></p>
                        <p>Total Score: <span className="score-value">{currentScore + levelScore}</span></p>
                    </div>
                    <button className="btn-next" onClick={loadLevel}>{globalT('btn.next')} ➔</button>
                </div>
            )}
        </div>
    );
};

export default ColumnSubtractionGame;