import type { PetMood, PetStage } from './types';

type Palette = {
  body: string;
  belly: string;
  wing: string;
  wingEdge: string;
  horn: string;
  spike: string;
};

const INK = '#4A2E2A';
const CHEEK = '#F28FAE';

const PALETTES: Record<PetStage, Palette> = {
  baby: {
    body: '#F6B6C9',
    belly: '#FFF2E8',
    wing: '#EFA0B8',
    wingEdge: '#D97C99',
    horn: '#FBE3CF',
    spike: '#E07C9C',
  },
  young: {
    body: '#F2A6BE',
    belly: '#FFEFE3',
    wing: '#E991AC',
    wingEdge: '#D0668A',
    horn: '#F8DCC2',
    spike: '#D0668A',
  },
  teen: {
    body: '#EC97B3',
    belly: '#FFECDD',
    wing: '#DE7F9E',
    wingEdge: '#B9557A',
    horn: '#F4D2B2',
    spike: '#C45A80',
  },
  adult: {
    body: '#E5869F',
    belly: '#FFE8D6',
    wing: '#CF6E8E',
    wingEdge: '#9E4566',
    horn: '#F2C46E',
    spike: '#B04A70',
  },
};

const SHAPE: Record<PetStage, { wing: number; horn: number; tail: number }> = {
  baby: { wing: 0.42, horn: 0, tail: 0.75 },
  young: { wing: 0.62, horn: 10, tail: 0.88 },
  teen: { wing: 0.82, horn: 18, tail: 1 },
  adult: { wing: 1.02, horn: 26, tail: 1.08 },
};

const WING =
  'M0 0 C18 -30 52 -52 70 -42 C62 -30 64 -20 72 -10 C58 -10 52 -2 56 8 C42 2 30 6 20 14 Z';

function wings(stage: PetStage, palette: Palette) {
  const scale = SHAPE[stage].wing;
  const wing = (x: number, flip: number) =>
    `<path d="${WING}" transform="translate(${x} 128) scale(${flip * scale} ${scale})" fill="${palette.wing}" stroke="${palette.wingEdge}" stroke-width="${3 / scale}" stroke-linejoin="round"/>`;
  return wing(126, 1) + wing(74, -1);
}

function tail(stage: PetStage, palette: Palette) {
  const scale = SHAPE[stage].tail;
  return `<g transform="translate(128 160) scale(${scale})">
    <path d="M0 2 C28 18 52 10 54 -18 C48 -8 36 2 10 -8 Z" fill="${palette.body}"/>
    <path d="M54 -18 L44 -30 L62 -34 Z" fill="${palette.spike}" stroke="${palette.spike}" stroke-width="2" stroke-linejoin="round"/>
  </g>`;
}

function horns(stage: PetStage, palette: Palette) {
  const length = SHAPE[stage].horn;
  if (length === 0) {
    return `<ellipse cx="74" cy="50" rx="6" ry="5" fill="${palette.horn}"/><ellipse cx="126" cy="50" rx="6" ry="5" fill="${palette.horn}"/>`;
  }
  const horn = (base: number, direction: number) =>
    `<path d="M${base - 8 * direction} 56 Q${base - 12 * direction} ${48 - length * 0.6} ${base - 16 * direction} ${44 - length} Q${base + 4 * direction} ${46 - length * 0.4} ${base + 8 * direction} 52 Z" fill="${palette.horn}" stroke="${palette.horn}" stroke-width="2" stroke-linejoin="round"/>`;
  return horn(76, 1) + horn(124, -1);
}

function frills(stage: PetStage, palette: Palette) {
  const size = stage === 'baby' ? 0.7 : 1;
  const frill = (x: number, direction: number) =>
    `<path d="M${x} 78 L${x - 18 * size * direction} ${66 - 4 * size} L${x - 10 * size * direction} 82 L${x - 20 * size * direction} 90 L${x + 2 * direction} 98 Z" fill="${palette.spike}" stroke="${palette.spike}" stroke-width="2" stroke-linejoin="round"/>`;
  return frill(50, 1) + frill(150, -1);
}

function crest(stage: PetStage, palette: Palette) {
  if (stage === 'baby' || stage === 'young') return '';
  const spike = (x: number, height: number) =>
    `<path d="M${x - 7} 46 L${x} ${46 - height} L${x + 7} 46 Z" fill="${palette.spike}" stroke="${palette.spike}" stroke-width="2" stroke-linejoin="round"/>`;
  return spike(90, 9) + spike(100, 13) + spike(110, 9);
}

function eggshell() {
  return `<path d="M62 60 Q100 14 138 60 L130 52 L121 61 L111 51 L100 61 L89 51 L79 61 L70 52 Z" fill="#FFF8F0" stroke="#EAD7C6" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="86" cy="40" r="3" fill="#F5D9C4"/><circle cx="112" cy="34" r="2.4" fill="#F5D9C4"/>`;
}

