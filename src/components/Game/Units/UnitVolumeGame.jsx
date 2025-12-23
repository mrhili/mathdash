import React from 'react';
import UnitGameBase from './UnitGameBase';
import { useLanguage } from '../../../context/LanguageContext';
import { en, fr } from './translations';

const UnitVolumeGame = ({ onBack }) => {
    const { language, t: globalT } = useLanguage();

    const t = (key) => {
        const dict = language === 'en' ? en : fr;
        return dict[key] || globalT(key);
    };

    const config = {
        id: 'unit-volume',
        title: t('volumeTitle'),
        color: '#8b5cf6', // Violet
        units: [
            { name: t('cuKm'), symbol: 'km³', factor: 1000000000 },
            { name: t('cuHm'), symbol: 'hm³', factor: 1000000 },
            { name: t('cuDam'), symbol: 'dam³', factor: 1000 },
            { name: t('cuMeter'), symbol: 'm³', factor: 1 },
            { name: t('cuDm'), symbol: 'dm³', factor: 0.001 },
            { name: t('cuCm'), symbol: 'cm³', factor: 0.000001 },
            { name: t('cuMm'), symbol: 'mm³', factor: 0.000000001 }
        ],
        intro: [
            { text: t('volumeIntro0'), visual: "🧊" },
            { text: t('volumeIntro1') },
            { text: t('volumeIntro2') },
            { text: t('volumeIntro3') },
            { text: t('volumeIntro4') }
        ]
    };

    return <UnitGameBase config={config} onBack={onBack} />;
};

export default UnitVolumeGame;
