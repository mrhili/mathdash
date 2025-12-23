import React from 'react';
import UnitGameBase from './UnitGameBase';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const UnitTimeGame = ({ onBack }) => {
    const { language, t: globalT } = useLanguage();

    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const config = {
        id: 'unit-time',
        title: t('timeTitle'),
        color: '#ec4899', // Pink
        units: [
            { name: t('year'), symbol: 'y', factor: 31536000 }, // 365 * 24 * 3600
            { name: t('day'), symbol: 'd', factor: 86400 }, // 24 * 3600
            { name: t('hour'), symbol: 'h', factor: 3600 },
            { name: t('minute'), symbol: 'min', factor: 60 },
            { name: t('second'), symbol: 's', factor: 1 }
        ],
        intro: [
            { text: t('timeIntro0'), visual: "⏳" },
            { text: t('timeIntro1') },
            { text: t('timeIntro2') },
            { text: t('timeIntro3'), interaction: { answer: 60 } },
            { text: t('timeIntro4'), interaction: { answer: 60 } },
            { text: t('timeIntro5'), interaction: { answer: 120 } },
            { text: t('timeIntro6') }
        ]
    };

    return <UnitGameBase config={config} onBack={onBack} />;
};

export default UnitTimeGame;
