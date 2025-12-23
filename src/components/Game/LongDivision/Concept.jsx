import React from 'react';

export const Concept = {
    en: {
        title: "Long Division Algorithm",
        explanation: (
            <div className="concept-content">
                <p>Long division is a step-by-step method for dividing large numbers. It breaks the problem down into small, manageable steps.</p>

                <h3>The 4 Steps (D.M.S.B)</h3>
                <ul className="step-list">
                    <li><strong>1. Divide (÷):</strong> How many times does the divisor fit into the current chunk?</li>
                    <li><strong>2. Multiply (×):</strong> Multiply your answer by the divisor.</li>
                    <li><strong>3. Subtract (−):</strong> Subtract to find the remainder.</li>
                    <li><strong>4. Bring Down (↓):</strong> Bring down the next digit.</li>
                </ul>

                <h3>Handling Decimals</h3>
                <p>If you have decimals (like <code>50.5 ÷ 0.5</code>), follow the <strong>Normalization Rule</strong>:</p>
                <div className="example-box">
                    <p>Shift the decimal point in <strong>BOTH</strong> numbers until they are whole numbers (or at least the divisor is whole).</p>
                    <p><code>50.5 ÷ 0.5</code> becomes <code>505 ÷ 5</code>.</p>
                </div>

                <h3>The Remainder Rule</h3>
                <p>If you have a remainder but no more digits to bring down, add a decimal point and a <strong>zero (0)</strong> to keep going!</p>
            </div>
        ),
        infographic: (
            <div className="infographic-diagram">
                <div className="dmsb-cycle">
                    <div className="step step-d">÷ Divide</div>
                    <div className="arrow">→</div>
                    <div className="step step-m">× Multiply</div>
                    <div className="arrow">→</div>
                    <div className="step step-s">− Subtract</div>
                    <div className="arrow">→</div>
                    <div className="step step-b">↓ Bring Down</div>
                    <div className="arrow loop">↻ (Repeat)</div>
                </div>
            </div>
        )
    },
    fr: {
        title: "Algorithme de la Division Euclidienne",
        explanation: (
            <div className="concept-content">
                <p>La division posée (ou pré-maths) est une méthode étape par étape pour diviser de grands nombres.</p>

                <h3>Les 4 Étapes (D.M.S.A)</h3>
                <ul className="step-list">
                    <li><strong>1. Diviser (÷) :</strong> Combien de fois le diviseur rentre-t-il dans le morceau actuel ?</li>
                    <li><strong>2. Multiplier (×) :</strong> Multiplie ta réponse par le diviseur.</li>
                    <li><strong>3. Soustraire (−) :</strong> Soustrais pour trouver le reste.</li>
                    <li><strong>4. Abaisser (↓) :</strong> Abaisse le chiffre suivant.</li>
                </ul>

                <h3>Gérer les Décimales</h3>
                <p>Si tu as des virgules (comme <code>50,5 ÷ 0,5</code>), suis la <strong>Règle de Normalisation</strong> :</p>
                <div className="example-box">
                    <p>Déplace la virgule dans les <strong>DEUX</strong> nombres jusqu'à ce qu'ils soient entiers (ou au moins que le diviseur le soit).</p>
                    <p><code>50,5 ÷ 0,5</code> devient <code>505 ÷ 5</code>.</p>
                </div>

                <h3>La Règle du Reste</h3>
                <p>Si tu as un reste mais plus de chiffres à abaisser, ajoute une virgule et un <strong>zéro (0)</strong> pour continuer !</p>
            </div>
        ),
        infographic: (
            <div className="infographic-diagram">
                <div className="dmsb-cycle">
                    <div className="step step-d">÷ Diviser</div>
                    <div className="arrow">→</div>
                    <div className="step step-m">× Multiplier</div>
                    <div className="arrow">→</div>
                    <div className="step step-s">− Soustraire</div>
                    <div className="arrow">→</div>
                    <div className="step step-b">↓ Abaisser</div>
                    <div className="arrow loop">↻ (Répéter)</div>
                </div>
            </div>
        )
    }
};
