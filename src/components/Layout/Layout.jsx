import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Calculator from '../Tools/Calculator';
import './Layout.css';
import Footer from './Footer';

const Layout = ({ children, onNavigate, activeGame }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <span className="logo-icon">🔢</span>
            <span className="logo-text">MathGames</span>
          </div>
          <nav className="nav">
            {activeGame && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => onNavigate(`learn-${activeGame}`)}
                style={{ marginRight: '0.5rem' }}
              >
                🎓 Concept
              </button>
            )}
            <button
              className={`btn btn-sm ${showCalculator ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowCalculator(!showCalculator)}
              style={{ marginRight: '0.5rem' }}
            >
              🧮 Calc
            </button>
            <button className="btn btn-sm" onClick={() => setIsModalOpen(true)}>
              About
            </button>
          </nav>
        </div>
      </header>
      <main className="main-content container">
        {children}
      </main>

      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}

      <Footer onNavigate={onNavigate} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="About Math Games"
      >
        <p>Welcome to the Math Games Dashboard!</p>
        <br />
        <h3>How to Play:</h3>
        <p><strong>Power of 10:</strong> Master multiplication and division by powers of 10. Answer correctly to increase your score and level up!</p>
        <br />
        <p>More games coming soon.</p>
      </Modal>
    </div>
  );
};

export default Layout;
