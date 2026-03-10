import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal, Switch, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Metronome } from './src/features/metronome/Metronome';
import { Tuner } from './src/features/tuner/Tuner';
import { EarTrainer } from './src/features/ear-training/EarTrainer';
import { ChordLibrary } from './src/features/chords/ChordLibrary';
import './global.css';

type Tab = 'tuner' | 'metronome' | 'ear-training' | 'chords';

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

const ChordGridIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={2} />
        <Rect x={14} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={2} />
        <Rect x={3} y={14} width={7} height={7} rx={1.5} stroke={color} strokeWidth={2} />
        <Rect x={14} y={14} width={7} height={7} rx={1.5} stroke={color} strokeWidth={2} />
        <Circle cx={6.5} cy={6.5} r={1.5} fill={color} />
        <Circle cx={17.5} cy={6.5} r={1.5} fill={color} />
        <Circle cx={6.5} cy={17.5} r={1.5} fill={color} />
        <Circle cx={17.5} cy={17.5} r={1.5} fill={color} />
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

const CloseIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const ChevronRightIcon = ({ color }: { color: string }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

/* ─── Consistent bottom tab bar ─── */
const TAB_BAR = [
    { key: 'tuner' as Tab, label: 'Tuner', Icon: MusicNoteIcon },
    { key: 'metronome' as Tab, label: 'Tempo', Icon: TimerIcon },
    { key: 'chords' as Tab, label: 'Chords', Icon: ChordGridIcon },
    { key: 'ear-training' as Tab, label: 'Practice', Icon: PracticeIcon },
];

/* ─── Settings Modal ─── */
const TUNING_OPTIONS = ['Standard', 'Drop D', 'Open G', 'DADGAD', 'Half Step Down'];
const REFERENCE_PITCHES = [432, 436, 440, 442, 444];

export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>('tuner');
    const [earLevel] = useState(3);
    const [showSettings, setShowSettings] = useState(false);
    const [referencePitch, setReferencePitch] = useState(440);
    const [selectedTuning, setSelectedTuning] = useState('Standard');
    const [darkMode, setDarkMode] = useState(true);
    const [hapticFeedback, setHapticFeedback] = useState(true);
    const [leftHanded, setLeftHanded] = useState(false);

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
                        onPress={() => { if (activeTab !== 'tuner') setActiveTab('tuner'); }}
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
                                : activeTab === 'chords' ? 'Chord Library'
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
                        onPress={() => setShowSettings(true)}
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
                    {activeTab === 'chords' && <ChordLibrary />}
                    {activeTab === 'ear-training' && <EarTrainer />}
                </View>

                {/* ─── Settings Modal ─── */}
                <Modal
                    visible={showSettings}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowSettings(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                        <View style={{
                            backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                            paddingTop: 8, maxHeight: '85%',
                        }}>
                            {/* Drag handle */}
                            <View style={{
                                width: 36, height: 4, borderRadius: 2,
                                backgroundColor: '#334155', alignSelf: 'center', marginBottom: 8,
                            }} />

                            {/* Header */}
                            <View style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                paddingHorizontal: 20, paddingVertical: 12,
                                borderBottomWidth: 1, borderBottomColor: '#1e293b',
                            }}>
                                <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '800' }}>Settings</Text>
                                <TouchableOpacity
                                    onPress={() => setShowSettings(false)}
                                    activeOpacity={0.6}
                                    style={{
                                        width: 36, height: 36, borderRadius: 18,
                                        backgroundColor: 'rgba(226,232,240,0.1)',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <CloseIcon color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
                                {/* Reference Pitch */}
                                <Text style={{
                                    color: '#64748b', fontSize: 11, fontWeight: '700',
                                    letterSpacing: 1.5, textTransform: 'uppercase',
                                    marginTop: 20, marginBottom: 10,
                                }}>
                                    Reference Pitch
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {REFERENCE_PITCHES.map((hz) => {
                                        const active = hz === referencePitch;
                                        return (
                                            <TouchableOpacity
                                                key={hz}
                                                onPress={() => setReferencePitch(hz)}
                                                activeOpacity={0.7}
                                                style={{
                                                    flex: 1, paddingVertical: 10, borderRadius: 12,
                                                    backgroundColor: active ? '#25bdf8' : 'rgba(226,232,240,0.06)',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 14, fontWeight: '700',
                                                    color: active ? '#0f1d23' : '#94a3b8',
                                                }}>
                                                    {hz}
                                                </Text>
                                                <Text style={{
                                                    fontSize: 10, fontWeight: '500',
                                                    color: active ? '#0f1d23' : '#64748b', marginTop: 1,
                                                }}>
                                                    Hz
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Tuning */}
                                <Text style={{
                                    color: '#64748b', fontSize: 11, fontWeight: '700',
                                    letterSpacing: 1.5, textTransform: 'uppercase',
                                    marginTop: 24, marginBottom: 10,
                                }}>
                                    Tuning
                                </Text>
                                <View style={{ gap: 4 }}>
                                    {TUNING_OPTIONS.map((tuning) => {
                                        const active = tuning === selectedTuning;
                                        return (
                                            <TouchableOpacity
                                                key={tuning}
                                                onPress={() => setSelectedTuning(tuning)}
                                                activeOpacity={0.7}
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                                    paddingVertical: 13, paddingHorizontal: 14,
                                                    borderRadius: 12,
                                                    backgroundColor: active ? 'rgba(37,189,248,0.1)' : 'transparent',
                                                }}
                                            >
                                                <Text style={{
                                                    color: active ? '#25bdf8' : '#f1f5f9',
                                                    fontSize: 14, fontWeight: '600',
                                                }}>
                                                    {tuning}
                                                </Text>
                                                {active && (
                                                    <View style={{
                                                        width: 20, height: 20, borderRadius: 10,
                                                        backgroundColor: '#25bdf8',
                                                        alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Text style={{ color: '#0f1d23', fontSize: 12, fontWeight: '800' }}>✓</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Toggles */}
                                <Text style={{
                                    color: '#64748b', fontSize: 11, fontWeight: '700',
                                    letterSpacing: 1.5, textTransform: 'uppercase',
                                    marginTop: 24, marginBottom: 10,
                                }}>
                                    Preferences
                                </Text>
                                <View style={{
                                    backgroundColor: 'rgba(226,232,240,0.05)',
                                    borderRadius: 14, overflow: 'hidden',
                                }}>
                                    {[
                                        { label: 'Dark Mode', value: darkMode, onToggle: setDarkMode },
                                        { label: 'Haptic Feedback', value: hapticFeedback, onToggle: setHapticFeedback },
                                        { label: 'Left-Handed Mode', value: leftHanded, onToggle: setLeftHanded },
                                    ].map((item, idx) => (
                                        <View
                                            key={item.label}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                                paddingVertical: 14, paddingHorizontal: 16,
                                                ...(idx > 0 ? { borderTopWidth: 1, borderTopColor: '#1e293b' } : {}),
                                            }}
                                        >
                                            <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '500' }}>
                                                {item.label}
                                            </Text>
                                            <Switch
                                                value={item.value}
                                                onValueChange={item.onToggle}
                                                trackColor={{ false: '#334155', true: 'rgba(37,189,248,0.4)' }}
                                                thumbColor={item.value ? '#25bdf8' : '#64748b'}
                                            />
                                        </View>
                                    ))}
                                </View>

                                {/* About section */}
                                <Text style={{
                                    color: '#64748b', fontSize: 11, fontWeight: '700',
                                    letterSpacing: 1.5, textTransform: 'uppercase',
                                    marginTop: 24, marginBottom: 10,
                                }}>
                                    About
                                </Text>
                                <View style={{
                                    backgroundColor: 'rgba(226,232,240,0.05)',
                                    borderRadius: 14, overflow: 'hidden',
                                }}>
                                    {[
                                        { label: 'App Version', value: '1.0.0' },
                                        { label: 'Rate App', value: '' },
                                        { label: 'Send Feedback', value: '' },
                                    ].map((item, idx) => (
                                        <TouchableOpacity
                                            key={item.label}
                                            activeOpacity={0.6}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                                paddingVertical: 14, paddingHorizontal: 16,
                                                ...(idx > 0 ? { borderTopWidth: 1, borderTopColor: '#1e293b' } : {}),
                                            }}
                                        >
                                            <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '500' }}>
                                                {item.label}
                                            </Text>
                                            {item.value ? (
                                                <Text style={{ color: '#64748b', fontSize: 13 }}>{item.value}</Text>
                                            ) : (
                                                <ChevronRightIcon color="#64748b" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Bottom Nav */}
                <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}>
                    <View style={{
                        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
                        paddingTop: 10, paddingBottom: 6,
                        borderTopWidth: 1, borderTopColor: '#1e293b',
                    }}>
                        {TAB_BAR.map((tab) => {
                            const isActive = tab.key === activeTab;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => setActiveTab(tab.key)}
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
