/**
 * Cada punto es un glifo leído del atlas. El vertex shader calcula dónde está
 * (intro, rendija del loader, easter egg, scroll, deriva, mouse, onda de clic)
 * y de qué color (escaneo ámbar, hallazgo rojo → verde). Es GLSL "estilo 1":
 * ShaderMaterial de three agrega los #define de compatibilidad para WebGL2.
 */
export const VERT = /* glsl */ `
attribute vec3 aTarget;
attribute vec3 aStart;
attribute vec3 aDoor;
attribute vec3 aTarget2;
attribute float aGlyph;
attribute float aSeed;
attribute float aDot;
attribute float aBug;

uniform float uTime, uProgress, uScan, uScanOn, uPR, uSize, uMouseStr, uDrift;
uniform float uClickT, uScroll, uN, uMorph, uDoor, uAlphaMul, uBugGlyph;
uniform vec2 uMouse, uClick;
uniform vec3 uBase, uAccent, uAmber, uRed, uGreen;

varying float vGlyph;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float p = clamp((uProgress - aSeed * 0.45) / 0.55, 0.0, 1.0);
  p = 1.0 - pow(1.0 - p, 3.0);
  vec3 pos = mix(mix(aStart, aDoor, uDoor), aTarget, p);

  float mm = clamp((uMorph - aSeed * 0.35) / 0.65, 0.0, 1.0);
  mm = mm * mm * (3.0 - 2.0 * mm);
  pos = mix(pos, aTarget2, mm);
  pos.z += sin(mm * 3.14159) * (aSeed - 0.5) * 3.0;

  pos += (aStart - aTarget) * 0.28 * uScroll * uScroll + vec3(0.0, uScroll * (0.6 + aSeed * 1.6), 0.0);
  pos.x += sin(uTime * 0.6 + aSeed * 40.0) * 0.012 * uDrift;
  pos.y += cos(uTime * 0.5 + aSeed * 30.0) * 0.012 * uDrift;

  vec2 d = pos.xy - uMouse;
  float f = smoothstep(1.15, 0.0, length(d)) * uMouseStr;
  pos.xy += normalize(d + 0.0001) * f * 0.42;
  pos.z += f * 1.6;

  float age = uTime - uClickT;
  vec2 cd = pos.xy - uClick;
  float ring = exp(-pow((length(cd) - age * 4.5) * 2.6, 2.0)) * exp(-age * 1.4) * step(0.0, age);
  pos.xy += normalize(cd + 0.0001) * ring * 0.22;
  pos.z += ring * 0.9;

  float s = exp(-pow((pos.y - uScan) * 5.0, 2.0));
  vec3 col = mix(uBase, uAccent, step(0.86, fract(aSeed * 7.13)));
  col = mix(col, uAccent * 1.15, aDot);
  col = mix(col, uAmber, s * 0.95);

  float behind = uScanOn * step(uScan, pos.y);
  float trail = behind * exp(-(pos.y - uScan) * 0.9);
  float isBug = aBug * behind * smoothstep(0.3, 0.6, trail);
  float fixd = aBug * behind * (1.0 - smoothstep(0.3, 0.6, trail));
  col = mix(col, uRed, isBug);
  col = mix(col, uGreen, fixd);
  col += ring * uAccent * 0.7;
  col = mix(col, uAccent * 1.15, mm * 0.55);
  col += f * 0.35 * uAccent;

  float rate = 0.1 + s * 14.0 + ring * 10.0;
  float tick = floor(uTime * rate * uDrift + aSeed * 17.0);
  float h = fract(sin(tick * 12.9898 + aSeed * 78.233) * 43758.5453);
  vColor = col;
  vGlyph = mix(mod(aGlyph + floor(h * uN), uN), uBugGlyph, aBug * behind);
  vAlpha = p * (0.9 + 0.3 * s + 0.2 * aDot + 0.8 * (isBug + fixd)) * (1.0 - 0.85 * uScroll) * uAlphaMul;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPR * (1.0 + s * 0.45 + f * 0.7 + ring * 0.6 + isBug * 1.6 + fixd * 0.9) * (10.0 / -mv.z);
}
`;

export const FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec2 uGrid;

varying float vGlyph;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 pc = gl_PointCoord;
  float cx = mod(vGlyph, uGrid.x);
  float cy = floor(vGlyph / uGrid.x);
  vec2 uv = vec2((cx + pc.x) / uGrid.x, 1.0 - (cy + pc.y) / uGrid.y);
  float a = texture2D(uAtlas, uv).a;
  if (a < 0.08) discard;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;
