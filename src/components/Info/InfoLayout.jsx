import React from 'react';
import Footer from '../Layout/Footer';
import './InfoLayout.css';

const InfoLayout = ({ children, title, onNavigate, onBack }) => {
    return (
        <div className="legal-layout">
            <header className="legal-header">
                <div className="header-content">
                    <button onClick={onBack} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back to Dashboard</button>
                    <h1>{title}</h1>
                </div>
            </header>
            <main className="legal-content">
                {children}
            </main>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default InfoLayout;
