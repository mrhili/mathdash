// Game Configuration for Test Runner
// Defines which games are included and the difficulty range per game.

import { games as allGames } from '../../config/GameConfig';

export const TEST_CONFIG = {
    totalQuestions: 10,
    // Global fallback range if not specified per game
    defaultLevelRange: { min: 5, max: 20 },

    // Games to include in the test pool
    games: [
        { id: 'column-addition', enabled: true, levelRange: { min: 10, max: 50 }, weight: 1 },
        { id: 'column-subtraction', enabled: true, levelRange: { min: 10, max: 50 }, weight: 1 },
        { id: 'column-multiplication', enabled: true, levelRange: { min: 10, max: 25 }, weight: 1 },
        { id: 'long-division', enabled: true, levelRange: { min: 5, max: 35 }, weight: 1.5 },
        { id: 'power-of-10', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'place-value', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'power-rebuilder', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'stack-align', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'unit-master', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },

        { id: 'fraction-match', enabled: true, levelRange: { min: 1, max: 50 }, weight: 1 }, // Levels go high here
        { id: 'simplify-smash', enabled: true, levelRange: { min: 1, max: 50 }, weight: 1 },
        { id: 'simplify-express', enabled: true, levelRange: { min: 1, max: 50 }, weight: 1 },
        { id: 'fraction-scale', enabled: true, levelRange: { min: 1, max: 50 }, weight: 1 },
        { id: 'proportion-game', enabled: true, levelRange: { min: 1, max: 30 }, weight: 1 },
        { id: 'rule-of-three', enabled: true, levelRange: { min: 1, max: 30 }, weight: 1 },
        { id: 'percent-potion', enabled: true, levelRange: { min: 1, max: 30 }, weight: 1 },
        { id: 'dimension-discovery', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'area-quest', enabled: true, levelRange: { min: 1, max: 10 }, weight: 1 },
        { id: 'perimeter-patrol', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'angle-master', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'volume-quest', enabled: true, levelRange: { min: 1, max: 10 }, weight: 1 },
        { id: 'pi-splash', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'pyramid-power', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'cone-zone', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'sphere-force', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'symmetry-shock', enabled: true, levelRange: { min: 1, max: 50 }, weight: 1 },
        { id: 'scale-explorer', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'scientific-scale', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },
        { id: 'rolling-pi', enabled: true, levelRange: { min: 1, max: 5 }, weight: 1 },

        { id: 'unit-length', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'unit-mass', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'unit-capacity', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'unit-area', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'unit-volume', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },
        { id: 'unit-time', enabled: true, levelRange: { min: 1, max: 20 }, weight: 1 },



        { id: 'fraction-slicer', enabled: false, levelRange: { min: 1, max: 20 }, weight: 1 },
    ]
};

// Helper to get enabled games
export const getEnabledTestGames = () => {
    return TEST_CONFIG.games.filter(g => g.enabled);
};

// Helper to merge with main config labels
export const getTestGameConfig = (gameId) => {
    const mainConfig = allGames.find(g => g.id === gameId);
    const testConfig = TEST_CONFIG.games.find(g => g.id === gameId);

    if (!mainConfig || !testConfig) return null;

    return {
        ...mainConfig,
        ...testConfig
    };
};
