import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { getAllProgress } from '../../hooks/useGameState';
import { useLanguage } from '../../context/LanguageContext';
import MathContent from '../MathConcept/MathContent';

import { games as configGames } from '../../config/GameConfig';

const Dashboard = ({ onSelectGame }) => {
    const [allProgress, setAllProgress] = useState({});
    const { t, language, toggleLanguage } = useLanguage();

    useEffect(() => {
        setAllProgress(getAllProgress());
    }, []);

    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', label: t('dashboard.all') },
        { id: 'premath', label: t('category.premath') },
        { id: 'number-sense', label: t('category.numberSense') },
        { id: 'fractions', label: t('category.fractions') },
        { id: 'geometry', label: t('category.geometry') },
        { id: 'proportions', label: t('category.proportions') },
        { id: 'units', label: t('category.units') },
    ];

    const [searchTerm, setSearchTerm] = useState('');

    const games = configGames.map(game => ({
        ...game,
        title: t(`${game.translationKey}.title`),
        description: t(`${game.translationKey}.desc`)
    }));

    const filteredGames = games.filter(game => {
        const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalLevels = Object.values(allProgress).reduce((acc, curr) => acc + (curr.level - 1), 0);
    const totalWins = Object.values(allProgress).reduce((acc, curr) => acc + (curr.wins || 0), 0);

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <div className="logo-area">
                    {/* Placeholder for Logo if needed */}
                </div>
                <button onClick={toggleLanguage} className="language-toggle" aria-label="Toggle Language">
                    {language === 'en' ? '🇫🇷' : '🇺🇸'}
                </button>
            </div>

            <div className="dashboard-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        {language === 'en' ? 'Ready to Master Math?' : 'Prêt à Maîtriser les Maths?'}
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
                        {language === 'en'
                            ? 'Select a game below to start your journey.'
                            : 'Sélectionnez un jeu ci-dessous pour commencer votre voyage.'}
                    </p>

                    <div className="hero-stats">
                        <div className="hero-stat-item">
                            <span className="hero-stat-value">{totalLevels}</span>
                            <span className="hero-stat-label">{t('level')}s Up</span>
                        </div>
                        <div className="hero-stat-item">
                            <span className="hero-stat-value">{totalWins}</span>
                            <span className="hero-stat-label">{language === 'en' ? 'Total Wins' : 'Victoires'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder={language === 'en' ? "Search for a game..." : "Rechercher un jeu..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="category-nav">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="games-grid">
                {filteredGames.map((game) => {
                    const progress = allProgress[game.id] || { level: 1, score: 0, wins: 0 };
                    return (
                        <div key={game.id} className="game-card" onClick={() => onSelectGame(game.id)} style={{ '--card-color': game.color }}>
                            <div className="game-icon">
                                {game.icon}
                            </div>
                            <div className="game-info">
                                <h2 className="game-title">{game.title}</h2>
                                <p className="game-description">{game.description}</p>
                                <div className="game-stats">
                                    <span className="stat-label">{t('level')}:</span>
                                    <span className="stat-value">{progress.level}</span>
                                    {progress.wins > 0 && (
                                        <span className="stat-badge wins">🏆 {progress.wins}</span>
                                    )}
                                </div>
                            </div>

                            <div className="game-actions">
                                <button className="btn btn-secondary learn-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectGame(`learn-${game.id}`);
                                    }}
                                >
                                    🎓 {language === 'en' ? 'Learn' : 'Apprendre'}
                                </button>
                                <button className="btn btn-primary play-btn">
                                    {progress.level > 1 ? t('btn.continue') : t('btn.play')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredGames.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <h3>{language === 'en' ? 'No games found.' : 'Aucun jeu trouvé.'}</h3>
                    <p>{language === 'en' ? 'Try adjusting your search.' : 'Essayez d\'ajuster votre recherche.'}</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
