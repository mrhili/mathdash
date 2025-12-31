
import React, { useState, useEffect } from 'react';

import { TEST_CONFIG, getEnabledTestGames, getTestGameConfig } from './TestConfig';
import { useLanguage } from '../../context/LanguageContext';
import { useGameState } from '../../hooks/useGameState';
import './TestRunner.css';

// Dynamic Import Helper (Mapping IDs to Components)
// We need to import all potential game components here or rely on the config map if passed correctly.
// Since TestConfig now imports from GameConfig, we can use that mapping if we adjust the circular dependency.
// However, GameConfig imports TestRunner, so importing GameConfig here might cause cycle.
// Better to keep a local mapping or injection.
import columnAddition from '../Game/ColumnAddition/ColumnAdditionGame';
import columnSubtraction from '../Game/ColumnSubtraction/ColumnSubtractionGame';
import columnMultiplication from '../Game/ColumnMultiplication/ColumnMultiplicationGame';
import longDivision from '../Game/LongDivision/LongDivisionGame';
import powerOfTen from '../Game/PowerOfTen/PowerOfTenGame';
import placeValue from '../Game/PlaceValue/PlaceValueGame';
import powerRebuilder from '../Game/PowerRebuilder/PowerRebuilderGame';
import stackAlign from '../Game/StackAlign/StackAlignGame';
import unitMaster from '../Game/UnitMaster/UnitMasterGame';
import fractionSlicer from '../Game/FractionSlicer/FractionSlicerGame';
import fractionMatch from '../Game/FractionMatch/FractionMatchGame';
import simplifySmash from '../Game/SimplifySmash/SimplifySmashGame';
import simplifyExpress from '../Game/SimplifyExpress/SimplifyExpressGame';
import fractionScale from '../Game/FractionScale/FractionScaleGame';
import proportion from '../Game/Proportion/ProportionGame';
import ruleOfThree from '../Game/RuleOfThree/RuleOfThreeGame';
import dimensionDiscovery from '../Game/DimensionDiscovery/DimensionDiscoveryGame';
import areaQuest from '../Game/AreaQuest/AreaQuestGame';
import perimeterPatrol from '../Game/PerimeterPatrol/PerimeterPatrolGame';
import angleMaster from '../Game/AngleMaster/AngleMasterGame';
import volumeQuest from '../Game/VolumeQuest/VolumeQuestGame';
import piSplash from '../Game/PiSplash/PiSplashGame';
import pyramidPower from '../Game/PyramidPower/PyramidPowerGame';
import coneZone from '../Game/ConeZone/ConeZoneGame';
import sphereForce from '../Game/SphereForce/SphereForceGame';
import symmetryShock from '../Game/SymmetryShock/SymmetryShockGame';
import scaleExplorer from '../Game/ScaleExplorer/ScaleExplorerGame';
import scientificScale from '../Game/ScientificScale/ScientificScaleGame';
import rollingPi from '../Game/RollingPi/RollingPiGame';
import percentPotion from '../Game/PercentPotion/PercentPotionGame';

import { games } from '../../config/GameConfig';

// Component Map
// const GAME_VARIANTS = {
//     'column-addition': columnAddition,
//     'column-subtraction': columnSubtraction,
//     'column-multiplication': columnMultiplication,
//     'long-division': longDivision,
//     'power-of-10': powerOfTen,
//     'place-value': placeValue,
//     'power-rebuilder': powerRebuilder,
//     'stack-align': stackAlign,
//     'unit-master': unitMaster,
//     'fraction-slicer': fractionSlicer,
//     'fraction-match': fractionMatch,
//     'simplify-smash': simplifySmash,
//     'simplify-express': simplifyExpress,
//     'fraction-scale': fractionScale,
//     'proportion-game': proportion,
//     'rule-of-three': ruleOfThree,
//     'percent-potion': percentPotion,
//     'dimension-discovery': dimensionDiscovery,
//     'area-quest': areaQuest,
//     'perimeter-patrol': perimeterPatrol,
//     'angle-master': angleMaster,
//     'volume-quest': volumeQuest,
//     'pi-splash': piSplash,
//     'pyramid-power': pyramidPower,
//     'cone-zone': coneZone,
//     'sphere-force': sphereForce,
//     'symmetry-shock': symmetryShock,
//     'scale-explorer': scaleExplorer,
//     'scientific-scale': scientificScale,
//     'rolling-pi': rollingPi
// };


export const GAME_VARIANTS = games.reduce((acc, game) => {
    acc[game.id] = game.component;
    return acc;
}, {});

