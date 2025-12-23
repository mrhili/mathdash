import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export const Concept = ({ onStart }) => {
    const { t } = useLanguage();
    return (
        <div className="concept-container">
            <div className="concept-content">
                <h2>Column Subtraction</h2>
                <p>Subtract column by column.</p>
                <div className="concept-demo">
                    <p> 5 2</p>
                    <p>- 1 8</p>
                    <hr />
                    <p> 3 4</p>
                    <small>(Cant do 2-8! Borrow from 5. 5 becomes 4, 2 becomes 12. 12-8=4)</small>
                </div>
                <button className="btn-primary" onClick={onStart}>{t('start') || "Start"}</button>
            </div>
        </div>
    );
};
