import React, { useState, useEffect } from 'react';
import { generateQuestion, checkAnswer } from '../../../utils/gameLogic';
import './PowerOfTenGame.css';
import { useGameState } from '../../../hooks/useGameState';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const PowerOfTenGame = ({ onBack }) => {
    const { progress, completeLevel, winGame } = useGameState('power-of-10');
    const { language, t: globalT } = useLanguage();

    // Local translation helper
    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const [question, setQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null

    useEffect(() => {
        startNewRound();
    }, [progress.level]);

    const startNewRound = () => {
        const newQuestion = generateQuestion(progress.level);
        setQuestion(newQuestion);
        setUserAnswer('');
        setFeedback(null);
    };

    const handleInput = (val) => {
        if (feedback) return; // Block input during feedback
        if (val === 'DEL') {
            setUserAnswer(prev => prev.slice(0, -1));
        } else if (val === 'ENTER') {
            submitAnswer();
        } else if (val === '.' && userAnswer.includes('.')) {
            return;
        } else {
            setUserAnswer(prev => prev + val);
        }
    };

    const submitAnswer = () => {
        if (!question || !userAnswer) return;

        const isCorrect = checkAnswer(userAnswer, question.answer);

        if (isCorrect) {
            setFeedback('correct');
            // setScore(prev => prev + 10); // Handled by hook
            setTimeout(() => {
                if (progress.level < 50) {
                    completeLevel(progress.level + 1, 10);
                } else {
                    winGame(10);
                }
            }, 1000);
        } else {
            setFeedback('incorrect');
            // setScore(prev => Math.max(0, prev - 4)); // Penalty logic removed for simplicity or add saveProgress
            setTimeout(() => {
                setFeedback(null);
                setUserAnswer('');
            }, 1000);
        }
    };

    if (!question) return <div>{t('common.loading')}</div>;

    return (
        <div className="game-container fade-in">
            <div className="game-header">
                <button onClick={onBack} className="btn-icon">←</button>
                <div className="hud">
                    <span className="hud-item">{t('level')}: {progress.level}</span>
                    <span className="hud-item">{t('score')}: {progress.score}</span>
                </div>
            </div>

            <div className="game-area">
                <div className={`question-card ${feedback}`}>
                    <div className="operation-display">
                        <span className="number">{question.number}</span>
                        <span className="operator">
                            {question.operationType === 'multiply' ? '×' : '÷'}
                        </span>
                        <span className="operand">{question.operationValue}</span>
                    </div>
                    <div className="equals">=</div>
                    <div className="answer-display">
                        {userAnswer || '?'}
                    </div>
                </div>

                {feedback === 'correct' && <div className="feedback-msg success">{t('correct')}</div>}
                {feedback === 'incorrect' && <div className="feedback-msg error">{t('incorrect')}</div>}
            </div>

            <div className="numpad">
                {[7, 8, 9, 4, 5, 6, 1, 2, 3, '.', 0, 'DEL'].map((key) => (
                    <button
                        key={key}
                        className={`num-btn ${key === 'DEL' ? 'del-btn' : ''}`}
                        onClick={() => handleInput(key)}
                    >
                        {key === 'DEL' ? t('btn.del') : key}
                    </button>
                ))}
                <button className="num-btn enter-btn" onClick={() => handleInput('ENTER')}>{t('btn.enter')}</button>
            </div>
        </div>
    );
};

export default PowerOfTenGame;