function crown() {
  return `<path d="M84 40 L88 24 L96 34 L100 20 L104 34 L112 24 L116 40 Z" fill="#F2C46E" stroke="#D9A64A" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="100" cy="32" r="2.6" fill="#E0668C"/>`;
}

function eyes(mood: PetMood) {
  if (mood === 'happy') {
    return `<path d="M70 90 Q79 79 88 90" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M112 90 Q121 79 130 90" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  if (mood === 'sleepy') {
    return `<path d="M70 88 Q79 95 88 88" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M112 88 Q121 95 130 88" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  const sad = mood === 'hungry' || mood === 'lonely';
  const eye = (x: number) =>
    `<ellipse cx="${x}" cy="88" rx="8" ry="10" fill="${INK}"/><circle cx="${x + 3}" cy="84" r="3.2" fill="#FFFFFF"/><circle cx="${x - 3}" cy="92" r="1.6" fill="#FFFFFF"/>`;
  const brows = sad
    ? `<path d="M68 74 L86 70" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M132 74 L114 70" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`
    : '';
  const tear =
    mood === 'lonely'
      ? `<path d="M134 96 Q138 104 134 108 Q130 104 134 96 Z" fill="#9FD3F0"/>`
      : '';
  return eye(79) + eye(121) + brows + tear;
}

function mouth(mood: PetMood) {
  if (mood === 'happy') {
    return `<path d="M90 116 Q100 130 110 116 Z" fill="#B54A6B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M95 122 Q100 126 105 122" fill="#F28FAE"/>`;
  }
  if (mood === 'hungry') {
    return `<ellipse cx="100" cy="120" rx="6" ry="7" fill="#B54A6B" stroke="${INK}" stroke-width="3"/>`;
  }
  if (mood === 'lonely') {
    return `<path d="M92 122 Q100 115 108 122" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  if (mood === 'sleepy') {
    return `<ellipse cx="100" cy="119" rx="4" ry="3.5" fill="#B54A6B"/>`;
  }
  return `<path d="M92 117 Q100 124 108 117" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
}

function extras(mood: PetMood) {
  if (mood === 'happy') {
    return `<path d="M168 52 C168 46 160 44 158 50 C156 44 148 46 148 52 C148 59 158 64 158 64 C158 64 168 59 168 52 Z" fill="#E0668C"/>`;
  }
  if (mood === 'sleepy') {
    const z = (x: number, y: number, size: number) =>
      `<path d="M${x} ${y} L${x + size} ${y} L${x} ${y + size} L${x + size} ${y + size}" fill="none" stroke="#B9A79D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    return z(150, 50, 10) + z(166, 32, 13);
  }
  return '';
}

export function dragonSvg(stage: PetStage, mood: PetMood) {
  const palette = PALETTES[stage];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="190" rx="52" ry="6" fill="#5C3D2E" opacity="0.08"/>
  ${wings(stage, palette)}
  ${tail(stage, palette)}
  <ellipse cx="100" cy="150" rx="44" ry="36" fill="${palette.body}"/>
  <ellipse cx="100" cy="155" rx="27" ry="25" fill="${palette.belly}"/>
  <path d="M82 146 Q100 150 118 146 M80 157 Q100 161 120 157 M84 168 Q100 172 116 168" fill="none" stroke="${palette.body}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
  <ellipse cx="66" cy="150" rx="9" ry="13" transform="rotate(24 66 150)" fill="${palette.body}"/>
  <ellipse cx="134" cy="150" rx="9" ry="13" transform="rotate(-24 134 150)" fill="${palette.body}"/>
  <ellipse cx="78" cy="184" rx="15" ry="8" fill="${palette.body}"/>
  <ellipse cx="122" cy="184" rx="15" ry="8" fill="${palette.body}"/>
  ${frills(stage, palette)}
  ${horns(stage, palette)}
  ${crest(stage, palette)}
  <ellipse cx="100" cy="92" rx="54" ry="44" fill="${palette.body}"/>
  <ellipse cx="100" cy="114" rx="21" ry="12" fill="${palette.belly}" opacity="0.85"/>
  <path d="M93 106 Q95 104 97 106 M103 106 Q105 104 107 106" fill="none" stroke="${palette.spike}" stroke-width="2.2" stroke-linecap="round"/>
  <ellipse cx="64" cy="106" rx="9" ry="5.5" fill="${CHEEK}" opacity="0.6"/>
  <ellipse cx="136" cy="106" rx="9" ry="5.5" fill="${CHEEK}" opacity="0.6"/>
  ${eyes(mood)}
  ${mouth(mood)}
  ${stage === 'baby' ? eggshell() : ''}
  ${stage === 'adult' ? crown() : ''}
  ${extras(mood)}
</svg>`;
}
