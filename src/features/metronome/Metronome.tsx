import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

interface MetronomeProps {
    initialBpm?: number;
}

export const Metronome: React.FC<MetronomeProps> = ({ initialBpm = 120 }) => {
    const [bpm, setBpm] = useState(initialBpm);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextTickRef = useRef<number>(0);
    const soundRef = useRef<Audio.Sound | null>(null);

    // Load tick sound on mount
    useEffect(() => {
        async function setupAudio() {
            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/tick.wav')
            );
            soundRef.current = sound;
        }
        setupAudio();
        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    const playTick = useCallback(async () => {
        // High-priority audio and haptics
        soundRef.current?.replayAsync();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, []);

    const tick = useCallback(() => {
        if (!isPlaying) return;

        playTick();

        const interval = (60 / bpm) * 1000;
        nextTickRef.current += interval;

        // Self-correcting timer logic to avoid JS bridge drift
        const drift = Date.now() - nextTickRef.current;
        timerRef.current = setTimeout(tick, Math.max(0, interval - drift));
    }, [bpm, isPlaying, playTick]);

    useEffect(() => {
        if (isPlaying) {
            nextTickRef.current = Date.now();
            tick();
        } else {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, tick]);

    return (
        <View className="flex-1 items-center justify-center bg-zinc-950">
            <Text className="text-6xl font-bold text-cyan-400 mb-8">{bpm} BPM</Text>

            <View className="flex-row items-center space-x-8">
                <TouchableOpacity
                    onPress={() => setBpm(b => Math.max(40, b - 1))}
                    className="w-16 h-16 rounded-full bg-zinc-800 items-center justify-center"
                >
                    <Text className="text-white text-2xl">-</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setIsPlaying(!isPlaying)}
                    className={`w-24 h-24 rounded-full items-center justify-center ${isPlaying ? 'bg-red-500' : 'bg-cyan-500'}`}
                >
                    <Text className="text-white font-bold">{isPlaying ? 'STOP' : 'START'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setBpm(b => Math.min(280, b + 1))}
                    className="w-16 h-16 rounded-full bg-zinc-800 items-center justify-center"
                >
                    <Text className="text-white text-2xl">+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
