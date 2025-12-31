import React from 'react';
import UnitGameBase from './UnitGameBase';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const UnitCapacityGame = ({ onBack, isTestMode, testLevel, onTestComplete }) => {
    const { language, t: globalT } = useLanguage();

    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const config = {
        id: 'unit-capacity',
        title: t('capacityTitle'),
        color: '#0ea5e9', // Sky Blue
        units: [
            { name: t('kiloliter'), symbol: 'kL', factor: 1000 },
            { name: t('hectoliter'), symbol: 'hL', factor: 100 },
            { name: t('decaliter'), symbol: 'daL', factor: 10 },
            { name: t('liter'), symbol: 'L', factor: 1, subtitle: 'dm³' },
            { name: t('deciliter'), symbol: 'dL', factor: 0.1 },
            { name: t('centiliter'), symbol: 'cL', factor: 0.01 },
            { name: t('milliliter'), symbol: 'mL', factor: 0.001, subtitle: 'cm³' }
        ],
        intro: [
            { text: t('capacityIntro0'), visual: "🥛" },
            { text: t('capacityIntro1') },
            { text: t('capacityIntro2') },
            { text: t('capacityIntro3') },
            { text: t('capacityIntro4') }
        ]
    };

    return <UnitGameBase config={config} onBack={onBack} isTestMode={isTestMode} testLevel={testLevel} onTestComplete={onTestComplete} />;
};

export default UnitCapacityGame;
