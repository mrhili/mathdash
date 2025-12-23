import React from 'react';
import InfoLayout from './InfoLayout';

const TermsConditions = ({ onBack, onNavigate }) => {
    return (
        <InfoLayout title="Terms & Conditions" onBack={onBack} onNavigate={onNavigate}>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing and using Math Dashboard, you agree to be bound by these Terms and Conditions.
                If you do not agree, please do not use our service.
            </p>

            <h2>2. Subscription Requirement</h2>
            <p>
                <strong>Math Dashboard is a subscription-based service.</strong> A valid subscription is required to access the full library of games and features.
                Free trials may be offered at our discretion.
            </p>

            <h2>3. User Accounts</h2>
            <p>
                You are responsible for maintaining the confidentiality of your account credentials.
                You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>
                Our platform is designed for children. You agree not to use the service for any unlawful purpose or in any way
                that could harm, disable, or impair the service. Harassment or inappropriate behavior is strictly prohibited.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
                All content, games, and graphics are the property of AmineOnline and are protected by copyright laws.
                You may not reproduce or distribute any content without our permission.
            </p>

            <h2>6. Termination</h2>
            <p>
                We reserve the right to terminate or suspend your account if you violate these Terms.
            </p>

            <h2>7. Contact Information</h2>
            <p>
                For any questions regarding these Terms, please contact us at support@amineonline.com.
            </p>
        </InfoLayout>
    );
};

export default TermsConditions;
