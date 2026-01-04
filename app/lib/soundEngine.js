// Procedural sound engine using Web Audio API

let audioCtx = null;

// Initialize Audio Context lazily
export const initAudio = () => {
    if (typeof window === 'undefined') return null;

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

// 1. CLICK: Soft Pop / Bubble
export const playClick = () => {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    // Pitch Variance: +/- 50Hz for organic feel
    const variance = (Math.random() * 100) - 50;
    const startFreq = 600 + variance;
    const endFreq = 300 + variance;

    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.1);

    // Envelope: Short, clean pop
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
};

// 2. STARTUP: Ethereal System Boot
export const playStartup = () => {
    const ctx = initAudio();
    if (!ctx) return;

    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    gain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Futuristic sweep up
    osc1.frequency.setValueAtTime(200, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1);

    osc2.frequency.setValueAtTime(205, ctx.currentTime); // Slight detune
    osc2.frequency.exponentialRampToValueAtTime(805, ctx.currentTime + 1);

    osc1.connect(gain);
    osc2.connect(gain);

    osc1.start();
    osc2.start();

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

    osc1.stop(ctx.currentTime + 2);
    osc2.stop(ctx.currentTime + 2);
};

// 3. ACHIEVEMENT: Majors Fanfare (Victory!)
export const playAchievement = () => {
    const ctx = initAudio();
    if (!ctx) return;

    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(ctx.destination);

    // Bright sequence (C Major Arpeggio + High Tonic)
    // C5, E5, G5, C6 (High C)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; // Sawtooth for brass-like triumph
        osc.frequency.value = freq;

        // Add vibrato/richness
        const vib = ctx.createOscillator();
        vib.frequency.value = 5;
        const vibGain = ctx.createGain();
        vibGain.gain.value = 5;
        vib.connect(vibGain);
        vibGain.connect(osc.frequency);
        vib.start(now);

        osc.connect(gain);

        // Staggered entrance
        const startTime = now + (i * 0.12);
        osc.start(startTime);
        osc.stop(startTime + 0.4); // Sustain
    });

    // Final Chord Fade out
    gain.gain.setValueAtTime(0.15, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
};

// 4. ERROR: Low Buzzer
export const playError = () => {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
};
