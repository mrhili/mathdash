import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export const Concept = ({ onStart }) => {
    const { t } = useLanguage();
    // In a real app, I'd move these texts to translation files too.
    return (
        <div className="concept-container">
            <div className="concept-content">
                <h2>Column Addition</h2>
                <p>Add numbers column by column, from right to left!</p>
                <div className="concept-demo">
                    <p> 1 5</p>
                    <p>+ 2 6</p>
                    <hr />
                    <p> 4 1</p>
                    <small>(5+6=11, write 1, carry 1)</small>
                </div>
                <button className="btn-primary" onClick={onStart}>{t('start') || "Start"}</button>
            </div>
        </div>
    );
};
