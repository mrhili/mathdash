import React from 'react';
import UnitGameBase from './UnitGameBase';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const UnitAreaGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { language, t: globalT } = useLanguage();

    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const config = {
        id: 'unit-area',
        title: t('areaTitle'),
        color: '#10b981', // Emerald
        units: [
            { name: t('sqKm'), symbol: 'km²', factor: 1000000 },
            { name: t('hectare'), symbol: 'ha', factor: 10000 },
            { name: t('are'), symbol: 'a', factor: 100 },
            { name: t('sqMeter'), symbol: 'm²', factor: 1 },
            { name: t('sqDm'), symbol: 'dm²', factor: 0.01 },
            { name: t('sqCm'), symbol: 'cm²', factor: 0.0001 },
            { name: t('sqMm'), symbol: 'mm²', factor: 0.000001 }
        ],
        intro: [
            { text: t('areaIntro0'), visual: "🔲" },
            { text: t('areaIntro1') },
            { text: t('areaIntro2') },
            { text: t('areaIntro3') },
            { text: t('areaIntro4') }
        ]
    };

    return <UnitGameBase config={config} onBack={onBack} isTestMode={isTestMode} testLevel={testLevel} onTestComplete={onTestComplete} />;
};

export default UnitAreaGame;
