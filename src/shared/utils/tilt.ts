const ANGLES = [-2.4, 1.6, -1.2, 2.2, -0.8, 1.1];

export function tiltFor(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }
  return `${ANGLES[Math.abs(hash) % ANGLES.length]}deg`;
}
