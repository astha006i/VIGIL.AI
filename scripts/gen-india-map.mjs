// Dev-time generator: precompute India state SVG paths + constituency marker points.
// Usage: node scripts/gen-india-map.mjs
// Inputs (one-time downloads): states.geojson (BharatMaps, 36 states), pc-poly.geojson
//   (india_pc_2019_simplified, for Telangana), pc-points.geojson (constituency centroids).
// Outputs: lib/india-map.ts, lib/india-areas.ts
import fs from 'node:fs';
import path from 'node:path';
import { geoMercator } from 'd3-geo';

const WORK = 'C:/Users/datta/AppData/Local/Temp/opencode/indiamap';
const STATE_GEO_JSON = process.env.STATE_GEO_JSON || path.join(WORK, 'states.geojson');
const PC_POLY_GEO_JSON = process.env.PC_POLY_GEO_JSON || path.join(WORK, 'pc-poly.geojson');
const PC_POINTS_GEO_JSON = process.env.PC_POINTS_GEO_JSON || path.join(WORK, 'pc-points.geojson');
const OUT_DIR = path.resolve('./lib');
const W = 800;
const H = 780;
const TOLERANCE = 0.55;

const MPLADS_NAMES = [
  'Andaman And Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu And Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
  'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'The Dadra And Nagar Haveli And Daman And Diu',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const norm = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');

const canonicalByNorm = new Map();
for (const n of MPLADS_NAMES) canonicalByNorm.set(norm(n), n);

const ALIASES = {
  ORISSA: 'Odisha',
  UTTARANCHAL: 'Uttarakhand',
  ANDAMANANDNICOBAR: 'Andaman And Nicobar Islands',
  ANDAMANNICOBAR: 'Andaman And Nicobar Islands',
  DADRAANDNAGARHAVELI: 'The Dadra And Nagar Haveli And Daman And Diu',
  DAMANANDDIU: 'The Dadra And Nagar Haveli And Daman And Diu',
  DADRANAGARHAVELIDAMANDIU: 'The Dadra And Nagar Haveli And Daman And Diu',
  DADRAANDNAGARHAVELIANDDAMANANDDIU: 'The Dadra And Nagar Haveli And Daman And Diu',
  JAMMUKASHMIR: 'Jammu And Kashmir',
  RAJASTHAN: 'Rajasthan',
  SIKKIM: 'Sikkim',
};

const canonicalName = (name) => {
  const k = norm(name);
  if (ALIASES[k]) return ALIASES[k];
  return canonicalByNorm.get(k) || null;
};

