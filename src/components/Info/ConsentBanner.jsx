import React, { useState, useEffect } from 'react';
import './ConsentBanner.css';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner">
            <div className="cookie-content">
                <p>
                    We use cookies to enhance your experience and analyze our traffic.
                    By clicking "Accept", you consent to our use of cookies.
                    <a href="/privacy">Learn more</a>.
                </p>
                <div className="cookie-buttons">
                    <button onClick={handleDecline} className="btn-decline">Decline</button>
                    <button onClick={handleAccept} className="btn-accept">Accept</button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