const TestRunner = ({ onBack }) => {
    const { t } = useLanguage();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [results, setResults] = useState([]); // { correct: boolean }
    const [phase, setPhase] = useState('MENU'); // MENU, RUNNING, SUMMARY, HISTORY
    const [timeLeft, setTimeLeft] = useState(0); // If we add timer later

    // Score management for test runner
    const { progress, saveProgress } = useGameState('test-runner');
    const highScore = progress.score || 0;
    const history = progress.history || [];

    const startTest = () => {
        // Generate Questions
        const qList = [];
        const enabledGames = getEnabledTestGames();

        if (enabledGames.length === 0) {
            alert(t('noGamesEnabled')); // Should handle UI gracefully
            return;
        }

        for (let i = 0; i < TEST_CONFIG.totalQuestions; i++) {
            // Weighted random selection could go here, for now simple random
            const randomGameConfig = enabledGames[Math.floor(Math.random() * enabledGames.length)];
            const fullConfig = getTestGameConfig(randomGameConfig.id);

            const range = randomGameConfig.levelRange || TEST_CONFIG.defaultLevelRange;
            const randomLevel = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

            qList.push({
                gameId: randomGameConfig.id,
                gameLabel: fullConfig?.title || randomGameConfig.id, // Use title from main config
                level: randomLevel
            });
        }
        setQuestions(qList);
        setCurrentQuestionIndex(0);
        setResults([]);
        setPhase('RUNNING');
    };

    const handleQuestionComplete = (success) => {
        // If failed, maybe give a chance to retry? 
        // For now, strict mode: 1 fail = wrong.
        // User asked for control. Let's add an overlay if failed?

        const newResults = [...results, {
            correct: success,
            gameId: questions[currentQuestionIndex].gameId,
            level: questions[currentQuestionIndex].level,
            timestamp: Date.now()
        }];
        setResults(newResults);

        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishTest(newResults);
        }
    };

    const finishTest = (finalResults) => {
        setPhase('SUMMARY');
        const correctCount = finalResults.filter(r => r.correct).length;
        const total = finalResults.length;
        const percentage = Math.round((correctCount / total) * 100);

        // Save History
        const newHistoryItem = {
            date: new Date().toISOString(),
            score: percentage,
            results: finalResults
        };

        const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Keep last 50

        saveProgress({
            score: Math.max(percentage, highScore),
            history: updatedHistory
        });
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString() + ' ' + new Date(isoString).toLocaleTimeString();
    };

    if (phase === 'MENU') {
        return (
            <div className="test-menu fade-in">
                <div className="test-card-large pl-4 pr-4 bg-white rounded-xl shadow-xl text-center">
                    <h1 className="text-4xl font-bold mb-4 text-blue-600">{t('feature.testRunner.title')}</h1>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">{t('feature.testRunner.desc')}</p>

                    <div className="menu-stats mb-8">
                        <div className="stat-box">
                            <span className="label text-sm uppercase text-gray-400 font-bold">Best Score</span>
                            <span className="value text-3xl font-bold text-blue-600">{highScore}%</span>
                        </div>
                        <div className="stat-box mt-4">
                            <span className="label text-sm uppercase text-gray-400 font-bold">Tests Taken</span>
                            <span className="value text-xl font-bold text-gray-700">{history.length}</span>
                        </div>
                    </div>

                    <div className="menu-actions flex flex-col gap-4 max-w-xs mx-auto">
                        <button className="btn-primary w-full py-4 text-xl" onClick={startTest}>
                            {t('btn.play')} ▶
                        </button>
                        {history.length > 0 && (
                            <button className="btn-secondary w-full" onClick={() => setPhase('HISTORY')}>
                                📜 History
                            </button>
                        )}
                        <button className="btn-secondary w-full" onClick={onBack}>
                            {t('btn.back')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'HISTORY') {
        return (
            <div className="test-history fade-in p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Test History</h2>
                    <button className="btn-secondary" onClick={() => setPhase('MENU')}>Back</button>
                </div>
                <div className="history-list space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {history.map((item, idx) => (
                        <div key={idx} className="history-item flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                            <div>
                                <div className="text-sm text-gray-500">{formatDate(item.date)}</div>
                                <div className="text-xs text-gray-400">{item.results.length} Questions</div>
                            </div>
                            <div className={`score-badge text-xl font-bold ${item.score >= 80 ? 'text-green-600' : item.score >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                                {item.score}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (phase === 'SUMMARY') {
        const correctCount = results.filter(r => r.correct).length;
        const percentage = Math.round((correctCount / results.length) * 100);

        return (
            <div className="test-summary fade-in">
                <div className="summary-card">
                    <h2>Test Complete!</h2>
                    <div className="score-circle">
                        <span className="score-number">{percentage}%</span>
                        <span className="score-label">Score</span>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <label>Correct</label>
                            <span>{correctCount} / {TEST_CONFIG.totalQuestions}</span>
                        </div>
                        <div className="stat-item">
                            <label>High Score</label>
                            <span>{Math.max(percentage, highScore)}%</span>
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button className="btn-primary" onClick={startTest}>Retry Test ↺</button>
                        <button className="btn-secondary" onClick={() => setPhase('MENU')}>Main Menu</button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return <div className="test-runner-loading">Loading...</div>; // Safety check
    const GameComponent = GAME_VARIANTS[currentQ.gameId];

    return (
        <div className="test-runner-container">
            <div className="test-header">
                <div className="test-progress-bar">
                    <div
                        className="test-progress-fill"
                        style={{ width: `${((currentQuestionIndex) / TEST_CONFIG.totalQuestions) * 100}%` }}
                    />
                </div>
                <div className="test-info">
                    <span>Question {currentQuestionIndex + 1} / {TEST_CONFIG.totalQuestions}</span>
                    <span className="game-label">{currentQ.gameLabel} - Level {currentQ.level}</span>
                </div>
                {/* Abort button */}
                <button className="btn-abort" onClick={() => setPhase('MENU')}>✖</button>
            </div>

            <div className="test-game-wrapper">
                {GameComponent ? (
                    <GameComponent
                        key={`${currentQ.gameId}-${currentQuestionIndex}`} // Force remount
                        onBack={() => setPhase('MENU')} // Or maybe disable back?
                        isTestMode={true}
                        testLevel={currentQ.level}
                        onTestComplete={handleQuestionComplete}
                    />
                ) : (
                    <div>Error loading game</div>
                )}
            </div>
        </div>
    );
};

export default TestRunner;
