const TRAILING_GLYPH_ROOM = ' ';

export function withGlyphRoom(text: string) {
  return `${text}${TRAILING_GLYPH_ROOM}`;
}
