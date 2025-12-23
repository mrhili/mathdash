import React from 'react';

export const Concept = () => {
    return (
        <div className="concept-container">
            <h2>Column Multiplication</h2>
            <p>
                Multiplication is just fast addition! When numbers get big, we stack them
                in columns to keep track of <strong>Place Value</strong>.
            </p>

            <div className="concept-visual" style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '12px',
                margin: '2rem 0',
                fontFamily: 'monospace',
                fontSize: '1.5rem',
                textAlign: 'center'
            }}>
                <div style={{ display: 'inline-block', textAlign: 'right' }}>
                    <div>12</div>
                    <div>× 3</div>
                    <div style={{ borderTop: '2px solid black' }}>36</div>
                </div>
            </div>

            <h3>Why do we put a Zero?</h3>
            <p>
                When you multiply by the second digit (the <strong>Tens</strong> place),
                you are actually multiplying by 10, 20, 30...
            </p>
            <p>
                Multiplying by 10 always adds a <strong>0</strong> at the end.
                So we write the 0 first to shift everything to the left!
            </p>

            <div className="concept-visual" style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '12px',
                marginTop: '1rem',
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                textAlign: 'center'
            }}>
                12 × 1<span style={{ color: 'red', fontWeight: 'bold' }}>0</span> = 12<span style={{ color: 'red', fontWeight: 'bold' }}>0</span>
            </div>
        </div>
    );
};
