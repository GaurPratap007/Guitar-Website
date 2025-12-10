import { transposeChordName, applyCapo } from '../lib/transpose';

describe('transposeChordName', () => {
  it('transposes sharps correctly', () => {
    expect(transposeChordName('C#', 1)).toBe('D');
  });
  it('transposes complex minors', () => {
    expect(transposeChordName('F#m', 2)).toBe('G#m');
  });
  it('transposes slash chords', () => {
    expect(transposeChordName('D/F#', 1, true)).toBe('Eb/G');
  });
});

describe('applyCapo', () => {
  it('shifts display down by capo', () => {
    expect(applyCapo('G', 2)).toBe('F');
  });
});


