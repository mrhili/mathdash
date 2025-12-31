import React from 'react';
import UnitGameBase from './UnitGameBase';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const UnitLengthGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { language, t: globalT } = useLanguage();

    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const config = {
        id: 'unit-length',
        title: t('lengthTitle'),
        color: '#3b82f6', // Blue
        units: [
            { name: t('kilometer'), symbol: 'km', factor: 1000 },
            { name: t('hectometer'), symbol: 'hm', factor: 100 },
            { name: t('decameter'), symbol: 'dam', factor: 10 },
            { name: t('meter'), symbol: 'm', factor: 1 },
            { name: t('decimeter'), symbol: 'dm', factor: 0.1 },
            { name: t('centimeter'), symbol: 'cm', factor: 0.01 },
            { name: t('millimeter'), symbol: 'mm', factor: 0.001 }
        ],
        intro: [
            { text: t('lengthIntro0'), visual: "📏" },
            { text: t('lengthIntro1') },
            { text: t('lengthIntro2') },
            { text: t('lengthIntro3') },
            { text: t('lengthIntro4') }
        ]
    };

    return <UnitGameBase config={config} onBack={onBack} isTestMode={isTestMode} testLevel={testLevel} onTestComplete={onTestComplete} />;
};

export default UnitLengthGame;
