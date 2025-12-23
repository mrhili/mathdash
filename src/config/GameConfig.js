import PowerOfTenGame from '../components/Game/PowerOfTen/PowerOfTenGame';
import PlaceValueGame from '../components/Game/PlaceValue/PlaceValueGame';
import PowerRebuilderGame from '../components/Game/PowerRebuilder/PowerRebuilderGame';
import FractionSlicerGame from '../components/Game/FractionSlicer/FractionSlicerGame';
import FractionMatchGame from '../components/Game/FractionMatch/FractionMatchGame';
import SimplifySmashGame from '../components/Game/SimplifySmash/SimplifySmashGame';
import SimplifyExpressGame from '../components/Game/SimplifyExpress/SimplifyExpressGame';
import DimensionDiscoveryGame from '../components/Game/DimensionDiscovery/DimensionDiscoveryGame';
import UnitMasterGame from '../components/Game/UnitMaster/UnitMasterGame';
import StackAlignGame from '../components/Game/StackAlign/StackAlignGame';
import AreaQuestGame from '../components/Game/AreaQuest/AreaQuestGame';
import PiSplashGame from '../components/Game/PiSplash/PiSplashGame';
import VolumeQuestGame from '../components/Game/VolumeQuest/VolumeQuestGame';
import PyramidPowerGame from '../components/Game/PyramidPower/PyramidPowerGame';
import ConeZoneGame from '../components/Game/ConeZone/ConeZoneGame';
import SphereForceGame from '../components/Game/SphereForce/SphereForceGame';
import SymmetryShockGame from '../components/Game/SymmetryShock/SymmetryShockGame';
import PerimeterPatrolGame from '../components/Game/PerimeterPatrol/PerimeterPatrolGame';
import AngleMasterGame from '../components/Game/AngleMaster/AngleMasterGame';
import ScaleExplorerGame from '../components/Game/ScaleExplorer/ScaleExplorerGame';
import ScientificScaleGame from '../components/Game/ScientificScale/ScientificScaleGame';
import FractionScaleGame from '../components/Game/FractionScale/FractionScaleGame';
import RollingPiGame from '../components/Game/RollingPi/RollingPiGame';
import ProportionGame from '../components/Game/Proportion/ProportionGame';
import RuleOfThreeGame from '../components/Game/RuleOfThree/RuleOfThreeGame';
import PercentPotionGame from '../components/Game/PercentPotion/PercentPotionGame';
import UnitLengthGame from '../components/Game/Units/UnitLengthGame';
import UnitMassGame from '../components/Game/Units/UnitMassGame';
import UnitCapacityGame from '../components/Game/Units/UnitCapacityGame';
import UnitAreaGame from '../components/Game/Units/UnitAreaGame';
import UnitVolumeGame from '../components/Game/Units/UnitVolumeGame';
import UnitTimeGame from '../components/Game/Units/UnitTimeGame';
import LongDivisionGame from '../components/Game/LongDivision/LongDivisionGame';
import ColumnMultiplicationGame from '../components/Game/ColumnMultiplication/ColumnMultiplicationGame';
import ColumnAdditionGame from '../components/Game/ColumnAddition/ColumnAdditionGame';
import ColumnSubtractionGame from '../components/Game/ColumnSubtraction/ColumnSubtractionGame';

