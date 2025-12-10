import { parseInline, parseTextToAst } from '../lib/chordParser';

describe('chord parser', () => {
  it('parses inline chords', () => {
    const r = parseInline('[G]Hello [Em]world');
    expect(r.kind).toBe('inline');
    if (r.kind === 'inline') {
      expect(r.tokens.filter(t => t.type === 'chord')).toHaveLength(2);
    }
  });
  it('handles slash and parentheses', () => {
    const r = parseInline('[D/F#] walk (x2)');
    expect(r.kind).toBe('inline');
  });
  it('parses repeat markers', () => {
    const r = parseInline('(x3)');
    expect(r.kind).toBe('repeat');
  });
  it('parses full text to lines', () => {
    const ast = parseTextToAst('[G]A\n# Comment\n\n(x2)');
    expect(ast).toHaveLength(4);
    expect(ast[1].kind).toBe('comment');
    expect(ast[2].kind).toBe('blank');
  });
});


