/**
 * PitchDetectionService.ts
 * Wraps react-native-pitch-detector for real microphone-based pitch detection.
 * Falls back gracefully in Expo Go (where native modules aren't available).
 */

import { Platform } from 'react-native';

// Types matching react-native-pitch-detector's callback data
export interface PitchData {
    frequency: number;
    tone: string; // e.g. "C#"
}

export type PitchCallback = (data: PitchData) => void;

let PitchDetector: any = null;
let RNPERMISSIONS: any = null;

// Lazy-load native modules — they crash in Expo Go so we catch
try {
    PitchDetector = require('react-native-pitch-detector').PitchDetector;
} catch {
    console.warn('[PitchDetectionService] react-native-pitch-detector not available (Expo Go?)');
}

try {
    RNPERMISSIONS = require('react-native-permissions');
} catch {
    console.warn('[PitchDetectionService] react-native-permissions not available (Expo Go?)');
}

class PitchDetectionServiceClass {
    private listening = false;
    private callback: PitchCallback | null = null;
    private subscription: any = null;

    /**
     * Request microphone permission. Returns true if granted.
     */
    async requestPermission(): Promise<boolean> {
        if (!RNPERMISSIONS) {
            console.warn('[PitchDetectionService] Permissions library unavailable');
            return false;
        }

        const { PERMISSIONS, RESULTS, request, check } = RNPERMISSIONS;

        const permission = Platform.select({
            ios: PERMISSIONS.IOS.MICROPHONE,
            android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        });

        if (!permission) return false;

        let status = await check(permission);
        if (status === RESULTS.GRANTED) return true;

        status = await request(permission);
        return status === RESULTS.GRANTED;
    }

    /**
     * Start listening to microphone pitch data.
     * Calls `onPitch` with { frequency, tone } on every detection.
     */
    async start(onPitch: PitchCallback): Promise<boolean> {
        if (this.listening) {
            // Already running, just swap callback
            this.callback = onPitch;
            return true;
        }

        if (!PitchDetector) {
            console.warn('[PitchDetectionService] PitchDetector not available');
            return false;
        }

        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            console.warn('[PitchDetectionService] Microphone permission denied');
            return false;
        }

        this.callback = onPitch;

        // Register listener before starting
        this.subscription = PitchDetector.addListener((data: PitchData) => {
            if (this.callback && data.frequency > 0) {
                this.callback(data);
            }
        });

        try {
            await PitchDetector.start();
            this.listening = true;
            return true;
        } catch (err) {
            console.warn('[PitchDetectionService] Failed to start:', err);
            this.cleanup();
            return false;
        }
    }

    /**
     * Stop listening to microphone.
     */
    async stop(): Promise<void> {
        if (!this.listening || !PitchDetector) return;

        try {
            await PitchDetector.stop();
        } catch (err) {
            console.warn('[PitchDetectionService] Failed to stop:', err);
        }

        this.cleanup();
    }

    /**
     * Check if currently recording.
     */
    isListening(): boolean {
        return this.listening;
    }

    private cleanup() {
        if (PitchDetector) {
            try {
                PitchDetector.removeListener();
            } catch { /* ignore */ }
        }
        this.subscription = null;
        this.callback = null;
        this.listening = false;
    }
}

export const PitchDetectionService = new PitchDetectionServiceClass();
