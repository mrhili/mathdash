import React from 'react';
import UnitGameBase from './UnitGameBase';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const UnitMassGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { language, t: globalT } = useLanguage();

    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const config = {
        id: 'unit-mass',
        title: t('massTitle'),
        color: '#f59e0b', // Amber
        units: [
            { name: t('ton'), symbol: 't', factor: 1000000 },
            { name: t('quintal'), symbol: 'q', factor: 100000 },
            { name: t('point'), symbol: '.', factor: 10000 },
            { name: t('kilogram'), symbol: 'kg', factor: 1000 },
            { name: t('hectogram'), symbol: 'hg', factor: 100 },
            { name: t('decagram'), symbol: 'dag', factor: 10 },
            { name: t('gram'), symbol: 'g', factor: 1 },
            { name: t('decigram'), symbol: 'dg', factor: 0.1 },
            { name: t('centigram'), symbol: 'cg', factor: 0.01 },
            { name: t('milligram'), symbol: 'mg', factor: 0.001 }
        ],
        intro: [
            { text: t('massIntro0'), visual: "⚖️" },
            { text: t('massIntro1') },
            { text: t('massIntro2') },
            { text: t('massIntro3') },
            { text: t('massIntro4') }
        ]
    };

    return <UnitGameBase config={config} onBack={onBack} isTestMode={isTestMode} testLevel={testLevel} onTestComplete={onTestComplete} />;
};

export default UnitMassGame;
