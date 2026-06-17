/**
 * sounds.js — Web Audio API sound effects
 * No external files needed — all sounds generated programmatically
 */

function getAudioContext() {
    if (!window._audioCtx) {
        window._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return window._audioCtx;
}

/**
 * Play a success "ding" sound — used when order is placed successfully
 */
export function playOrderSuccess() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Three ascending notes: D5 → F#5 → A5
        const notes = [587.33, 739.99, 880.00];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.18);

            gain.gain.setValueAtTime(0, now + i * 0.18);
            gain.gain.linearRampToValueAtTime(0.35, now + i * 0.18 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.5);

            osc.start(now + i * 0.18);
            osc.stop(now + i * 0.18 + 0.55);
        });
    } catch (e) {
        // Audio not supported — silently ignore
    }
}

/**
 * Play a notification "ping" — used when a new order arrives for employee
 */
export function playNewOrderAlert() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Two quick pings
        [0, 0.22].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1046.5, now + delay); // C6

            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.4, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

            osc.start(now + delay);
            osc.stop(now + delay + 0.45);
        });
    } catch (e) {
        // Audio not supported — silently ignore
    }
}

/**
 * Play a soft "click" — used for status update confirmation
 */
export function playStatusUpdate() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(660, now + 0.1);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.35);
    } catch (e) {
        // Audio not supported — silently ignore
    }
}
