import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Metronome } from './features/metronome/Metronome';
import { colors } from './theme/colors';

/**
 * Main App Shell
 * Minimalist Dark Mode design using NativeWind (Tailwind utility classes).
 */
export default function App() {
    const [activeTab, setActiveTab] = useState<'tuner' | 'metronome' | 'ear-training'>('metronome');

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="px-6 py-4">
                <Text className="text-white text-3xl font-bold tracking-tighter">
                    AXE<Text className="text-cyan-400">AID</Text>
                </Text>
                <Text className="text-zinc-500 text-sm">GUITAR STARTER MVP</Text>
            </View>

            <View className="flex-1 px-4">
                {/* Feature Container */}
                <View className="flex-1 bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                    {activeTab === 'metronome' && <Metronome />}
                    {activeTab === 'tuner' && (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-cyan-400 text-6xl font-black">E2</Text>
                            <View className="w-full px-12 mt-8">
                                <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <View className="h-2 bg-cyan-400 w-1/2 ml-1/4" />
                                </View>
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-zinc-600 text-xs">-50</Text>
                                    <Text className="text-cyan-400 text-xs">IN TUNE</Text>
                                    <Text className="text-zinc-600 text-xs">+50</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    {activeTab === 'ear-training' && (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-white text-xl text-center px-8 mb-8">
                                Listen to the tone, then play it on your guitar.
                            </Text>
                            <View className="w-32 h-32 rounded-full border-4 border-dashed border-zinc-700 items-center justify-center">
                                <Text className="text-zinc-500">PLAYING...</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* Modern Tab Bar */}
            <View className="flex-row justify-around py-8 bg-black border-t border-zinc-900">
                {(['tuner', 'metronome', 'ear-training'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className="items-center"
                    >
                        <Text className={`text-xs font-bold uppercase tracking-widest ${activeTab === tab ? 'text-cyan-400' : 'text-zinc-600'}`}>
                            {tab}
                        </Text>
                        {activeTab === tab && <View className="h-1 w-4 bg-cyan-400 mt-1 rounded-full" />}
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

// Simple Touchable wrapper for standard RN behavior
function TouchableOpacity({ children, onPress, className }: any) {
    return (
        <View onTouchEnd={onPress} className={className}>
            {children}
        </View>
    );
}
