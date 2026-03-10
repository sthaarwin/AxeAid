import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { EarTrainerService } from './EarTrainerService';
import { TunerService } from '../../services/TunerService';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.48;

const ALL_NOTES = [
    { note: 'C', octave: 4, freq: 261.63 },
    { note: 'D', octave: 4, freq: 293.66 },
    { note: 'E', octave: 4, freq: 329.63 },
    { note: 'F', octave: 4, freq: 349.23 },
    { note: 'G', octave: 4, freq: 392.00 },
    { note: 'A', octave: 4, freq: 440.00 },
    { note: 'B', octave: 4, freq: 493.88 },
    { note: 'C', octave: 5, freq: 523.25 },
];

const LEVELS = [
    { name: 'Note Basics', threshold: 30 },
    { name: 'Getting Closer', threshold: 25 },
    { name: 'Keen Listener', threshold: 20 },
    { name: 'Perfect Pitch', threshold: 15 },
    { name: 'Master Ear', threshold: 10 },
];

const TOTAL_ROUNDS = 10;

export const EarTrainer: React.FC = () => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'listening' | 'success' | 'fail'>('idle');
    const [level, setLevel] = useState(3); // Level 4 like mockup
    const [round, setRound] = useState(6);
    const [score, setScore] = useState(4);
    const [streak, setStreak] = useState(4);
    const [targetNote, setTargetNote] = useState(ALL_NOTES[0]);
    const [detectedNote, setDetectedNote] = useState('--');
    const [feedback, setFeedback] = useState('');

    const pingScale = useSharedValue(1);
    const pingOpacity = useSharedValue(0.75);

    useEffect(() => {
        if (gameState === 'listening') {
            pingScale.value = withRepeat(withTiming(1.8, { duration: 1000 }), -1, false);
            pingOpacity.value = withRepeat(withTiming(0, { duration: 1000 }), -1, false);
        } else {
            pingScale.value = 1;
            pingOpacity.value = 0.75;
        }
    }, [gameState]);

    const pingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pingScale.value }],
        opacity: pingOpacity.value,
    }));

    const startRound = useCallback(async () => {
        const note = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
        setTargetNote(note);
        setDetectedNote('--');
        setFeedback('');
        setGameState('playing');
        await EarTrainerService.playTargetNote(note.freq).catch(() => {});
        setTimeout(() => setGameState('listening'), 2000);
    }, []);

    const startSession = useCallback(() => {
        setRound(0);
        setScore(0);
        setStreak(0);
        startRound();
    }, [startRound]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'listening') {
            interval = setInterval(() => {
                const offset = (Math.random() - 0.5) * LEVELS[level].threshold * 2.5;
                const mockFreq = targetNote.freq + offset;
                const result = TunerService.getNoteFromFrequency(mockFreq);
                setDetectedNote(`${result.note}${result.octave}`);

                const eval_ = EarTrainerService.compareNotes(targetNote.freq, mockFreq);
                if (eval_.isSuccess) {
                    setGameState('success');
                    setScore(s => s + 1);
                    setStreak(s => s + 1);
                    setFeedback('Perfect match! 🎯');
                    clearInterval(interval);
                } else {
                    const dir = eval_.diffCents > 0
                        ? 'Too high! Go down a semitone.'
                        : 'Too low! Go up a semitone.';
                    setFeedback(dir);
                }
            }, 600);
        }
        return () => clearInterval(interval);
    }, [gameState, targetNote, level]);

    const handleNext = () => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
            if (score >= 7 && level < LEVELS.length - 1) setLevel(l => l + 1);
            setGameState('idle');
        } else {
            setRound(nextRound);
            startRound();
        }
    };

    const progress = round / TOTAL_ROUNDS;
    const isActive = gameState !== 'idle';

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#0f1d23' }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        >
            {/* Session Progress */}
            <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                        <Text style={{
                            fontSize: 13, fontWeight: '600', color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: 2,
                        }}>
                            Session Progress
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', marginTop: 4 }}>
                            {round} <Text style={{ color: '#94a3b8' }}>/ {TOTAL_ROUNDS}</Text>
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: 'rgba(37,189,248,0.1)',
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
                    }}>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: '#25bdf8' }}>
                            Streak: {streak} {streak >= 3 ? '🔥' : ''}
                        </Text>
                    </View>
                </View>
                {/* Progress bar */}
                <View style={{
                    height: 12, backgroundColor: '#1e293b', borderRadius: 999,
                    overflow: 'hidden', marginTop: 12,
                }}>
                    <View style={{
                        height: '100%', width: `${progress * 100}%`,
                        backgroundColor: '#25bdf8', borderRadius: 999,
                    }} />
                </View>
            </View>

            {/* Target Circle */}
            <View style={{ alignItems: 'center', marginTop: 32, paddingVertical: 16 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {/* Glow backdrop */}
                    {gameState !== 'idle' && (
                        <Animated.View style={[{
                            position: 'absolute',
                            width: CIRCLE_SIZE + 40, height: CIRCLE_SIZE + 40,
                            borderRadius: (CIRCLE_SIZE + 40) / 2,
                            backgroundColor: 'rgba(37,189,248,0.15)',
                        }, pingStyle]} />
                    )}
                    {/* Circle */}
                    <View style={{
                        width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
                        borderWidth: 4,
                        borderColor: gameState === 'success' ? '#22c55e' : '#25bdf8',
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: gameState === 'success' ? 'rgba(34,197,94,0.05)' : '#0f172a',
                        shadowColor: '#25bdf8', shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3, shadowRadius: 20,
                    }}>
                        <Text style={{
                            fontSize: 11, fontWeight: '700',
                            color: '#25bdf8', textTransform: 'uppercase',
                            letterSpacing: 3, marginBottom: 4,
                        }}>
                            {gameState === 'success' ? 'Matched!' : 'Target'}
                        </Text>
                        <Text style={{
                            fontSize: 56, fontWeight: '900',
                            color: gameState === 'success' ? '#22c55e' : '#ffffff',
                        }}>
                            {gameState === 'idle' ? '?' : `${targetNote.note}${targetNote.octave}`}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
                onPress={gameState === 'idle' ? startSession : gameState === 'success' ? handleNext : startRound}
                activeOpacity={0.9}
                style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#25bdf8', borderRadius: 12,
                    paddingVertical: 16, marginTop: 8, gap: 12,
                    shadowColor: '#25bdf8', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
                }}
            >
                <Text style={{ fontSize: 20, color: '#0f1d23' }}>▶</Text>
                <Text style={{ color: '#0f1d23', fontSize: 16, fontWeight: '700' }}>
                    {gameState === 'idle' ? 'Start Session' : gameState === 'success' ? 'Next Note' : 'Play Reference Tone'}
                </Text>
            </TouchableOpacity>

            {/* Listening Card */}
            {isActive && gameState !== 'playing' && (
                <View style={{
                    backgroundColor: 'rgba(15,23,42,0.5)',
                    borderWidth: 1, borderColor: '#1e293b',
                    borderRadius: 16, padding: 20, marginTop: 24,
                }}>
                    {/* Listening indicator */}
                    {gameState === 'listening' && (
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                            gap: 8, marginBottom: 20,
                        }}>
                            <View style={{
                                backgroundColor: 'rgba(34,197,94,0.1)',
                                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
                                flexDirection: 'row', alignItems: 'center', gap: 8,
                            }}>
                                {/* Ping dot */}
                                <View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
                                    <Animated.View style={[{
                                        position: 'absolute', width: 12, height: 12, borderRadius: 6,
                                        backgroundColor: '#22c55e',
                                    }, pingStyle]} />
                                    <View style={{
                                        width: 12, height: 12, borderRadius: 6,
                                        backgroundColor: '#22c55e',
                                    }} />
                                </View>
                                <Text style={{
                                    fontSize: 13, fontWeight: '700', color: '#22c55e',
                                    textTransform: 'uppercase',
                                }}>
                                    Listening...
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Comparison Grid */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {/* Target box */}
                        <View style={{
                            flex: 1, backgroundColor: '#1e293b', borderRadius: 12,
                            padding: 16, alignItems: 'center',
                        }}>
                            <Text style={{
                                fontSize: 10, fontWeight: '700', color: '#64748b',
                                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
                            }}>
                                Target
                            </Text>
                            <Text style={{ fontSize: 28, fontWeight: '700', color: '#94a3b8' }}>
                                {targetNote.note}{targetNote.octave}
                            </Text>
                        </View>
                        {/* Detected box */}
                        <View style={{
                            flex: 1,
                            backgroundColor: 'rgba(37,189,248,0.1)',
                            borderWidth: 1, borderColor: 'rgba(37,189,248,0.3)',
                            borderRadius: 12, padding: 16, alignItems: 'center',
                        }}>
                            <Text style={{
                                fontSize: 10, fontWeight: '700', color: '#25bdf8',
                                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
                            }}>
                                Detected
                            </Text>
                            <Text style={{
                                fontSize: 28, fontWeight: '700',
                                color: gameState === 'success' ? '#22c55e' : '#25bdf8',
                            }}>
                                {detectedNote}
                            </Text>
                        </View>
                    </View>

                    {/* Frequency visualization bars */}
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        gap: 4, marginTop: 16,
                    }}>
                        <View style={{ height: 4, width: 32, borderRadius: 2, backgroundColor: '#1e293b' }} />
                        <View style={{ height: 4, width: 48, borderRadius: 2, backgroundColor: 'rgba(37,189,248,0.3)' }} />
                        <View style={{ height: 4, width: 64, borderRadius: 2, backgroundColor: '#25bdf8' }} />
                        <View style={{ height: 4, width: 48, borderRadius: 2, backgroundColor: 'rgba(37,189,248,0.3)' }} />
                        <View style={{ height: 4, width: 32, borderRadius: 2, backgroundColor: '#1e293b' }} />
                    </View>

                    {/* Feedback text */}
                    {feedback !== '' && (
                        <Text style={{
                            textAlign: 'center', fontSize: 12, fontWeight: '500',
                            color: gameState === 'success' ? '#22c55e' : '#64748b',
                            marginTop: 8,
                        }}>
                            {feedback}
                        </Text>
                    )}
                </View>
            )}
        </ScrollView>
    );
};
