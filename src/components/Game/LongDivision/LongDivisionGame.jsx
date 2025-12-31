import React, { useState, useEffect } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { getLevel } from './Levels';
import { translations } from './translations';
import './LongDivisionGame.css';

const LongDivisionGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { language, t: globalT } = useLanguage();

    // Local Translation Helper with Params Support
    const t = (key, params = {}) => {
        let text = key;
        if (translations[language] && translations[language][key]) {
            text = translations[language][key];
        } else {
            // Fallback to global or key itself if not found
            text = globalT(key);
            if (text === key) return key; // Return key if found nowhere
        }

        // Simple parameter replacement {param}
        Object.keys(params).forEach(p => {
            text = text.replace(new RegExp(`{${p}}`, 'g'), params[p]);
        });
        return text;
    };

    const { progress, saveProgress } = useGameState('long-division');

    const currentLevel = isTestMode ? testLevel : (progress.level || 1);

    // --- State ---
    const [phase, setPhase] = useState('normalization');

    // Numbers
    const levelDataSafe = getLevel(currentLevel);
    const [problem, setProblem] = useState(levelDataSafe);
    const [workingProb, setWorkingProb] = useState({
        dividend: levelDataSafe.dividend,
        divisor: levelDataSafe.divisor
    });

    // Algorithmic State
    const [cursorIndex, setCursorIndex] = useState(0);
    const [currentRemainder, setCurrentRemainder] = useState(0);
    const [quotient, setQuotient] = useState("");
    const [steps, setSteps] = useState([]);
    const [stepPhase, setStepPhase] = useState('SELECT');

    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [mistakes, setMistakes] = useState(0);

    const handleError = (msg) => {
        setFeedback(msg);
        setMistakes(prev => {
            const newM = prev + 1;
            if (isTestMode && newM >= 3) {
                setPhase('fail');
            }
            return newM;
        });
    };

    // Verification State
    const [verificationInput, setVerificationInput] = useState('');
    const [verifyQ, setVerifyQ] = useState('');
    const [verifyR, setVerifyR] = useState('');
    const [verifyD, setVerifyD] = useState('');
    const [vfStep, setVfStep] = useState(0); // 0=Q, 1=R, 2=Check

    // --- Level Loading (On Mount or Level Change) ---
    useEffect(() => {
        const lvlData = getLevel(currentLevel);
        setProblem(lvlData);
        setWorkingProb({ dividend: lvlData.dividend, divisor: lvlData.divisor });

        // Reset Logic
        setPhase('normalization');
        setStepPhase('SELECT');
        setCursorIndex(0);
        setCurrentRemainder(0);
        setQuotient("");
        setSteps([]);
        setSelection({ start: 0, end: 0 });
        setFeedback("");
        setUserInput("");
        setVerificationInput("");
        setMistakes(0);
        // Reset Verification Phase State
        setVerifyQ("");
        setVerifyR("");
        setVfStep(0); // 0 = Input, 1 = Success

    }, [currentLevel]);

    // --- Phase 1: Normalization ---
    const handleShiftDecimal = () => {
        setWorkingProb(prev => ({
            dividend: Math.round(prev.dividend * 10 * 100) / 100,
            divisor: Math.round(prev.divisor * 10 * 100) / 100
        }));
    };

    const handleConfirmNormalization = () => {
        if (Number.isInteger(workingProb.divisor) && Number.isInteger(workingProb.dividend)) {
            setPhase('solving');
            setStepPhase('SELECT');
            setCursorIndex(0);
            setCurrentRemainder(0);
            setSelection({ start: 0, end: 0 });
            setFeedback(t('selectPrompt'));
        } else {
            setFeedback(t('integersOnly'));
        }
    };

    // --- Phase 2: Solving Logic ---

    const handleDigitClick = (index) => {
        if (stepPhase !== 'SELECT') return;
        if (index < cursorIndex) return;
        setSelection({ start: cursorIndex, end: index });
    };

    const submitSelection = () => {
        if (stepPhase !== 'SELECT') return;

        const dividendStr = workingProb.dividend.toString();
        const subStr = dividendStr.substring(selection.start, selection.end + 1);
        const selectedVal = parseInt(subStr);

        if (cursorIndex === 0 && selectedVal < workingProb.divisor && selection.end < dividendStr.length - 1) {
            setFeedback(t('tooSmall'));
            return;
        }

        const prevDigitVal = parseInt(dividendStr.substring(selection.start, selection.end));
        if (cursorIndex === 0 && !isNaN(prevDigitVal) && prevDigitVal >= workingProb.divisor) {
            setFeedback(t('tooBig'));
            return;
        }

        setCurrentRemainder(selectedVal);
        setCursorIndex(selection.end + 1);
        setStepPhase('DIVIDE');
        setFeedback(t('howManyTimes', { divisor: workingProb.divisor, selectedVal }));
    };

    const submitDivision = () => {
        const val = parseInt(userInput);
        if (isNaN(val)) return;

        const correct = Math.floor(currentRemainder / workingProb.divisor);

        if (val === correct) {
            setQuotient(prev => prev + val.toString());
            setStepPhase('MULTIPLY');
            setUserInput('');
            setFeedback(t('multiply', { val, divisor: workingProb.divisor }));
        } else {
            handleError(t('incorrectDiv', { divisor: workingProb.divisor, currentRemainder }));
        }
    };

    const submitMultiplication = () => {
        const val = parseInt(userInput);
        if (isNaN(val)) return;

        const lastQ = parseInt(quotient[quotient.length - 1]);
        const correct = lastQ * workingProb.divisor;

        if (val === correct) {
            setSteps(prev => [...prev, {
                type: 'multiply',
                val: val,
                colIndex: cursorIndex - 1
            }]);

            setStepPhase('SUBTRACT');
            setUserInput('');
            setFeedback(t('subtract', { currentRemainder, val }));
        } else {
            handleError(t('incorrect'));
        }
    };

    const submitSubtraction = () => {
        const val = parseInt(userInput);
        if (isNaN(val)) return;

        const lastQ = parseInt(quotient[quotient.length - 1]);
        const multVal = lastQ * workingProb.divisor;
        const correct = currentRemainder - multVal;

        if (val === correct) {
            setSteps(prev => [...prev, {
                type: 'subtract',
                val: val,
                colIndex: cursorIndex - 1
            }]);
            setCurrentRemainder(val);

            // Check completion
            const dividendStr = workingProb.dividend.toString();
            if (cursorIndex >= dividendStr.length) {
                // No more digits to bring down -> Verification
                setPhase('verification');
                setFeedback(t('verifyPrompt'));
            } else {
                setStepPhase('BRING_DOWN');
                setFeedback(t('bringDownPrompt'));
            }
            setUserInput('');
        } else {
            handleError(t('incorrectSub'));
        }
    };

    const handleBringDown = () => {
        const dividendStr = workingProb.dividend.toString();
        const nextDigit = parseInt(dividendStr[cursorIndex]);
        const newVal = currentRemainder * 10 + nextDigit;

        setCurrentRemainder(newVal);
        setCursorIndex(prev => prev + 1);
        setStepPhase('DIVIDE');
        setFeedback(t('divide', { val: newVal, divisor: workingProb.divisor }));
    };

    // --- Phase 3: Verification & Next Level ---
    const submitVerification = () => {
        const trueQ = parseInt(quotient || 0);
        const trueR = currentRemainder;
        const inputQ = parseInt(verifyQ);
        const inputR = parseInt(verifyR);

        if (inputQ === trueQ && inputR === trueR) {
            setFeedback(t('verified'));
            setPhase('complete');
        } else {
            handleError(t('incorrect'));
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleNextLevel = () => {
        if (isSaving) return;
        setIsSaving(true);

        if (isTestMode && onTestComplete) {
            onTestComplete(true);
            return;
        }

        const newScore = (progress.score || 0) + 100;
        saveProgress({ level: currentLevel + 1, score: newScore });
        setTimeout(() => setIsSaving(false), 2000);
    };

    // --- Helpers ---
    const dividendStr = workingProb.dividend.toString();

    return (
        <div className="long-division-game fade-in">
            <div className="game-header">
                <button className="btn-back" onClick={onBack}>{globalT('btn.back')}</button>
                <div className="game-info">
                    <div className="level-badge">{globalT('level')} {currentLevel}</div>
                    <span>{globalT('score') || 'Score'}: {progress.score || 0}</span>
                </div>
            </div>

            {phase === 'normalization' && (
                <div className="normalization-phase">
                    <h2>{t('phase1')}</h2>
                    <div className="norm-display">
                        <span className="norm-num">{workingProb.dividend}</span>
                        <span>÷</span>
                        <span className="norm-num">{workingProb.divisor}</span>
                    </div>
                    <div className="norm-controls">
                        <button className="btn btn-secondary" onClick={handleShiftDecimal}>× 10</button>
                        <button className="btn btn-secondary" onClick={() => setWorkingProb(prev => ({
                            dividend: Math.round(prev.dividend / 10 * 100) / 100,
                            divisor: Math.round(prev.divisor / 10 * 100) / 100
                        }))}>÷ 10</button>
                        <button className="btn btn-primary" onClick={handleConfirmNormalization}>{t('startSolving')}</button>
                    </div>
                    <p className="feedback">{feedback}</p>
                </div>
            )}

            {phase !== 'normalization' && (
                <div className="solving-interface">
                    <div className="french-layout">
                        <div className="dividend-column" style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${dividendStr.length}, 1fr)`
                        }}>
                            {dividendStr.split('').map((d, i) => (
                                <div key={`d-${i}`}
                                    className={`d-digit 
                                          ${stepPhase === 'SELECT' && i >= selection.start && i <= selection.end ? 'selected' : ''}
                                          ${i === cursorIndex - 1 ? 'active-marker' : ''}
                                      `}
                                    style={{ gridRow: 1, gridColumn: i + 1 }}
                                    onClick={() => handleDigitClick(i)}
                                >
                                    {d}
                                </div>
                            ))}

                            {steps.map((step, idx) => {
                                const valStr = step.val.toString();
                                const startCol = (step.colIndex + 1) - valStr.length + 1;
                                return (
                                    <div key={idx} className={`step-row type-${step.type}`} style={{
                                        gridRow: idx + 2,
                                        gridColumn: `${startCol} / span ${valStr.length}`
                                    }}>
                                        <div className="step-val">
                                            {step.type === 'multiply' && <span className="op">-</span>}
                                            {step.val}
                                        </div>
                                        {step.type === 'subtract' && <div className="bar"></div>}
                                    </div>
                                );
                            })}

                            {stepPhase !== 'MULTIPLY' && stepPhase !== 'SUBTRACT' && stepPhase !== 'SELECT' && steps.length > 0 && (
                                <div className="step-row current" style={{
                                    gridRow: steps.length + 2,
                                    gridColumn: `${(cursorIndex) - currentRemainder.toString().length + 1} / span ${currentRemainder.toString().length}`
                                }}>
                                    {currentRemainder}
                                </div>
                            )}
                        </div>

                        <div className="vertical-bar"></div>

                        <div className="divisor-column">
                            <div className="divisor-val">{workingProb.divisor}</div>
                            <div className="horizontal-bar"></div>
                            <div className="quotient-val">{quotient === "" ? "?" : quotient}</div>
                        </div>
                    </div>

                    <div className="action-panel">
                        <div className="feedback-box">{feedback}</div>

                        {phase === 'solving' && (
                            <>
                                {stepPhase === 'SELECT' && (
                                    <button className="btn btn-primary pulse" onClick={submitSelection}>{t('confirmSelection')}</button>
                                )}

                                {stepPhase === 'BRING_DOWN' && (
                                    <button className="btn btn-accent pulse" onClick={handleBringDown}>⬇ {t('bringDown')}</button>
                                )}

                                {['DIVIDE', 'MULTIPLY', 'SUBTRACT'].includes(stepPhase) && (
                                    <div className="input-group">
                                        <input
                                            autoFocus
                                            type="number"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder="?"
                                            onKeyDown={(e) => e.key === 'Enter' && (
                                                stepPhase === 'DIVIDE' ? submitDivision() :
                                                    stepPhase === 'MULTIPLY' ? submitMultiplication() : submitSubtraction()
                                            )}
                                        />
                                        <button className="btn btn-primary" onClick={
                                            stepPhase === 'DIVIDE' ? submitDivision :
                                                stepPhase === 'MULTIPLY' ? submitMultiplication : submitSubtraction
                                        }>OK</button>
                                    </div>
                                )}
                            </>
                        )}

                        {phase === 'verification' && (
                            <div className="verification-ui">
                                <h3>{t('verifyPrompt')}</h3>
                                <div className="formula-verify">
                                    <div className="formula-row">
                                        <div className="input-with-label">
                                            <label>{t('game.longDivision.quotient')}</label>
                                            <input
                                                type="number"
                                                value={verifyQ}
                                                onChange={(e) => setVerifyQ(e.target.value)}
                                                placeholder="Q"
                                            />
                                        </div>
                                        <span className="op">×</span>
                                        <div className="static-val">
                                            <label>{t('divisor') || 'Divisor'}</label>
                                            <span>{workingProb.divisor}</span>
                                        </div>
                                        <span className="op">+</span>
                                        <div className="input-with-label">
                                            <label>{t('game.longDivision.remainder')}</label>
                                            <input
                                                type="number"
                                                value={verifyR}
                                                onChange={(e) => setVerifyR(e.target.value)}
                                                placeholder="R"
                                            />
                                        </div>
                                        <span className="op">=</span>
                                        <div className="static-val">
                                            <label>{t('dividend') || 'Dividend'}</label>
                                            <span>{workingProb.dividend}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-primary verify-btn" onClick={submitVerification}>
                                    {t('btn.submit') || 'Verify'}
                                </button>
                            </div>
                        )}

                        {phase === 'complete' && (
                            <div className="level-complete">
                                <h3>{t('success')}</h3>
                                <p>{globalT('score') || 'Score'}: {progress.score || 0} → {currentLevel * 100}</p>
                                <button className="btn btn-success pulse" onClick={handleNextLevel}>
                                    {t('nextLevel')} ➔
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {phase === 'fail' && (
                <div className="fail-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', color: 'white',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <h2>{globalT('gameOver')}</h2>
                    <p>{t('incorrect')}</p>
                    {isTestMode ? (
                        <button className="btn-retry" style={{ fontSize: '1.5rem', padding: '1rem 2rem', marginTop: '20px' }} onClick={() => onTestComplete(false)}>
                            {globalT('btn.continue')} ➔
                        </button>
                    ) : (
                        <button className="btn-retry" style={{ fontSize: '1.5rem', padding: '1rem 2rem', marginTop: '20px' }} onClick={() => window.location.reload()}>
                            {globalT('retry')} ↺
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default LongDivisionGame;
