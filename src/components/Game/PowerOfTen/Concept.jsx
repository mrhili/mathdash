import React from 'react';

export const Concept = {
    en: {
        title: "Multiplying & Dividing by Powers of 10",
        explanation: (
            <>
                <p>
                    When you multiply a number by a power of 10 (like 10, 100, 1000), you are essentially shifting the decimal point to the right.
                </p>
                <ul>
                    <li><strong>x 10:</strong> Shift decimal 1 place right.</li>
                    <li><strong>x 100:</strong> Shift decimal 2 places right.</li>
                    <li><strong>x 1000:</strong> Shift decimal 3 places right.</li>
                </ul>
                <p>
                    Dividing is the opposite! You shift the decimal point to the left.
                </p>
            </>
        ),
        infographic: (
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                <div>3.14 x 10 = 31.4</div>
                <div style={{ color: 'blue', marginTop: '1rem' }}>➡️ Shift Right</div>
            </div>
        )
    },
    fr: {
        title: "Multiplier et Diviser par des Puissances de 10",
        explanation: (
            <>
                <p>
                    Lorsque vous multipliez un nombre par une puissance de 10 (comme 10, 100, 1000), vous déplacez essentiellement la virgule vers la droite.
                </p>
                <ul>
                    <li><strong>x 10 :</strong> Déplacer la virgule de 1 rang vers la droite.</li>
                    <li><strong>x 100 :</strong> Déplacer la virgule de 2 rangs vers la droite.</li>
                    <li><strong>x 1000 :</strong> Déplacer la virgule de 3 rangs vers la droite.</li>
                </ul>
                <p>
                    La division est l'inverse ! Vous déplacez la virgule vers la gauche.
                </p>
            </>
        ),
        infographic: (
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                <div>3,14 x 10 = 31,4</div>
                <div style={{ color: 'blue', marginTop: '1rem' }}>➡️ Déplacer vers la Droite</div>
            </div>
        )
    }
};
