import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Line, Circle, Rect, Text as SvgText, G } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ─── Chord Data ─── */
type ChordShape = {
    name: string;
    suffix: string;
    frets: (number | -1)[]; // -1 = muted, 0 = open
    fingers: (number | 0)[];
    barres: number[];       // fret numbers that are barred
    baseFret: number;       // starting fret (1 = open position)
};

const CHORD_CATEGORIES = ['Major', 'Minor', 'Seventh', 'Extended', 'Suspended'] as const;
type ChordCategory = typeof CHORD_CATEGORIES[number];

const CHORDS: Record<ChordCategory, ChordShape[]> = {
    Major: [
        { name: 'C', suffix: '', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], barres: [], baseFret: 1 },
        { name: 'D', suffix: '', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], barres: [], baseFret: 1 },
        { name: 'E', suffix: '', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], barres: [], baseFret: 1 },
        { name: 'F', suffix: '', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1], baseFret: 1 },
        { name: 'G', suffix: '', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], barres: [], baseFret: 1 },
        { name: 'A', suffix: '', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], barres: [], baseFret: 1 },
        { name: 'B', suffix: '', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barres: [2], baseFret: 1 },
        { name: 'Bb', suffix: '', frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [1], baseFret: 1 },
        { name: 'Eb', suffix: '', frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], barres: [6], baseFret: 6 },
    ],
    Minor: [
        { name: 'C', suffix: 'm', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barres: [3], baseFret: 3 },
        { name: 'D', suffix: 'm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], barres: [], baseFret: 1 },
        { name: 'E', suffix: 'm', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], barres: [], baseFret: 1 },
        { name: 'F', suffix: 'm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1], baseFret: 1 },
        { name: 'G', suffix: 'm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barres: [3], baseFret: 3 },
        { name: 'A', suffix: 'm', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], barres: [], baseFret: 1 },
        { name: 'B', suffix: 'm', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [2], baseFret: 1 },
        { name: 'F#', suffix: 'm', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [2], baseFret: 1 },
    ],
    Seventh: [
        { name: 'C', suffix: '7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], barres: [], baseFret: 1 },
        { name: 'D', suffix: '7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], barres: [], baseFret: 1 },
        { name: 'E', suffix: '7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], barres: [], baseFret: 1 },
        { name: 'G', suffix: '7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], barres: [], baseFret: 1 },
        { name: 'A', suffix: '7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], barres: [], baseFret: 1 },
        { name: 'B', suffix: '7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], barres: [], baseFret: 1 },
        { name: 'C', suffix: 'maj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], barres: [], baseFret: 1 },
        { name: 'F', suffix: 'maj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], barres: [], baseFret: 1 },
        { name: 'A', suffix: 'm7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], barres: [], baseFret: 1 },
        { name: 'D', suffix: 'm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barres: [1], baseFret: 1 },
    ],
    Extended: [
        { name: 'C', suffix: '9', frets: [-1, 3, 2, 3, 3, -1], fingers: [0, 2, 1, 3, 4, 0], barres: [3], baseFret: 1 },
        { name: 'G', suffix: '13', frets: [3, -1, 3, 4, 5, -1], fingers: [1, 0, 2, 3, 4, 0], barres: [], baseFret: 1 },
        { name: 'D', suffix: '6', frets: [-1, -1, 0, 2, 0, 2], fingers: [0, 0, 0, 1, 0, 2], barres: [], baseFret: 1 },
        { name: 'C', suffix: 'add9', frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], barres: [], baseFret: 1 },
        { name: 'A', suffix: '11', frets: [5, 5, 5, 4, 3, 3], fingers: [3, 4, 2, 1, 1, 1], barres: [3], baseFret: 3 },
    ],
    Suspended: [
        { name: 'D', suffix: 'sus2', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], barres: [], baseFret: 1 },
        { name: 'D', suffix: 'sus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 3, 4], barres: [], baseFret: 1 },
        { name: 'A', suffix: 'sus2', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], barres: [], baseFret: 1 },
        { name: 'A', suffix: 'sus4', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], barres: [], baseFret: 1 },
        { name: 'E', suffix: 'sus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0], barres: [], baseFret: 1 },
        { name: 'G', suffix: 'sus4', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4], barres: [], baseFret: 1 },
    ],

};
/* ─── Chord Diagram SVG ─── */
const DIAGRAM_W = 130;
const DIAGRAM_H = 160;
const PADDING_LEFT = 28;
const PADDING_TOP = 24;
const STRING_SPACING = 18;
const FRET_SPACING = 26;
const NUM_FRETS = 5;
const NUM_STRINGS = 6;
const DOT_R = 6;

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

const ChordDiagram: React.FC<{ chord: ChordShape; large?: boolean }> = ({ chord, large }) => {
    const scale = large ? 1.5 : 1;
    const w = DIAGRAM_W * scale;
    const h = DIAGRAM_H * scale;
    const pl = PADDING_LEFT * scale;
    const pt = PADDING_TOP * scale;
    const ss = STRING_SPACING * scale;
    const fs = FRET_SPACING * scale;
    const dr = DOT_R * scale;

    const gridWidth = (NUM_STRINGS - 1) * ss;
    const gridHeight = NUM_FRETS * fs;

    return (
        <Svg width={w} height={h + (large ? 20 : 0)} viewBox={`0 0 ${w} ${h + (large ? 20 : 0)}`}>
            {/* Nut / position indicator */}
            {chord.baseFret === 1 ? (
                <Rect x={pl} y={pt} width={gridWidth} height={3 * scale} rx={1} fill="#94a3b8" />
            ) : (
                <SvgText
                    x={pl - 10 * scale}
                    y={pt + fs / 2 + 4 * scale}
                    fill="#64748b"
                    fontSize={10 * scale}
                    fontWeight="600"
                    textAnchor="middle"
                >
                    {chord.baseFret}fr
                </SvgText>
            )}

            {/* Fret lines */}
            {Array.from({ length: NUM_FRETS + 1 }).map((_, i) => (
                <Line
                    key={`f${i}`}
                    x1={pl}
                    y1={pt + i * fs}
                    x2={pl + gridWidth}
                    y2={pt + i * fs}
                    stroke="#334155"
                    strokeWidth={i === 0 && chord.baseFret === 1 ? 0 : 1}
                />
            ))}

            {/* String lines */}
            {Array.from({ length: NUM_STRINGS }).map((_, i) => (
                <Line
                    key={`s${i}`}
                    x1={pl + i * ss}
                    y1={pt}
                    x2={pl + i * ss}
                    y2={pt + gridHeight}
                    stroke="#334155"
                    strokeWidth={1}
                />
            ))}

            {/* Open/muted markers */}
            {chord.frets.map((fret, i) => {
                const x = pl + i * ss;
                const y = pt - 10 * scale;
                if (fret === 0) {
                    return (
                        <Circle
                            key={`o${i}`}
                            cx={x}
                            cy={y}
                            r={dr * 0.7}
                            stroke="#94a3b8"
                            strokeWidth={1.5 * scale}
                            fill="none"
                        />
                    );
                }
                if (fret === -1) {
                    return (
                        <G key={`m${i}`}>
                            <Line x1={x - 3 * scale} y1={y - 3 * scale} x2={x + 3 * scale} y2={y + 3 * scale} stroke="#64748b" strokeWidth={1.5 * scale} />
                            <Line x1={x + 3 * scale} y1={y - 3 * scale} x2={x - 3 * scale} y2={y + 3 * scale} stroke="#64748b" strokeWidth={1.5 * scale} />
                        </G>
                    );
                }
                return null;
            })}

            {/* Barre indicators */}
            {chord.barres.map((barreFret) => {
                const adjustedFret = barreFret - chord.baseFret + 1;
                const barreStrings = chord.frets.reduce<number[]>((acc, f, i) => {
                    if (f >= barreFret) acc.push(i);
                    return acc;
                }, []);
                if (barreStrings.length < 2) return null;
                const first = barreStrings[0];
                const last = barreStrings[barreStrings.length - 1];
                const y = pt + (adjustedFret - 0.5) * fs;
                return (
                    <Rect
                        key={`bar${barreFret}`}
                        x={pl + first * ss - dr}
                        y={y - dr}
                        width={(last - first) * ss + dr * 2}
                        height={dr * 2}
                        rx={dr}
                        fill="#25bdf8"
                        opacity={0.9}
                    />
                );
            })}

            {/* Finger dots */}
            {chord.frets.map((fret, i) => {
                if (fret <= 0) return null;
                const adjustedFret = fret - chord.baseFret + 1;
                // Skip if it's part of a barre (we draw that separately)
                const isBarreRoot = chord.barres.includes(fret) && i === chord.frets.indexOf(fret);
                if (chord.barres.includes(fret) && !isBarreRoot) return null;
                if (chord.barres.includes(fret)) return null; // barre drawn above

                const x = pl + i * ss;
                const y = pt + (adjustedFret - 0.5) * fs;
                return (
                    <Circle
                        key={`d${i}`}
                        cx={x}
                        cy={y}
                        r={dr}
                        fill="#25bdf8"
                    />
                );
            })}

            {/* String labels at bottom */}
            {large && STRING_LABELS.map((label, i) => (
                <SvgText
                    key={`lbl${i}`}
                    x={pl + i * ss}
                    y={pt + gridHeight + 18 * scale}
                    fill="#64748b"
                    fontSize={9 * scale}
                    fontWeight="500"
                    textAnchor="middle"
                >
                    {label}
                </SvgText>
            ))}
        </Svg>
    );
};

/* ─── Main Component ─── */
export const ChordLibrary: React.FC = () => {
    const [category, setCategory] = useState<ChordCategory>('Major');
    const [selectedChord, setSelectedChord] = useState<ChordShape | null>(null);

    const chords = CHORDS[category];

    const handleSelectChord = useCallback((chord: ChordShape) => {
        setSelectedChord(prev => (prev?.name === chord.name && prev?.suffix === chord.suffix ? null : chord));
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#0f1d23' }}>
            {/* Category pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{
                    paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center',
                }}
            >
                    {CHORD_CATEGORIES.map((cat) => {
                        const isActive = cat === category;
                        return (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => { setCategory(cat); setSelectedChord(null); }}
                                activeOpacity={0.7}
                                style={{
                                    paddingHorizontal: 16, paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor: isActive ? '#25bdf8' : 'rgba(226,232,240,0.08)',
                                }}
                            >
                                <Text style={{
                                    fontSize: 13, fontWeight: '600',
                                    color: isActive ? '#0f1d23' : '#94a3b8',
                                }}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
            </ScrollView>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Chord grid */}
                <View style={{
                    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10,
                    marginTop: 4,
                }}>
                    {chords.map((chord) => {
                        const isSelected = selectedChord?.name === chord.name && selectedChord?.suffix === chord.suffix;
                        return (
                            <TouchableOpacity
                                key={`${chord.name}${chord.suffix}`}
                                onPress={() => handleSelectChord(chord)}
                                activeOpacity={0.7}
                                style={{
                                    width: (SCREEN_WIDTH - 44) / 3,
                                    backgroundColor: isSelected ? 'rgba(37,189,248,0.12)' : 'rgba(226,232,240,0.05)',
                                    borderRadius: 16,
                                    paddingTop: 10,
                                    paddingBottom: 6,
                                    alignItems: 'center',
                                    borderWidth: isSelected ? 1 : 0,
                                    borderColor: 'rgba(37,189,248,0.3)',
                                }}
                            >
                                <Text style={{
                                    color: isSelected ? '#25bdf8' : '#f1f5f9',
                                    fontSize: 16, fontWeight: '700', marginBottom: 2,
                                }}>
                                    {chord.name}{chord.suffix}
                                </Text>
                                <ChordDiagram chord={chord} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Expanded detail card */}
                {selectedChord && (
                    <View style={{
                        marginTop: 20,
                        backgroundColor: 'rgba(226,232,240,0.06)',
                        borderRadius: 20,
                        padding: 20,
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            color: '#f1f5f9', fontSize: 24, fontWeight: '800', marginBottom: 4,
                        }}>
                            {selectedChord.name}{selectedChord.suffix}
                        </Text>
                        <Text style={{
                            color: '#64748b', fontSize: 12, fontWeight: '500', marginBottom: 12,
                            textTransform: 'uppercase', letterSpacing: 1.5,
                        }}>
                            {category} Chord
                        </Text>

                        <ChordDiagram chord={selectedChord} large />

                        {/* Fingering info */}
                        <View style={{
                            flexDirection: 'row', marginTop: 16, gap: 6,
                            flexWrap: 'wrap', justifyContent: 'center',
                        }}>
                            {STRING_LABELS.map((label, i) => {
                                const fret = selectedChord.frets[i];
                                const display = fret === -1 ? 'X' : fret === 0 ? 'O' : String(fret);
                                const isMuted = fret === -1;
                                return (
                                    <View
                                        key={i}
                                        style={{
                                            width: 38, height: 44, borderRadius: 10,
                                            backgroundColor: isMuted ? 'rgba(100,116,139,0.15)' : 'rgba(37,189,248,0.1)',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{
                                            color: '#64748b', fontSize: 9, fontWeight: '600',
                                            marginBottom: 2,
                                        }}>
                                            {label}
                                        </Text>
                                        <Text style={{
                                            color: isMuted ? '#64748b' : '#25bdf8',
                                            fontSize: 15, fontWeight: '700',
                                        }}>
                                            {display}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Tips */}
                        <View style={{
                            marginTop: 16, width: '100%',
                            backgroundColor: 'rgba(37,189,248,0.06)',
                            borderRadius: 12, padding: 14,
                        }}>
                            <Text style={{ color: '#25bdf8', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
                                💡 Tip
                            </Text>
                            <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 18 }}>
                                {selectedChord.barres.length > 0
                                    ? 'This is a barre chord. Lay your index finger flat across the strings and apply even pressure. Arch your other fingers to avoid muting adjacent strings.'
                                    : selectedChord.suffix.includes('sus')
                                    ? 'Suspended chords have an unresolved, open sound. Try alternating between the sus chord and its resolved major or minor version.'
                                    : selectedChord.suffix === '7'
                                    ? 'Dominant 7th chords add tension and are commonly used in blues and jazz. They naturally want to resolve down a 5th.'
                                    : selectedChord.suffix === 'm'
                                    ? 'Minor chords have a darker, more melancholic sound. Make sure each fretted note rings clearly without buzzing.'
                                    : 'Place your fingers close to the fret wire (not on top of it) for the cleanest sound with minimum effort.'
                                }
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
