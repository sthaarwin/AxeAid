import { Audio } from 'expo-av';

/**
 * EarTrainerService.ts
 * Plays reference tones from local WAV files and compares frequencies.
 */

// Map note names to require()'d assets — static requires for Metro bundler
const NOTE_ASSETS: Record<string, any> = {
    C4: require('../../../assets/sounds/notes/C4.wav'),
    D4: require('../../../assets/sounds/notes/D4.wav'),
    E4: require('../../../assets/sounds/notes/E4.wav'),
    F4: require('../../../assets/sounds/notes/F4.wav'),
    G4: require('../../../assets/sounds/notes/G4.wav'),
    A4: require('../../../assets/sounds/notes/A4.wav'),
    B4: require('../../../assets/sounds/notes/B4.wav'),
    C5: require('../../../assets/sounds/notes/C5.wav'),
};

export class EarTrainerService {
    private static sound: Audio.Sound | null = null;

    /**
     * Play a reference tone for the given note name (e.g. "C4", "A4").
     */
    public static async playTargetNote(noteName: string): Promise<void> {
        if (this.sound) {
            await this.sound.unloadAsync().catch(() => {});
            this.sound = null;
        }

        const asset = NOTE_ASSETS[noteName];
        if (!asset) {
            console.warn(`[EarTrainerService] No audio asset for note: ${noteName}`);
            return;
        }

        try {
            const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true });
            this.sound = sound;
        } catch (err) {
            console.warn('[EarTrainerService] Failed to play tone:', err);
        }
    }

    /**
     * Evaluates if the detected frequency is within an acceptable cent threshold.
     */
    public static compareNotes(
        targetFreq: number,
        detectedFreq: number,
        threshold: number = 20,
    ): { isSuccess: boolean; diffCents: number } {
        const ratio = detectedFreq / targetFreq;
        const diffCents = Math.round(1200 * (Math.log(ratio) / Math.log(2)));

        return {
            isSuccess: Math.abs(diffCents) < threshold,
            diffCents,
        };
    }

    public static async stop(): Promise<void> {
        await this.sound?.stopAsync().catch(() => {});
    }

    public static async unload(): Promise<void> {
        await this.sound?.unloadAsync().catch(() => {});
        this.sound = null;
    }
}
