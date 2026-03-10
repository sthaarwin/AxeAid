/**
 * TunerService.ts
 * Expert-level pitch detection logic using YIN algorithm or FFT.
 * Note: Real-world implementation would use a native library like react-native-pitch-detector
 * for low-latency processing, but this service outlines the core mathematical logic.
 */

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CONCERT_A = 440;

export interface TunerResult {
    note: string;
    octave: number;
    cents: number;
    frequency: number;
}

export class TunerService {
    /**
     * Converts a frequency (Hz) to a musical note with cent offset.
     * Formula: n = 12 * log2(f / 440) + 69
     */
    public static getNoteFromFrequency(frequency: number): TunerResult {
        const noteNum = 12 * (Math.log(frequency / CONCERT_A) / Math.log(2));
        const midiPortion = Math.round(noteNum) + 69;

        // Calculate cents offset (100 cents = 1 semitone)
        const cents = Math.floor((noteNum - Math.round(noteNum)) * 100);

        const octave = Math.floor(midiPortion / 12) - 1;
        const noteIndex = midiPortion % 12;
        const noteName = NOTES[noteIndex];

        return {
            note: noteName,
            octave,
            cents,
            frequency: Math.round(frequency * 100) / 100,
        };
    }

    /**
     * Simple Peak Detection logic (as a placeholder for FFT results)
     */
    public static processAudioBuffer(buffer: Float32Array, sampleRate: number): number | null {
        // In a real implementation, we would use Autocorrelation or YIN algorithm here.
        // This is high-complexity logic usually offloaded to a Worklet.
        return 440; // Defaulting to A4 for logic demonstration
    }
}
