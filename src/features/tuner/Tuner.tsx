import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { TunerService, TunerResult } from '../../services/TunerService';
import { PitchDetectionService, PitchData } from '../../services/PitchDetectionService';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_OUTER = SCREEN_WIDTH * 0.72;
const CIRCLE_MID = CIRCLE_OUTER - 32;
const CIRCLE_INNER = CIRCLE_MID - 32;

const GUITAR_STRINGS = [
    { label: 'E', freq: 82.41 },
    { label: 'A', freq: 110.0 },
    { label: 'D', freq: 146.83 },
    { label: 'G', freq: 196.0 },
    { label: 'B', freq: 246.94 },
    { label: 'e', freq: 329.63 },
];

export const Tuner: React.FC = () => {
    const [result, setResult] = useState<TunerResult>({
        note: '--', octave: 0, cents: 0, frequency: 0,
    });
    const [activeString, setActiveString] = useState(5);
    const [micActive, setMicActive] = useState(false);
    const needleX = useSharedValue(0);
    const useFallback = useRef(false);

    // Callback for real mic pitch data
    const onPitch = useCallback((data: PitchData) => {
        if (data.frequency > 0) {
            const det = TunerService.getNoteFromFrequency(data.frequency);
            setResult(det);
            needleX.value = withSpring(det.cents, { damping: 14, stiffness: 120 });
        }
    }, []);

    // Start mic on mount, fall back to mock if native module unavailable
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        (async () => {
            const started = await PitchDetectionService.start(onPitch);
            if (started) {
                setMicActive(true);
            } else {
                // Fallback: mock pitch detection for Expo Go
                useFallback.current = true;
                interval = setInterval(() => {
                    const base = GUITAR_STRINGS[activeString].freq;
                    const mock = base + (Math.random() - 0.5) * 4;
                    const det = TunerService.getNoteFromFrequency(mock);
                    setResult(det);
                    needleX.value = withSpring(det.cents, { damping: 14, stiffness: 120 });
                }, 120);
            }
        })();

        return () => {
            PitchDetectionService.stop();
            if (interval) clearInterval(interval);
        };
    }, []);

    // Re-start mock interval if active string changes (fallback only)
    useEffect(() => {
        if (!useFallback.current) return;
        const interval = setInterval(() => {
            const base = GUITAR_STRINGS[activeString].freq;
            const mock = base + (Math.random() - 0.5) * 4;
            const det = TunerService.getNoteFromFrequency(mock);
            setResult(det);
            needleX.value = withSpring(det.cents, { damping: 14, stiffness: 120 });
        }, 120);
        return () => clearInterval(interval);
    }, [activeString]);

    const inTune = Math.abs(result.cents) < 5;
    const statusColor = inTune ? '#22c55e' : '#25bdf8';
    const statusText = inTune ? 'In Tune' : `${result.cents > 0 ? '+' : ''}${result.cents} cents`;

    const barNeedleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: (needleX.value / 50) * ((SCREEN_WIDTH - 80) / 2) }],
    }));

    // SVG arc for the status partial ring
    const arcRadius = CIRCLE_OUTER / 2 - 2;
    const arcCircumference = 2 * Math.PI * arcRadius;
    const arcVisible = arcCircumference * 0.25;

    return (
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#0f1d23' }}>
            {/* Circular Gauge */}
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                <View style={{
                    width: CIRCLE_OUTER, height: CIRCLE_OUTER,
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    {/* Outer ring */}
                    <View style={{
                        position: 'absolute',
                        width: CIRCLE_OUTER, height: CIRCLE_OUTER, borderRadius: CIRCLE_OUTER / 2,
                        borderWidth: 4, borderColor: '#1e293b',
                    }} />
                    {/* Middle ring */}
                    <View style={{
                        position: 'absolute',
                        width: CIRCLE_MID, height: CIRCLE_MID, borderRadius: CIRCLE_MID / 2,
                        borderWidth: 2, borderColor: 'rgba(37,189,248,0.2)',
                    }} />
                    {/* Inner ring */}
                    <View style={{
                        position: 'absolute',
                        width: CIRCLE_INNER, height: CIRCLE_INNER, borderRadius: CIRCLE_INNER / 2,
                        borderWidth: 1, borderColor: 'rgba(37,189,248,0.1)',
                    }} />
                    {/* Status arc overlay */}
                    <Svg
                        width={CIRCLE_OUTER} height={CIRCLE_OUTER}
                        style={{ position: 'absolute' }}
                    >
                        <Circle
                            cx={CIRCLE_OUTER / 2}
                            cy={CIRCLE_OUTER / 2}
                            r={arcRadius}
                            stroke={statusColor}
                            strokeWidth={4}
                            fill="none"
                            strokeDasharray={`${arcVisible} ${arcCircumference - arcVisible}`}
                            strokeDashoffset={arcCircumference * 0.75}
                            strokeLinecap="round"
                            opacity={0.8}
                        />
                    </Svg>

                    {/* Center Content */}
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{
                                width: 6, height: 6, borderRadius: 3,
                                backgroundColor: micActive ? '#22c55e' : '#ef4444',
                            }} />
                            <Text style={{
                                fontSize: 11, fontWeight: '700', letterSpacing: 3,
                                color: '#25bdf8', textTransform: 'uppercase',
                            }}>
                                {micActive ? 'Live' : 'Demo'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Text style={{
                                fontSize: 80, fontWeight: '900', color: '#f1f5f9',
                                lineHeight: 88,
                            }}>
                                {result.note}
                            </Text>
                            <Text style={{
                                fontSize: 32, fontWeight: '600', color: '#f1f5f9',
                                marginTop: 4,
                            }}>
                                {result.octave}
                            </Text>
                        </View>
                        <Text style={{
                            fontSize: 18, fontWeight: '500', color: statusColor, marginTop: 4,
                        }}>
                            {statusText}
                        </Text>
                    </View>
                </View>

                {/* Frequency pill */}
                <View style={{
                    backgroundColor: '#0f1d23', paddingHorizontal: 16, paddingVertical: 4,
                    borderRadius: 999, borderWidth: 1, borderColor: '#1e293b',
                    marginTop: -16,
                }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8' }}>
                        {result.frequency.toFixed(1)} Hz
                    </Text>
                </View>
            </View>

            {/* Cents Scale */}
            <View style={{ width: '100%', paddingHorizontal: 24, marginTop: 24 }}>
                {/* Scale labels */}
                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    alignItems: 'flex-end', marginBottom: 10, paddingHorizontal: 4,
                }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>-50</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>-25</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: statusColor }}>0</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>+25</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>+50</Text>
                </View>
                {/* Bar */}
                <View style={{
                    height: 8, backgroundColor: '#1e293b', borderRadius: 999,
                    overflow: 'hidden', position: 'relative',
                }}>
                    {/* Center line */}
                    <View style={{
                        position: 'absolute', left: '50%', marginLeft: -1.5,
                        width: 3, height: '100%', backgroundColor: statusColor,
                        zIndex: 10,
                        shadowColor: statusColor, shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8, shadowRadius: 5,
                    }} />
                    {/* Left fill */}
                    <View style={{
                        height: '100%', width: '50%',
                        backgroundColor: 'rgba(37,189,248,0.2)', borderRadius: 999,
                    }} />
                    {/* Animated needle */}
                    <Animated.View style={[{
                        position: 'absolute', width: 10, height: 8, borderRadius: 4,
                        backgroundColor: statusColor, left: '50%', marginLeft: -5,
                    }, barNeedleStyle]} />
                </View>
            </View>

            {/* Cents readout */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12 }}>
                <Text style={{ color: '#f1f5f9', fontSize: 28, fontWeight: '700' }}>
                    {result.cents}
                </Text>
                <Text style={{
                    color: '#64748b', fontSize: 12, fontWeight: '500',
                    textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8,
                }}>
                    Cents
                </Text>
            </View>

            {/* String Selector */}
            <View style={{
                flexDirection: 'row', marginTop: 'auto', marginBottom: 12,
                paddingHorizontal: 24, gap: 8, width: '100%',
            }}>
                {GUITAR_STRINGS.map((s, i) => {
                    const isActive = activeString === i;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setActiveString(i)}
                            activeOpacity={0.7}
                            style={{
                                flex: 1, paddingVertical: 12, borderRadius: 12,
                                backgroundColor: isActive ? '#25bdf8' : 'rgba(30,41,59,0.5)',
                                borderWidth: 1,
                                borderColor: isActive ? '#25bdf8' : 'rgba(51,65,85,0.5)',
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Text style={{
                                fontWeight: '700', fontSize: 12,
                                color: isActive ? '#ffffff' : '#94a3b8',
                            }}>
                                {s.label.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
