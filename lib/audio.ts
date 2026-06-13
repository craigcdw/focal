let ctx: AudioContext | null = null;

export function initAudio() {
  if (!ctx) {
    ctx = new AudioContext();
  }
}

async function getContext(): Promise<AudioContext | null> {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  return ctx;
}

export async function playTone(notes: number[]) {
  const context = await getContext();
  if (!context) return;

  notes.forEach((freq, i) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = context.currentTime + i * 0.2;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}

export function playReminderChime() {
  playTone([523, 784, 1047, 784, 1047]);
}

export function playWorkDone() {
  playTone([523, 659, 784, 1047]);
}

export function playBreakDone() {
  playTone([784, 659, 523]);
}
