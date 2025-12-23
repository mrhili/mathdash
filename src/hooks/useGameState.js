import { useState, useEffect } from 'react';

const STORAGE_KEY = 'math_dashboard_progress';

export const useGameState = (gameId) => {
    const [progress, setProgress] = useState({
        level: 1,
        score: 0,
        wins: 0,
        isComplete: false
    });

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (data[gameId]) {
                setProgress(data[gameId]);
            }
        }
    }, [gameId]);

    const saveProgress = (newProgress) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};

        // Merge with existing
        const updated = {
            ...data,
            [gameId]: {
                ...progress,
                ...newProgress
            }
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setProgress(updated[gameId]);
    };

    const completeLevel = (nextLevel, scoreToAdd) => {
        saveProgress({
            level: nextLevel,
            score: progress.score + scoreToAdd
        });
    };

    const winGame = (finalScoreBonus = 0) => {
        saveProgress({
            level: 1, // Reset level for replay? Or keep at 50? User said "count of repetition is saved"
            // Let's reset level to 1 so they can play again, but keep score? 
            // Usually "New Game+" resets level but keeps stats. 
            // Let's reset level to 1, add to wins.
            score: progress.score + finalScoreBonus,
            wins: progress.wins + 1,
            isComplete: true
        });
    };

    return {
        progress,
        saveProgress,
        completeLevel,
        winGame
    };
};

export const getAllProgress = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
};
