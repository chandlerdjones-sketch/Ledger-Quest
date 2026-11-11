// Chiptune music and sound effects, all synthesized with Web Audio.
(() => {
const LQ = window.LQ;
const SEMI = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return m ? 440 * Math.pow(2, (SEMI[m[1]] - 9) / 12 + (+m[2] - 4)) : 0; };
const seq = s => s.split(/\s+/).filter(x => x && x !== '|');
const TRACKS = {
  village: { bpm: 112, lw: 'square', lv: .035, bv: .07,
    lead: seq('E5 G5 C6 G5 E5 G5 A5 G5 | F5 A5 C6 A5 G5 E5 D5 - | E5 G5 C6 G5 E5 G5 A5 B5 | C6 B5 A5 G5 E5 D5 C5 -'),
    bass: seq('C3 - G3 - C3 - G3 - | F3 - C4 - G3 - D3 - | C3 - G3 - A3 - E3 - | F3 - G3 - C3 - C3 -') },
  winter: { bpm: 92, lw: 'triangle', lv: .07, bv: .06,
    lead: seq('E5 - G5 - C6 - G5 - | A5 - G5 - E5 - - - | F5 - A5 - C6 - A5 - | G5 - E5 - D5 - - -'),
    bass: seq('C3 - - - G3 - - - | A3 - - - E3 - - - | F3 - - - C3 - - - | G3 - - - G3 - - -') },
  mountain: { bpm: 96, lw: 'square', lv: .03, bv: .07,
    lead: seq('A4 - E5 - D5 - C5 - | B4 - C5 - A4 - - - | A4 - E5 - F5 - E5 - | D5 - B4 - A4 - - -'),
    bass: seq('A2 - - - E3 - - - | F2 - - - E3 - - - | A2 - - - D3 - - - | E3 - - - A2 - - -') },
  battle: { bpm: 156, lw: 'square', lv: .035, bv: .08,
    lead: seq('A4 C5 E5 A5 E5 C5 A4 C5 | G4 B4 D5 G5 D5 B4 G4 B4 | F4 A4 C5 F5 C5 A4 F4 A4 | E4 G#4 B4 E5 B4 G#4 E5 E5'),
    bass: seq('A2 A2 A3 A2 A2 A3 A2 A3 | G2 G2 G3 G2 G2 G3 G2 G3 | F2 F2 F3 F2 F2 F3 F2 F3 | E2 E2 E3 E2 E2 E3 E3 E3') },
  coast: { bpm: 104, lw: 'triangle', lv: .075, bv: .06,
    lead: seq('G5 - E5 G5 A5 - G5 E5 | D5 - E5 G5 E5 - - - | C5 - E5 G5 C6 - B5 A5 | G5 - A5 B5 C6 - - -'),
    bass: seq('C3 - G3 - E3 - G3 - | G2 - D3 - G3 - D3 - | A2 - E3 - F3 - C3 - | G2 - D3 - C3 - G3 -') },
  tide: { bpm: 100, lw: 'square', lv: .03, bv: .07,
    lead: seq('D5 - A4 - D5 - F5 - | E5 - C5 - A4 - - - | D5 - A4 - D5 - G5 - | F5 - E5 - D5 - - -'),
    bass: seq('D3 - - - A2 - - - | A2 - - - E3 - - - | D3 - - - G2 - - - | A2 - - - D3 - - -') },
  canyon: { bpm: 120, lw: 'square', lv: .033, bv: .07,
    lead: seq('A4 C5 D5 E5 G5 E5 D5 C5 | A4 - C5 D5 E5 - D5 - | G4 B4 D5 G5 E5 D5 B4 G4 | A4 - C5 E5 A5 - - -'),
    bass: seq('A2 - E3 - A2 - E3 - | F2 - C3 - F2 - C3 - | G2 - D3 - G2 - D3 - | A2 - E3 - A2 - A2 -') },
  summit: { bpm: 96, lw: 'triangle', lv: .075, bv: .06,
    lead: seq('D5 - F#5 A5 D6 - A5 - | B5 - G5 B5 A5 - - - | D5 - F#5 A5 D6 - E6 - | C#6 - A5 C#6 D6 - - -'),
    bass: seq('D3 - - - A3 - - - | G3 - - - A3 - - - | B2 - - - F#3 - - - | A2 - - - D3 - - -') },
  title: { bpm: 84, lw: 'triangle', lv: .08, bv: .06,
    lead: seq('C5 - E5 G5 C6 - B5 - | A5 - F5 A5 G5 - - - | C5 - E5 G5 C6 - D6 - | B5 - G5 B5 C6 - - -'),
    bass: seq('C3 - - - C3 - - - | F3 - - - G3 - - - | A3 - - - E3 - - - | G3 - - - C3 - - -') },
};
const A = LQ.audio = {
  ctx: null, muted: false, want: null, cur: null, step: 0, next: 0, timer: null,
  unlock() {
    if (!A.ctx) {
      try {
        A.ctx = new (window.AudioContext || window.webkitAudioContext)();
        A.master = A.ctx.createGain(); A.master.gain.value = A.muted ? 0 : 1; A.master.connect(A.ctx.destination);
        if (A.want) { const w = A.want; A.cur = null; A.play(w); }
      } catch (e) { A.ctx = null; }
    } else if (A.ctx.state === 'suspended') A.ctx.resume();
  },
  tone(f, t0, dur, type = 'square', vol = .05, slide) {
    if (!A.ctx || !f) return;
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(A.master); o.start(t0); o.stop(t0 + dur + 0.03);
  },
  noise(t0, dur, vol = .12) {
    if (!A.ctx) return;
    const n = Math.floor(A.ctx.sampleRate * dur), b = A.ctx.createBuffer(1, n, A.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = A.ctx.createBufferSource(), g = A.ctx.createGain(); s.buffer = b; g.gain.value = vol;
    s.connect(g); g.connect(A.master); s.start(t0);
  },
  sfx(name) {
    if (!A.ctx) return; const t = A.ctx.currentTime, T = A.tone;
    if (name === 'blip') T(620 + Math.random() * 80, t, .035, 'square', .018);
    else if (name === 'move') T(520, t, .05, 'square', .04);
    else if (name === 'ok') { T(660, t, .06, 'square', .05); T(990, t + .06, .09, 'square', .05); }
    else if (name === 'coin') { T(988, t, .07, 'square', .05); T(1319, t + .07, .16, 'square', .05); }
    else if (name === 'right') { T(784, t, .08, 'square', .05); T(988, t + .08, .08, 'square', .05); T(1319, t + .16, .18, 'square', .05); }
    else if (name === 'wrong') { T(220, t, .16, 'sawtooth', .06, 150); T(160, t + .16, .22, 'sawtooth', .06, 100); }
    else if (name === 'hit') { A.noise(t, .18, .16); T(180, t, .2, 'square', .08, 60); }
    else if (name === 'slash') { A.noise(t, .1, .1); T(900, t, .12, 'sawtooth', .05, 300); }
    else if (name === 'learn') { T(523, t, .09, 'triangle', .1); T(659, t + .09, .09, 'triangle', .1); T(784, t + .18, .09, 'triangle', .1); T(1047, t + .27, .25, 'triangle', .1); }
    else if (name === 'rumble') { A.noise(t, .7, .14); T(70, t, .7, 'sawtooth', .08, 40); }
    else if (name === 'stamp') { A.noise(t, .12, .2); T(120, t, .15, 'square', .1, 60); }
    else if (name === 'fanfare') {
      ['C5', 'E5', 'G5', 'C6', 'G5', 'C6', 'E6'].forEach((n, i) => T(freq(n), t + i * .12, i === 6 ? .7 : .14, 'square', .06));
      ['C3', 'G3', 'C4'].forEach((n, i) => T(freq(n), t + i * .36, .5, 'triangle', .1));
    }
  },
  play(name) {
    A.want = name;
    if (!A.ctx || A.cur === name) return;
    A.cur = name; A.step = 0; A.next = A.ctx.currentTime + 0.08;
    if (!A.timer) A.timer = setInterval(A.tick, 50);
  },
  stop() { A.want = null; A.cur = null; },
  tick() {
    const tr = TRACKS[A.cur]; if (!tr || !A.ctx) return;
    const sl = 30 / tr.bpm;
    while (A.next < A.ctx.currentTime + 0.25) {
      const i = A.step % tr.lead.length;
      A.tone(freq(tr.lead[i]), A.next, sl * 0.95, tr.lw, tr.lv);
      A.tone(freq(tr.bass[i]), A.next, sl * 1.8, 'triangle', tr.bv);
      A.step++; A.next += sl;
    }
  },
  toggleMute() { A.muted = !A.muted; if (A.master) A.master.gain.value = A.muted ? 0 : 1; if (LQ.ui) LQ.ui.toast(A.muted ? 'Sound off' : 'Sound on'); },
};
})();
