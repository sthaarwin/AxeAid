import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIAL_SIZE = SCREEN_WIDTH * 0.7;
const DIAL_CENTER = DIAL_SIZE / 2;
const DIAL_RADIUS = 44; // SVG viewBox radius
const SVG_SIZE = 100;

const MIN_BPM = 40;
const MAX_BPM = 240;
const BEATS_PER_MEASURE = 4;

const circumference = 2 * Math.PI * DIAL_RADIUS;

const getTempoName = (bpm: number): string => {
    if (bpm < 60) return 'Largo';
    if (bpm < 76) return 'Adagio';
    if (bpm < 108) return 'Andante';
    if (bpm < 120) return 'Moderato';
    if (bpm < 156) return 'Allegro';
    if (bpm < 176) return 'Vivace';
    return 'Presto';
};

interface MetronomeProps {
    initialBpm?: number;
}

export const Metronome: React.FC<MetronomeProps> = ({ initialBpm = 120 }) => {
    const [bpm, setBpm] = useState(initialBpm);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(-1);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextTickRef = useRef(0);
    const soundRef = useRef<Audio.Sound | null>(null);
    const beatRef = useRef(-1);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        (async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../../../assets/sounds/tick.wav')
                );
                soundRef.current = sound;
            } catch { console.warn('tick.wav not found'); }
        })();
        return () => { soundRef.current?.unloadAsync(); };
    }, []);

    const playTick = useCallback(async () => {
        soundRef.current?.replayAsync().catch(() => {});
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        pulseScale.value = withSequence(
            withTiming(1.08, { duration: 50 }),
            withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
        );
    }, []);

    const tick = useCallback(() => {
        if (!isPlaying) return;
        playTick();
        setCurrentBeat(beatRef.current);
        beatRef.current = (beatRef.current + 1) % BEATS_PER_MEASURE;
        const interval = (60 / bpm) * 1000;
        nextTickRef.current += interval;
        const drift = Date.now() - nextTickRef.current;
        timerRef.current = setTimeout(tick, Math.max(0, interval - drift));
    }, [bpm, isPlaying, playTick]);

    useEffect(() => {
        if (isPlaying) {
            beatRef.current = 0;
            setCurrentBeat(0);
            nextTickRef.current = Date.now();
            tick();
        } else {
            setCurrentBeat(-1);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [isPlaying, tick]);

    // Progress arc
    const bpmFrac = (bpm - MIN_BPM) / (MAX_BPM - MIN_BPM);
    const dashOffset = circumference * (1 - bpmFrac);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    return (
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#0f1d23' }}>
            {/* BPM Display */}
            <View style={{ alignItems: 'center', marginTop: 24 }}>
                <Animated.Text style={[{
                    fontSize: 72, fontWeight: '700', color: '#ffffff',
                    letterSpacing: -3,
                }, pulseStyle]}>
                    {bpm}
                </Animated.Text>
                <Text style={{
                    color: '#25bdf8', fontSize: 13, fontWeight: '700',
                    letterSpacing: 3, marginTop: -4, textTransform: 'uppercase',
                }}>
                    BPM • {getTempoName(bpm)}
                </Text>
            </View>

            {/* Beat Indicators */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 24 }}>
                {Array.from({ length: BEATS_PER_MEASURE }, (_, i) => {
                    const isDownbeat = i === 0;
                    const isActive = isPlaying && currentBeat === i;
                    return (
                        <View key={i} style={{ alignItems: 'center', justifyContent: 'center' }}>
                            {isDownbeat ? (
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Outer ring for downbeat */}
                                    <View style={{
                                        position: 'absolute',
                                        width: 40, height: 40, borderRadius: 20,
                                        borderWidth: 2,
                                        borderColor: isActive ? 'rgba(37,189,248,0.3)' : 'transparent',
                                    }} />
                                    <View style={{
                                        width: 24, height: 24, borderRadius: 12,
                                        backgroundColor: isActive ? '#25bdf8' : '#1e293b',
                                        ...(isActive ? {
                                            shadowColor: '#25bdf8',
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.6, shadowRadius: 10, elevation: 8,
                                        } : {}),
                                    }} />
                                </View>
                            ) : (
                                <View style={{
                                    width: 16, height: 16, borderRadius: 8,
                                    backgroundColor: isActive ? '#25bdf8' : '#334155',
                                    ...(isActive ? {
                                        shadowColor: '#25bdf8',
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.6, shadowRadius: 8, elevation: 6,
                                    } : {}),
                                }} />
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Circular Dial */}
            <View style={{ marginTop: 20, width: DIAL_SIZE, height: DIAL_SIZE }}>
                {/* Outer thick ring */}
                <View style={{
                    position: 'absolute', inset: 0,
                    borderRadius: DIAL_SIZE / 2,
                    borderWidth: 12, borderColor: 'rgba(30,41,59,0.5)',
                }} />

                {/* SVG Progress Ring */}
                <Svg
                    width={DIAL_SIZE} height={DIAL_SIZE}
                    viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                    style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
                >
                    {/* Background track */}
                    <Circle
                        cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={DIAL_RADIUS}
                        stroke="rgba(37,189,248,0.2)" strokeWidth={6}
                        fill="transparent"
                    />
                    {/* Active arc */}
                    <Circle
                        cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={DIAL_RADIUS}
                        stroke="#25bdf8" strokeWidth={6}
                        fill="transparent"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                    />
                </Svg>

                {/* Center dial area */}
                <View style={{
                    position: 'absolute', top: DIAL_SIZE * 0.18, left: DIAL_SIZE * 0.18,
                    width: DIAL_SIZE * 0.64, height: DIAL_SIZE * 0.64,
                    borderRadius: DIAL_SIZE * 0.32,
                    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
                }}>
                    <Text style={{ color: '#25bdf8', fontSize: 28, marginBottom: 2 }}>⇕</Text>
                    <Text style={{
                        color: '#94a3b8', fontSize: 10, fontWeight: '500',
                        textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                        Drag to adjust
                    </Text>
                </View>

                {/* Tick marks at cardinal positions */}
                {/* Top */}
                <View style={{
                    position: 'absolute', top: 16, left: '50%', marginLeft: -2,
                    width: 4, height: 12, borderRadius: 2, backgroundColor: '#25bdf8',
                }} />
                {/* Bottom */}
                <View style={{
                    position: 'absolute', bottom: 16, left: '50%', marginLeft: -2,
                    width: 4, height: 12, borderRadius: 2, backgroundColor: '#475569',
                }} />
                {/* Left */}
                <View style={{
                    position: 'absolute', left: 16, top: '50%', marginTop: -2,
                    height: 4, width: 12, borderRadius: 2, backgroundColor: '#475569',
                }} />
                {/* Right */}
                <View style={{
                    position: 'absolute', right: 16, top: '50%', marginTop: -2,
                    height: 4, width: 12, borderRadius: 2, backgroundColor: '#475569',
                }} />
            </View>

            {/* Quick Increment Buttons */}
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
                <TouchableOpacity
                    onPress={() => setBpm(b => Math.max(MIN_BPM, b - 1))}
                    activeOpacity={0.7}
                    style={{
                        paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
                        backgroundColor: '#1e293b',
                    }}
                >
                    <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '700' }}>-1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setBpm(b => Math.min(MAX_BPM, b + 1))}
                    activeOpacity={0.7}
                    style={{
                        paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
                        backgroundColor: '#1e293b',
                    }}
                >
                    <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '700' }}>+1</Text>
                </TouchableOpacity>
            </View>

            {/* Play / Stop Button */}
            <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                activeOpacity={0.8}
                style={{
                    width: 80, height: 80, borderRadius: 40,
                    marginTop: 20, marginBottom: 16,
                    backgroundColor: '#25bdf8',
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#25bdf8',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
                }}
            >
                {isPlaying ? (
                    <View style={{ width: 22, height: 22, borderRadius: 3, backgroundColor: '#ffffff' }} />
                ) : (
                    <View style={{
                        width: 0, height: 0, marginLeft: 5,
                        borderLeftWidth: 24, borderTopWidth: 15, borderBottomWidth: 15,
                        borderLeftColor: '#ffffff',
                        borderTopColor: 'transparent', borderBottomColor: 'transparent',
                    }} />
                )}
            </TouchableOpacity>
        </View>
    );
};
