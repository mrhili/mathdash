import React from 'react';

export const Concept = {
    en: {
        title: "Understanding Fractions",
        explanation: (
            <>
                <p>
                    A fraction represents a part of a whole. The top number (numerator) tells you how many parts you have, and the bottom number (denominator) tells you how many equal parts make up a whole.
                </p>
                <p>
                    In Fraction Slicer, you are creating equal parts (denominator) and selecting a specific number of them (numerator).
                </p>
            </>
        ),
        infographic: (
            <div className="fraction-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'conic-gradient(orange 0% 25%, #ddd 25% 100%)' }}></div>
                <p>1/4</p>
            </div>
        )
    },
    fr: {
        title: "Comprendre les Fractions",
        explanation: (
            <>
                <p>
                    Une fraction représente une partie d'un tout. Le nombre du haut (numérateur) indique combien de parties vous avez, et le nombre du bas (dénominateur) indique combien de parties égales composent un tout.
                </p>
                <p>
                    Dans "Fraction Slicer", vous créez des parties égales (dénominateur) et en sélectionnez un nombre spécifique (numérateur).
                </p>
            </>
        ),
        infographic: (
            <div className="fraction-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'conic-gradient(orange 0% 25%, #ddd 25% 100%)' }}></div>
                <p>1/4</p>
            </div>
        )
    }
};
