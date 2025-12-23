import React from 'react';
import InfoLayout from './InfoLayout';

const GDPR = ({ onBack, onNavigate }) => {
    return (
        <InfoLayout title="GDPR Compliance" onBack={onBack} onNavigate={onNavigate}>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Your Rights Under GDPR</h2>
            <p>
                If you are a resident of the European Economic Area (EEA), you have certain data protection rights.
                Math Dashboard aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
            </p>

            <h2>2. Rights Summary</h2>
            <ul>
                <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
                <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
                <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data.</li>
                <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you.</li>
            </ul>

            <h2>3. Data Controller</h2>
            <p>
                AmineOnline is the Data Controller of your personal data.
            </p>

            <h2>4. Contact DPO</h2>
            <p>
                If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems,
                please contact our Data Protection Officer at support@amineonline.com.
            </p>
        </InfoLayout>
    );
};

export default GDPR;
