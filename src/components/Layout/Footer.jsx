import React from 'react';
import './Footer.css';

const Footer = ({ onNavigate }) => {
    const currentYear = new Date().getFullYear();

    const handleNavigation = (e, page) => {
        e.preventDefault();
        if (onNavigate) {
            onNavigate(page);
        }
    };

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-links">
                    <a href="/privacy" onClick={(e) => handleNavigation(e, 'privacy')}>Privacy Policy</a>
                    <a href="/terms" onClick={(e) => handleNavigation(e, 'terms')}>Terms & Conditions</a>
                    <a href="/gdpr" onClick={(e) => handleNavigation(e, 'gdpr')}>GDPR Compliance</a>
                </div>
                <div className="footer-copyright">
                    <p>
                        &copy; {currentYear} <a href="https://mrhili.github.io/devfolio/" target="_blank" rel="noopener noreferrer">AmineOnline</a>. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