// ---- Douglas-Peucker on projected rings -----------------------------------
function simplifyRing(pts, tol) {
  const n = pts.length;
  if (n <= 3) return pts;
  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;
  const th2 = tol * tol;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    if (e <= s + 1) continue;
    const ax = pts[s][0], ay = pts[s][1];
    const bx = pts[e][0], by = pts[e][1];
    const dx = bx - ax, dy = by - ay;
    const len = dx * dx + dy * dy || 1;
    let maxD = 0;
    let maxI = -1;
    for (let i = s + 1; i < e; i++) {
      const px = pts[i][0], py = pts[i][1];
      let t = ((px - ax) * dx + (py - ay) * dy) / len;
      let cx, cy;
      if (t <= 0) { cx = ax; cy = ay; }
      else if (t >= 1) { cx = bx; cy = by; }
      else { cx = ax + t * dx; cy = ay + t * dy; }
      const ddx = px - cx, ddy = py - cy;
      const d = ddx * ddx + ddy * ddy;
      if (d > maxD) { maxD = d; maxI = i; }
    }
    if (maxI >= 0 && maxD > th2) {
      keep[maxI] = 1;
      if (maxI - s > 1) stack.push([s, maxI]);
      if (e - maxI > 1) stack.push([maxI, e]);
    }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

function ringsFromGeometry(geometry, project) {
  const rings = [];
  const visit = (ring) => {
    const projected = [];
    let prevX = NaN, prevY = NaN;
    for (const [lng, lat] of ring) {
      const p = project([lng, lat]);
      if (!p || !Number.isFinite(p[0])) continue;
      if (p[0] === prevX && p[1] === prevY) continue;
      prevX = p[0]; prevY = p[1];
      projected.push(p);
    }
    if (projected.length >= 3) rings.push(projected);
  };
  const g = geometry.type === 'Feature' ? geometry.geometry : geometry;
  if (g.type === 'Polygon') {
    for (const ring of g.coordinates) visit(ring);
  } else if (g.type === 'MultiPolygon') {
    for (const poly of g.coordinates) for (const ring of poly) visit(ring);
  }
  return rings;
}

function pathFromRings(rings, tol) {
  const parts = [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const raw of rings) {
    const ring = simplifyRing(raw, tol);
    if (ring.length < 3) continue;
    let d = '';
    for (let i = 0; i < ring.length; i++) {
      const x = +Number(ring[i][0]).toFixed(2);
      const y = +Number(ring[i][1]).toFixed(2);
      d += i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
    }
    d += 'Z';
    parts.push(d);
    for (const p of ring) {
      if (p[0] < x0) x0 = p[0];
      if (p[1] < y0) y0 = p[1];
      if (p[0] > x1) x1 = p[0];
      if (p[1] > y1) y1 = p[1];
    }
  }
  return { d: parts.join(''), b: Number.isFinite(x0) ? [x0, y0, x1, y1] : null };
}

// ---- sources ----------------------------------------------------------------
const statesGeo = JSON.parse(fs.readFileSync(STATE_GEO_JSON, 'utf8'));
const pcPolyGeo = JSON.parse(fs.readFileSync(PC_POLY_GEO_JSON, 'utf8'));
const pointsGeo = JSON.parse(fs.readFileSync(PC_POINTS_GEO_JSON, 'utf8'));

const statesFeatures = statesGeo.features.filter((f) => f && f.geometry);
const projection = geoMercator().fitExtent(
  [[12, 12], [W - 12, H - 12]],
  { type: 'FeatureCollection', features: statesFeatures }
);
const project = (pt) => projection(pt);

// ---- state shapes -----------------------------------------------------------
const groups = new Map(); // canonical -> features[]
for (const f of statesFeatures) {
  const name = canonicalName(f.properties.NAME_1 || f.properties.name || '');
  if (!name) {
    console.warn('UNMATCHED STATE:', f.properties.NAME_1);
    continue;
  }
  if (!groups.has(name)) groups.set(name, []);
  groups.get(name).push(f);
}

const shapes = new Map(); // canonical -> { d, c, b }
for (const [name, feats] of groups) {
  const rings = [];
  for (const f of feats) rings.push(...ringsFromGeometry(f, project));
  const { d, b } = pathFromRings(rings, TOLERANCE);
  if (!b) {
    console.warn('NO GEOMETRY:', name);
    continue;
  }
  const c = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  shapes.set(name, { d, c, b });
}

// Telangana from PC polygons (BharatMaps bundling it with Andhra Pradesh)
{
  const tel = pcPolyGeo.features.filter((f) => canonicalName(f.properties.st_name) === 'Telangana');
  if (tel.length) {
    const rings = [];
    for (const f of tel) rings.push(...ringsFromGeometry(f, project));
    const { d, b } = pathFromRings(rings, TOLERANCE);
    if (b) {
      const c = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
      shapes.set('Telangana', { d, c, b });
    }
  } else {
    console.warn('TELANGANA: no PC features found');
  }
}

// ---- area points ------------------------------------------------------------
const areaPoints = new Map(); // canonical -> [{ key, name, x, y }]
for (const f of pointsGeo.features) {
  const st = canonicalName(f.properties.st_name || '');
  if (!st) {
    continue;
  }
  const pcName = f.properties.pc_name || '';
  const [lng, lat] = f.geometry.coordinates;
  const p = project([lng, lat]);
  if (!p || !Number.isFinite(p[0])) continue;
  if (!areaPoints.has(st)) areaPoints.set(st, []);
  areaPoints.get(st).push({
    key: norm(pcName),
    name: pcName,
    x: +Number(p[0]).toFixed(2),
    y: +Number(p[1]).toFixed(2),
  });
}

// ---- emit -------------------------------------------------------------------
const fmt = (n) => +Number(n).toFixed(2);
const keyOf = (name) => norm(name);

const mapLines = [];
mapLines.push('// AUTO-GENERATED BY scripts/gen-india-map.mjs — do not edit.');
mapLines.push('');
mapLines.push(`export const INDIA_MAP_VIEW = { width: ${W}, height: ${H} } as const;`);
mapLines.push('');
mapLines.push('export interface IndiaStateShape {');
mapLines.push('  name: string;');
mapLines.push('  d: string;');
mapLines.push('  c: [number, number];');
mapLines.push('  b: [number, number, number, number];');
mapLines.push('}');
mapLines.push('');
mapLines.push('export const INDIA_STATE_SHAPES: Record<string, IndiaStateShape> = {');
const stateKeys = [...shapes.keys()].sort();
for (const name of stateKeys) {
  const s = shapes.get(name);
  mapLines.push(`  ${JSON.stringify(keyOf(name))}: { name: ${JSON.stringify(name)}, d: ${JSON.stringify(s.d)}, c: [${fmt(s.c[0])}, ${fmt(s.c[1])}], b: [${fmt(s.b[0])}, ${fmt(s.b[1])}, ${fmt(s.b[2])}, ${fmt(s.b[3])}] },`);
}
mapLines.push('};');
mapLines.push('');
fs.writeFileSync(path.join(OUT_DIR, 'india-map.ts'), mapLines.join('\n'), 'utf8');

const areaLines = [];
areaLines.push('// AUTO-GENERATED BY scripts/gen-india-map.mjs — do not edit.');
areaLines.push('');
areaLines.push('export interface IndiaAreaPoint {');
areaLines.push('  key: string;');
areaLines.push('  name: string;');
areaLines.push('  x: number;');
areaLines.push('  y: number;');
areaLines.push('}');
areaLines.push('');
areaLines.push('export const INDIA_AREA_POINTS: Record<string, IndiaAreaPoint[]> = {');
const areaKeys = [...areaPoints.keys()].sort();
for (const canon of areaKeys) {
  areaLines.push(`  ${JSON.stringify(keyOf(canon))}: [`);
  const sorted = areaPoints.get(canon).sort((a, b) => a.key.localeCompare(b.key));
  for (const p of sorted) {
    areaLines.push(`    { key: ${JSON.stringify(p.key)}, name: ${JSON.stringify(p.name)}, x: ${p.x}, y: ${p.y} },`);
  }
  areaLines.push('  ],');
}
areaLines.push('};');
areaLines.push('');
fs.writeFileSync(path.join(OUT_DIR, 'india-areas.ts'), areaLines.join('\n'), 'utf8');

console.log('india-map.ts:', (fs.statSync(path.join(OUT_DIR, 'india-map.ts')).size / 1024).toFixed(1), 'KB');
console.log('india-areas.ts:', (fs.statSync(path.join(OUT_DIR, 'india-areas.ts')).size / 1024).toFixed(1), 'KB');
console.log('state shape count:', shapes.size);
const missing = MPLADS_NAMES.filter((n) => !shapes.has(n));
console.log('states missing geometry:', missing);
console.log('area point states:', areaPoints.size);
const unresolved = [...new Set(pointsGeo.features.map((f) => f.properties.st_name).filter((s) => !canonicalName(s)))];
console.log('unresolved pc point states:', unresolved);