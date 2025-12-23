import React, { useState } from 'react';
import InfoLayout from '../Info/InfoLayout';
import './MathConcept.css';
import { mathContent } from './MathContent.jsx';
import { useLanguage } from '../../context/LanguageContext';

const MathConcept = ({ gameId, GameComponent, onBack, onNavigate }) => {
    const { language } = useLanguage();
    const [isPracticing, setIsPracticing] = useState(false);
    const rawContent = mathContent[gameId];

    if (!rawContent) {
        return (
            <InfoLayout title="Concept Not Found" onBack={onBack} onNavigate={onNavigate}>
                <p>Sorry, educational content for this game is coming soon!</p>
            </InfoLayout>
        );
    }

    // Determine content based on structure (bilingual vs legacy flat)
    const content = rawContent[language] || rawContent['en'] || rawContent;

    return (
        <InfoLayout title={content.title} onBack={onBack} onNavigate={onNavigate}>
            <div className="math-concept-container">
                <section className="concept-explanation">
                    <h2>{language === 'fr' ? 'Comprendre les Maths' : 'Understanding the Math'}</h2>
                    <div className="explanation-text">
                        {content.explanation}
                    </div>
                </section>

                <section className="concept-infographic">
                    <h2>{language === 'fr' ? 'Guide Visuel' : 'Visual Guide'}</h2>
                    <div className="infographic-placeholder">
                        <div className="infographic-content">
                            {content.infographic}
                        </div>
                    </div>
                </section>

                {GameComponent && (
                    <div className="concept-actions" style={{ marginTop: '3rem', textAlign: 'center', paddingBottom: '2rem' }}>
                        {!isPracticing ? (
                            <button
                                className="btn-practice"
                                onClick={() => setIsPracticing(true)}
                                style={{
                                    padding: '1rem 2rem',
                                    fontSize: '1.2rem',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    marginBottom: '1rem'
                                }}
                            >
                                {language === 'fr' ? 'S\'entraîner Maintenant' : 'Practice This Concept'} 🎮
                            </button>
                        ) : (
                            <div className="inline-game-container fade-in" style={{ borderTop: '2px dashed #ccc', paddingTop: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#666' }}>
                                    {language === 'fr' ? 'Mode Entraînement' : 'Practice Mode'}
                                </h3>
                                <GameComponent onBack={() => setIsPracticing(false)} />
                                <button
                                    onClick={() => setIsPracticing(false)}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.5rem 1rem',
                                        background: '#eee',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {language === 'fr' ? 'Fermer le jeu' : 'Close Game'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </InfoLayout>
    );
};

export default MathConcept;