export const games = [
    // Pre-Math


    // Number Sense
    { id: 'power-of-10', component: PowerOfTenGame, category: 'number-sense', translationKey: 'game.power10', icon: '🚀', color: 'var(--color-primary)' },
    { id: 'place-value', component: PlaceValueGame, category: 'number-sense', translationKey: 'game.placeValue', icon: '🏗️', color: '#8b5cf6' },
    { id: 'power-rebuilder', component: PowerRebuilderGame, category: 'number-sense', translationKey: 'game.powerRebuilder', icon: '🧱', color: '#3b82f6' },
    { id: 'stack-align', component: StackAlignGame, category: 'number-sense', translationKey: 'game.stackAlign', icon: '📐', color: '#10b981' },
    { id: 'unit-master', component: UnitMasterGame, category: 'number-sense', translationKey: 'game.unitMaster', icon: '🎯', color: 'var(--color-accent)' },
    { id: 'long-division', component: LongDivisionGame, category: 'number-sense', translationKey: 'game.longDivision', icon: '➗', color: '#f59e0b' },
    { id: 'column-multiplication', component: ColumnMultiplicationGame, category: 'number-sense', translationKey: 'game.columnMultiplication', icon: '✖️', color: '#ef4444' },
    { id: 'column-addition', component: ColumnAdditionGame, category: 'number-sense', translationKey: 'game.columnAddition', icon: '➕', color: '#10b981' },
    { id: 'column-subtraction', component: ColumnSubtractionGame, category: 'number-sense', translationKey: 'game.columnSubtraction', icon: '➖', color: '#3b82f6' },

    // Fractions
    { id: 'fraction-slicer', component: FractionSlicerGame, category: 'fractions', translationKey: 'game.fractionSlicer', icon: '🥧', color: '#ef4444' },
    { id: 'fraction-match', component: FractionMatchGame, category: 'fractions', translationKey: 'game.fractionMatch', icon: '⚖️', color: '#ef4444' },
    { id: 'simplify-smash', component: SimplifySmashGame, category: 'fractions', translationKey: 'game.simplifySmash', icon: '🔨', color: '#6b7280' },
    { id: 'simplify-express', component: SimplifyExpressGame, category: 'fractions', translationKey: 'game.simplifyExpress', icon: '🚀', color: '#ec4899' },
    { id: 'fraction-scale', component: FractionScaleGame, category: 'fractions', translationKey: 'game.fractionScale', icon: '🍕', color: '#ec4899' },
    { id: 'proportion-game', component: ProportionGame, category: 'proportions', translationKey: 'game.proportion', icon: '⚖️', color: '#f59e0b' },
    { id: 'rule-of-three', component: RuleOfThreeGame, category: 'proportions', translationKey: 'game.ruleOfThree', icon: '🌟', color: '#8b5cf6' },
    { id: 'percent-potion', component: PercentPotionGame, category: 'proportions', translationKey: 'game.percentPotion', icon: '⚗️', color: 'from-purple-500 to-fuchsia-600' },

    // Geometry
    { id: 'dimension-discovery', component: DimensionDiscoveryGame, category: 'geometry', translationKey: 'game.dimension', icon: '🧊', color: 'var(--color-secondary)' },
    { id: 'area-quest', component: AreaQuestGame, category: 'geometry', translationKey: 'game.areaQuest', icon: '🔲', color: '#f59e0b' },
    { id: 'perimeter-patrol', component: PerimeterPatrolGame, category: 'geometry', translationKey: 'game.perimeter', icon: '🚧', color: '#10b981' },
    { id: 'angle-master', component: AngleMasterGame, category: 'geometry', translationKey: 'game.angleMaster', icon: '📐', color: '#f59e0b' },
    { id: 'volume-quest', component: VolumeQuestGame, category: 'geometry', translationKey: 'game.volumeQuest', icon: '📦', color: '#8b5cf6' },
    { id: 'pi-splash', component: PiSplashGame, category: 'geometry', translationKey: 'game.piSplash', icon: '🌊', color: '#3b82f6' },
    { id: 'pyramid-power', component: PyramidPowerGame, category: 'geometry', translationKey: 'game.pyramidPower', icon: '🔺', color: '#ef4444' },
    { id: 'cone-zone', component: ConeZoneGame, category: 'geometry', translationKey: 'game.coneZone', icon: '🍦', color: '#f97316' },
    { id: 'sphere-force', component: SphereForceGame, category: 'geometry', translationKey: 'game.sphereForce', icon: '🌍', color: '#3b82f6' },
    { id: 'symmetry-shock', component: SymmetryShockGame, category: 'geometry', translationKey: 'game.symmetry', icon: '🦋', color: '#8b5cf6' },
    { id: 'scale-explorer', component: ScaleExplorerGame, category: 'proportions', translationKey: 'game.scaleExplorer', icon: '🔍', color: '#6366f1' },
    { id: 'scientific-scale', component: ScientificScaleGame, category: 'proportions', translationKey: 'game.scientificScale', icon: '🔬', color: '#8b5cf6' },
    { id: 'rolling-pi', component: RollingPiGame, category: 'geometry', translationKey: 'game.rollingPi', icon: '🚲', color: '#0ea5e9' },

    // Units
    { id: 'unit-length', component: UnitLengthGame, category: 'units', translationKey: 'game.unitLength', icon: '📏', color: '#3b82f6' },
    { id: 'unit-mass', component: UnitMassGame, category: 'units', translationKey: 'game.unitMass', icon: '⚖️', color: '#f59e0b' },
    { id: 'unit-capacity', component: UnitCapacityGame, category: 'units', translationKey: 'game.unitCapacity', icon: '🥛', color: '#0ea5e9' },
    { id: 'unit-area', component: UnitAreaGame, category: 'units', translationKey: 'game.unitArea', icon: '🔲', color: '#10b981' },
    { id: 'unit-volume', component: UnitVolumeGame, category: 'units', translationKey: 'game.unitVolume', icon: '🧊', color: '#8b5cf6' },
    { id: 'unit-time', component: UnitTimeGame, category: 'units', translationKey: 'game.unitTime', icon: '⏳', color: '#ec4899' }
];

export const getGameById = (id) => games.find(g => g.id === id);
