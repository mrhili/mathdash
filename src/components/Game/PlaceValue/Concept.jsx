import React from 'react';

export const Concept = {
    en: {
        title: "Understanding Place Value",
        explanation: (
            <>
                <p>Every digit in a number has a value based on its position. This is called place value.</p>
                <p>In the number 345:</p>
                <ul>
                    <li><strong>5</strong> is in the ones place (Value: 5)</li>
                    <li><strong>4</strong> is in the tens place (Value: 40)</li>
                    <li><strong>3</strong> is in the hundreds place (Value: 300)</li>
                </ul>
            </>
        ),
        infographic: (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '1.5rem' }}>
                <div style={{ border: '1px solid #ccc', padding: '1rem' }}>300</div>
                <div>+</div>
                <div style={{ border: '1px solid #ccc', padding: '1rem' }}>40</div>
                <div>+</div>
                <div style={{ border: '1px solid #ccc', padding: '1rem' }}>5</div>
            </div>
        )
    },
    fr: {
        title: "Comprendre la Valeur de Position",
        explanation: (
            <>
                <p>Chaque chiffre dans un nombre a une valeur basée sur sa position. C'est ce qu'on appelle la valeur de position.</p>
                <p>Dans le nombre 345 :</p>
                <ul>
                    <li><strong>5</strong> est à la place des unités (Valeur : 5)</li>
                    <li><strong>4</strong> est à la place des dizaines (Valeur : 40)</li>
                    <li><strong>3</strong> est à la place des centaines (Valeur : 300)</li>
                </ul>
            </>
        ),
        infographic: (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '1.5rem' }}>
                <div style={{ border: '1px solid #ccc', padding: '1rem' }}>300</div>
                <div>+</div>
                <div style={{ border: '1px solid #ccc', padding: '1rem' }}>40</div>
                <div>+</div>
                <div style={{ border: '1px solid #ccc', padding: '1rem' }}>5</div>
            </div>
        )
    }
};
