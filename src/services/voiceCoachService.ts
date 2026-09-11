export class VoiceCoachService {
  private static isVoiceEnabled = true;
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  public static isSupported(): boolean {
    return !!this.synth;
  }

  public static setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public static isEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public static speak(text: string) {
    if (!this.isVoiceEnabled || !this.synth) return;

    try {
      this.synth.cancel(); // Stop any overlapping voice
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.85;

      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Voice coach error:', e);
    }
  }

  public static speakCoachFeedback(type: 'correct' | 'blunder' | 'hint' | 'streak', text?: string) {
    if (!this.isVoiceEnabled) return;

    const phrases = {
      correct: [
        'Brilliant tactical vision!',
        'Excellent move! Exactly the classical master line.',
        'Sharp calculation! The defense collapses.',
        'Well found! You punished the positional inaccuracy.'
      ],
      blunder: [
        'Careful! That hands tactical initiative to the opponent.',
        'Watch your hanging pieces. Let\'s review the position.',
        'Not quite. The geometry leaves you vulnerable.',
        'Hold on—look for an immediate tactical counter-stroke.'
      ],
      hint: [
        'Notice the alignment on that open diagonal.',
        'Look at the uncastled King and weak pawn targets.',
        'Which piece is overloaded defending two critical squares?'
      ],
      streak: [
        'Three in a row! Tactical intuition is on fire!',
        'Tremendous precision! Keep the streak rolling.'
      ]
    };

    const chosenList = phrases[type] || phrases.correct;
    const randomDefault = chosenList[Math.floor(Math.random() * chosenList.length)];
    this.speak(text || randomDefault);
  }
}
