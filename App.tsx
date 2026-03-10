import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Metronome } from './src/features/metronome/Metronome';
import { Tuner } from './src/features/tuner/Tuner';
import { EarTrainer } from './src/features/ear-training/EarTrainer';
import './global.css';

type Tab = 'tuner' | 'metronome' | 'ear-training';

const LEVELS = [
    { name: 'Note Basics' },
    { name: 'Getting Closer' },
    { name: 'Keen Listener' },
    { name: 'Perfect Pitch' },
    { name: 'Master Ear' },
];

/* ─── Icons ─── */
const MusicNoteIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={6} cy={18} r={3} fill={color} />
        <Circle cx={18} cy={16} r={3} fill={color} />
    </Svg>
);

const TimerIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={2} />
        <Path d="M12 9v4l2 2" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M10 2h4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const ChordsIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={4} width={7} height={16} rx={2} stroke={color} strokeWidth={2} />
        <Rect x={14} y={4} width={7} height={16} rx={2} stroke={color} strokeWidth={2} />
        <Path d="M7 8h0M7 12h0M17 8h0M17 12h0" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const HistoryIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M3 12a9 9 0 109-9" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M3 3v6h6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 7v5l3 3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const SoundIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M11 5L6 9H2v6h4l5 4V5z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const PracticeIcon = ({ color, filled }: { color: string; filled?: boolean }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={6} cy={18} r={3} fill={filled ? color : 'none'} stroke={color} strokeWidth={2} />
        <Circle cx={18} cy={16} r={3} fill={filled ? color : 'none'} stroke={color} strokeWidth={2} />
    </Svg>
);

const StatsIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x={4} y={14} width={4} height={6} rx={1} stroke={color} strokeWidth={2} />
        <Rect x={10} y={8} width={4} height={12} rx={1} stroke={color} strokeWidth={2} />
        <Rect x={16} y={4} width={4} height={16} rx={1} stroke={color} strokeWidth={2} />
    </Svg>
);

const PersonIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
        <Path d="M20 21a8 8 0 00-16 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const MenuIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const SettingsIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
        <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={2} />
    </Svg>
);

const BackIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

/* ─── Tab bar configs per screen ─── */
const TUNER_TABS = [
    { key: 'tuner', label: 'Tuner', Icon: MusicNoteIcon },
    { key: 'metronome', label: 'Tempo', Icon: TimerIcon },
    { key: 'chords', label: 'Chords', Icon: ChordsIcon },
    { key: 'history', label: 'History', Icon: HistoryIcon },
];

const METRONOME_TABS = [
    { key: 'metronome', label: 'Tempo', Icon: TimerIcon },
    { key: 'tuner', label: 'Sound', Icon: SoundIcon },
    { key: 'timer', label: 'Timer', Icon: TimerIcon },
    { key: 'history', label: 'Recent', Icon: HistoryIcon },
];

const EARTRAINER_TABS = [
    { key: 'ear-training', label: 'Practice', Icon: PracticeIcon },
    { key: 'stats', label: 'Stats', Icon: StatsIcon },
    { key: 'profile', label: 'Profile', Icon: PersonIcon },
];

export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>('tuner');
    const [earLevel] = useState(3);

    const tabConfigs = activeTab === 'tuner' ? TUNER_TABS
        : activeTab === 'metronome' ? METRONOME_TABS
        : EARTRAINER_TABS;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0f1d23' }} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor="#0f1d23" />

                {/* Header */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 16, paddingVertical: 12,
                    ...(activeTab === 'ear-training' ? {
                        borderBottomWidth: 1, borderBottomColor: '#1e293b',
                    } : {}),
                }}>
                    {/* Left button */}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={{
                            width: 40, height: 40, borderRadius: 20,
                            backgroundColor: 'rgba(226,232,240,0.1)',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        {activeTab === 'tuner' ? (
                            <MenuIcon color="#f1f5f9" />
                        ) : (
                            <BackIcon color="#94a3b8" />
                        )}
                    </TouchableOpacity>

                    {/* Title */}
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#f1f5f9', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 }}>
                            {activeTab === 'tuner' ? 'Chromatic Tuner'
                                : activeTab === 'metronome' ? 'Metronome'
                                : 'Match the Note'}
                        </Text>
                        {activeTab === 'ear-training' && (
                            <Text style={{
                                color: '#25bdf8', fontSize: 12, fontWeight: '500', marginTop: 2,
                            }}>
                                Level {earLevel + 1}: {LEVELS[earLevel].name}
                            </Text>
                        )}
                    </View>

                    {/* Right button */}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={{
                            width: 40, height: 40, borderRadius: 20,
                            backgroundColor: 'rgba(226,232,240,0.1)',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <SettingsIcon color={activeTab === 'tuner' ? '#f1f5f9' : '#64748b'} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    {activeTab === 'tuner' && <Tuner />}
                    {activeTab === 'metronome' && <Metronome />}
                    {activeTab === 'ear-training' && <EarTrainer />}
                </View>

                {/* Bottom Nav */}
                <SafeAreaView edges={['bottom']} style={{ backgroundColor: activeTab === 'ear-training' ? '#0f172a' : 'rgba(15,23,42,0.5)' }}>
                    <View style={{
                        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
                        paddingTop: 12, paddingBottom: 24,
                        borderTopWidth: 1, borderTopColor: '#1e293b',
                    }}>
                        {tabConfigs.map((tab) => {
                            // Determine if this tab is the "active" one
                            const isActive = tab.key === activeTab
                                || (activeTab === 'metronome' && tab.key === 'metronome')
                                || (activeTab === 'ear-training' && tab.key === 'ear-training');
                            const navKey = tab.key as Tab;

                            return (
                                <TouchableOpacity
                                    key={tab.key + tab.label}
                                    onPress={() => {
                                        if (navKey === 'tuner' || navKey === 'metronome' || navKey === 'ear-training') {
                                            setActiveTab(navKey);
                                        }
                                    }}
                                    activeOpacity={0.7}
                                    style={{ alignItems: 'center', gap: 4 }}
                                >
                                    <tab.Icon color={isActive ? '#25bdf8' : '#64748b'} />
                                    <Text style={{
                                        fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
                                        textTransform: 'uppercase',
                                        color: isActive ? '#25bdf8' : '#64748b',
                                    }}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </SafeAreaView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
