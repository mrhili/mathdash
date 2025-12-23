import React from 'react';
import InfoLayout from './InfoLayout';

const PrivacyPolicy = ({ onBack, onNavigate }) => {
    return (
        <InfoLayout title="Privacy Policy" onBack={onBack} onNavigate={onNavigate}>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Introduction</h2>
            <p>
                Welcome to Math Dashboard. We are committed to protecting the privacy of our users, especially children.
                This Privacy Policy explains how we collect, use, and safeguard your information.
            </p>

            <h2>2. Children's Privacy (COPPA & GDPR-K)</h2>
            <p>
                We take children's privacy very seriously. We do not knowingly collect personal information from children under 13
                without verifiable parental consent. Our games are designed to be safe and educational.
            </p>

            <h2>3. Information We Collect</h2>
            <ul>
                <li><strong>Account Information:</strong> When you subscribe, we collect email addresses for account management and billing purposes.</li>
                <li><strong>Game Progress:</strong> We store game progress locally on your device to track levels and scores.</li>
                <li><strong>Usage Data:</strong> We may collect anonymous usage data to improve our services.</li>
            </ul>

            <h2>4. How We Use Information</h2>
            <p>
                We use the collected information solely to:
            </p>
            <ul>
                <li>Provide and maintain the Service.</li>
                <li>Process subscription payments.</li>
                <li>Track game progress and achievements.</li>
            </ul>
            <p>
                We do NOT sell your data to third parties.
            </p>

            <h2>5. Parental Rights</h2>
            <p>
                Parents have the right to review their child's personal information, request its deletion, and refuse further collection.
                Please contact us at support@amineonline.com to exercise these rights.
            </p>

            <h2>6. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at support@amineonline.com.
            </p>
        </InfoLayout>
    );
};

export default PrivacyPolicy;
