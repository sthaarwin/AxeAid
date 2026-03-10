import { Audio } from 'expo-av';

/**
 * EarTrainerService.ts
 * Logic for generating reference tones and comparing them to user input.
 */

export class EarTrainerService {
    private static sound: Audio.Sound | null = null;

    /**
     * Generates a simple sine wave tone using URI data or local assets.
     * In a complex app, use react-native-skia or a low-level audio buffer.
     */
    public static async playTargetNote(frequency: number): Promise<void> {
        // Unload previous sound if exists
        if (this.sound) {
            await this.sound.unloadAsync();
        }

        // Example frequency mapping to local synthesized assets
        // For MVP, we'll assume we have a set of reference waves.
        const { sound } = await Audio.Sound.createAsync(
            { uri: `https://www.google.com/search?q=sine+wave+${frequency}hz` }, // Placeholder for dynamic synthesis
            { shouldPlay: true }
        );

        this.sound = sound;
    }

    /**
     * Evaluates if the detected frequency is within an acceptable threshold (e.g., 20 cents)
     */
    public static compareNotes(targetFreq: number, detectedFreq: number): {
        isSuccess: boolean;
        diffCents: number
    } {
        const ratio = detectedFreq / targetFreq;
        const diffCents = Math.round(1200 * (Math.log(ratio) / Math.log(2)));

        return {
            isSuccess: Math.abs(diffCents) < 20, // 20 cents threshold
            diffCents
        };
    }

    public static async stop(): Promise<void> {
        await this.sound?.stopAsync();
    }
}
