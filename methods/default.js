// vendetta default methods
// MIT License
// (c) 2023 Fedot Kryutchenko

const display = {
  b: 'block',
  i: 'inline', 
  ib: 'inline-block',
  f: 'flex',
  if: 'inline-flex',
  g: 'grid',
  ig: 'inline-grid',
  fr: 'flow-root',
  n: 'none',
  c: 'contents',
  t: 'table',
  tr: 'table-row',
  li: 'list-item'
}
const flexAlign = {
  s: 'flex-start',
  e: 'flex-end',
  c: 'center',
  ar: 'space-around',
  bw: 'space-between',
  ev: 'space-evenly',
  st: 'stretch',
  ss: 'self-start',
  se: 'self-end',
}
const flexAlignH = {
  ...flexAlign,
  l: 'flex-start',
  r: 'flex-end',
}
const flexAlignV = {
  ...flexAlign,
  t: 'flex-start',
  b: 'flex-end',
  bl: 'baseline',
  blf: 'first baseline',
  bll: 'last baseline',
}
const gridFlow = {
  col: 'column',
  'col*': 'column dense',
  row: 'row',
  'row*': 'row dense'
}
const overflow = {
  h: "hidden",
  a: "auto",
  s: "scroll"
}
const length = {
  f: '100%',
  a: 'auto',
  mx: 'max-content',
  mn: 'min-content',
  ft: 'fit-content',
  fl: 'fill-available',
}
const textAlign = {
  s: 'start',
  l: 'left',
  m: 'middle',
  r: 'right',
  e: 'end',
  j: 'justify',
  ja: 'justify-all',
  mp: 'match-parent'
}
const borderStyle = {
  n: 'none',
  '-': 'solid',
  '.': 'dotted',
  '~': 'wavy',
  '--': 'dashed',
  '=': 'double'
}
const textTransform = {
  u: 'uppercase',
  l: 'lowercase',
  c: 'capitalize'
}
const userSelect = {
  '~': 'auto',
  n: 'none',
  t: 'text',
  a: 'all',
  c: 'contain'
}
const visibility = {
  h: 'hidden',
  v: 'visible',
  c: 'collapse',
}
const wordBreak = {
  k: 'keep-all',
  w: 'break-word',
  a: 'break-all',
}
const whiteSpace = {
  nw: 'nowrap',
  p: 'pre',
  pw: 'pre-wrap',
  pl: 'pre-line',
  bs: 'break-spaces'
}

const sides = { '': [''] }
sides.T = ['Top'];
sides.B = ['Bottom'];
sides.L = ['Left'];
sides.R = ['Right'];
sides.h = sides.H = ['Left', 'Right'];
sides.v = sides.V = ['Top', 'Bottom'];
sides.t = ['BlockStart'];
sides.b = ['BlockEnd'];
sides.l = ['InlineStart'];
sides.r = ['InlineEnd'];

const corners = { '': [''] }
corners.TL = corners.tl = ['StartStart'];
corners.TR = corners.tr = ['StartEnd'];
corners.BL = corners.bl = ['EndStart'];
corners.BR = corners.br = ['EndEnd'];
corners.T  = corners.t  = [...corners.tl, ...corners.tr];
corners.B  = corners.b  = [...corners.bl, ...corners.br];
corners.L  = corners.l  = [...corners.tl, ...corners.bl];
corners.R  = corners.r  = [...corners.tr, ...corners.br];

const some = (args, r) => {
  for (let i = 0; i < args.length; i++) {
    const av = args[i];
    const v = typeof r == 'object' ? r[av] : r(av);
    if (v) return (args.splice(i, 1)[0], v);
  }
  return null;
}

const def = (obj, methodName, func) =>
  Object.fromEntries(Object.entries(obj).map(([name, props]) => [
    methodName(name),
    (s, ...a) => props.forEach((p) => func(p)(s, ...a))
  ]));

const gridTrack = (size, str) => {
  let [ , count, track=''] = str.match(/(.*)\[(.*)\]/) ?? [null, str];
  count = +count;
  const [head, repeat=[]] = track.split('|').map(a =>
    a.split(/\s+/).filter(v=>v).map(size)
  );

  if (isNaN(count)) return '';
  if (!repeat.length) return [...head,
    `repeat(${count - head.length},1fr)`
  ].join(' ');
  
  const tail = repeat.slice(0, (count - head.length) % repeat.length);
  const repeatCount = (count - head.length - tail.length) / repeat.length;
  return [...head,
    `repeat(${repeatCount},${repeat.join(' ')})`, ...tail
  ].join(' ');
}

const append = (s, prop, val) => (s[prop] ??= '', s[prop] += val);

const withConfig = func => (cfg) => {
  const resolve = {};
  const { unit=[8,'px'] } = cfg;
  for (const [k, r] of Object.entries(cfg))
    resolve[k] = typeof r == 'function' ? r : v => r[v] ?? v;
  resolve.size = v => isNaN(+v) ? v : +v * cfg.unit[0] + cfg.unit[1];
  return func(resolve);
}

export const methods = withConfig(({
  size,
  color=v=>v,
  textSize=v=>v,
  lineHeight=v=>v,
  shadow=v=>v
}) => ({
  // align
  alC: (s, v) => s.alignContent = flexAlign[v] ?? v,
  alI: (s, v) => s.alignItems = flexAlign[v] ?? v,
  alS: (s, v) => s.alignSelf = flexAlign[v] ?? v,
  alT: (s, v) => s.alignTracks = flexAlign[v] ?? v,
  fll: (s) => s.float = 'left',
  flr: (s) => s.float = 'right',
  
  // composition
  grid: (s, columns, rows, flow) => {
    s.display = 'grid';
    if (columns) s.gridTemplateColumns = gridTrack(size, columns);
    if (rows) s.gridTemplateRows = gridTrack(size, rows);
    if (flow) s.gridAutoFlow = gridFlow[flow] ?? flow;
  },
  row: (s, ...a) => (
    s.display = 'flex',
    s.flexDirection = 'row',
    s.justifyContent = some(a, flexAlignH),
    s.alignItems = some(a, flexAlignV)),
  col: (s, ...a) => (
    s.display = 'flex',
    s.flexDirection = 'column',
    s.alignItems = some(a, flexAlignH),
    s.justifyContent = some(a, flexAlignV)),
  span: (s, x, y) => (
    s.gridRow = x ? `span ${x} / span ${x}` : '',
    s.gridColumn = y ? `span ${y} / span ${y}` : ''),
  gap: (s, x, y=x) => (
    s.columnGap = size(x) ?? x,
    s.rowGap = size(y) ?? y),
  rigid: (s) => s.flexShrink = 0,
  flex: (s, v) => s.flex = v,
  
  // size
  w: (s, v) => s.width = length[v] ?? size(v),
  mnw: (s, v) => s.minWidth = length[v] ?? size(v),
  mxw: (s, v) => s.maxWidth = length[v] ?? size(v),
  h: (s, v) => s.height = length[v] ?? size(v),
  mnh: (s, v) => s.minHeight = length[v] ?? size(v),
  mxh: (s, v) => s.maxHeight = length[v] ?? size(v),
  
  // text
  td: (s, v) => (
    s.textDecoration = (borderStyle[v] ?? v),
    s.textDecoration += (s.textDecoration != 'none' ? ' underline' : '')
  ),
  ta: (s, v) => s.textAlign = textAlign[v] ?? v,
  tc: (s, c) => s.color = color(c),
  tf: (s, f) => s.fontFamily = f,
  tl: (s, v) => s.lineHeight = lineHeight(v),
  ts: (s, v) => s.fontSize = textSize(v),
  tt: (s, v) => s.textTransform = textTransform[v] ?? v,
  tw: (s, v) => s.fontWeight = v,
  tlc: (s, n) => s.WebkitLineClamp = s.lineClamp = n,
  tov: (s, v) => s.textOverflow = v,
  tws: (s, v) => s.whiteSpace = whiteSpace[v] ?? v,
  twb: (s, v) => s.wordBreak = wordBreak[v] ?? v,
  tlg: (s, v) => s.letterSpacing = size(v),
  twg: (s, v) => s.wordSpacing = size(v),
  tsh: (s, ...a) =>
    s.textShadow = a.map(v => color(v) ?? size(v) ?? v).join(' '),
  
  // padding, margin, border, border-radius
  ...def(sides,   _=>'p'+_,  _=>(s, v) =>
    s[`padding${_}`] = length[v] ?? size(v)),
  ...def(sides,   _=>'m'+_,  _=>(s, v) =>
    s[`margin${_}`] = length[v] ?? size(v)),
  ...def(corners, _=>'r'+_,  _=>(s, v) => s[`border${_}Radius`] = size(v)),
  ...def(sides,   _=>'br'+_, _=>(s, ...a) => (
    s[`border${_}Color`] = some(a, color) ?? 'currentColor',
    s[`border${_}Width`] = some(a, size) ?? '1px',
    s[`border${_}Style`] = some(a, borderStyle) ?? 'solid'
  )),
  
  // outline
  ol: (s, ...a) => (
    s.outlineColor = some(a, color) ?? 'currentColor',
    s.outlineWidth = some(a, size) ?? '1px',
    s.outlineOffset = some(a, size) ?? '1px',
    s.outlineStyle = some(a, borderStyle) ?? 'solid'
  ),
  
  // ring
  ring: (s, w='2px', cl="currentColor", of='2px', ofcl='white') =>
    s.boxShadow = [
      `0 0 0 ${size(of)}`, color(ofcl), ',',
      `0 0 0 calc(${size(w)} + ${size(of)})`, color(cl)
    ].join(' '),

  // inset
  i: (s, v) => s.inset = size(v),
  it: (s, v) => s.top = size(v),
  il: (s, v) => s.left = size(v),
  ib: (s, v) => s.bottom = size(v),
  ir: (s, v) => s.right = size(v),

  // common
  abs: (s) => s.position = 'absolute',
  rel: (s) => s.position = 'relative',
  fix: (s) => s.position = 'fixed',
  stt: (s) => s.position = 'static',
  stc: (s) => s.position = 'sticky',
  d: (s, v) => s.display = display[v] ?? v,
  z: (s, v) => s.zIndex = v,
  bg: (s, c) => s.background = color(c),
  op: (s, v) => s.opacity = v,
  va: (s, v) => s.verticalAlign = v,
  sh: (s, v) => s.boxShadow = shadow(v),
  ov: (s, x, y=x) => (
    s.overflowX = overflow[x] ?? x,
    s.overflowY = overflow[y] ?? y
  ),
  sel: (s, v) => s.userSelect = userSelect[v] ?? v,
  vis: (s, v) => s.visibility = visibility[v] ?? v,
  ptr: (s, v) => (
    v == '-'
    ? s.pointerEvents = 'none'
    : s.cursor = 'pointer'
  ),
  
  // transform
  tr3: (s) => s.transformStyle = 'preserve-3d',
  rot3: (s, x, y, z, r) =>
    append(s, 'transform',
      `rotate3d(${x}, ${y}, ${z}, ${isNaN(+r) ? r : r + 'deg'})`
    ),
  ...Object.fromEntries([
    ['mat', 'matrix'],
    ['mat3', 'matrix3d'],
    ['skw', 'skew'],
    ['skwX', 'skewX'],
    ['skwY', 'skewY'],
    ['scl', 'scale'],
    ['scl3', 'scale3d'],
    ['sclX', 'scaleZ'],
    ['sclY', 'scaleY'],
    ['sclZ', 'scaleZ'],
  ].map(([name, prop]) => [name, (s, ...v) => (
    append(s, 'transform', prop + '(' + v.join(',') + ')')
  )])),
  
  ...Object.fromEntries([
    ['rot', 'rotate'],
    ['rotX', 'rotateX'],
    ['rotY', 'rotateY'],
    ['rotZ', 'rotateZ'],
  ].map(([name, prop]) => [name, (s, ...v) =>
    append(s, 'transform', prop + '(' +
      v.map(v => isNaN(+v) ? v : v + 'deg').join(',')
    + ')')
  ])),
  
  ...Object.fromEntries([
    ['prs', 'perspective'],
    ['tsl', 'translate'],
    ['tsl3', 'translate3d'],
    ['tslX', 'translateX'],
    ['tslY', 'translateY'],
    ['tslZ', 'translateZ'],
  ].map(([name, prop]) => [name, (s, ...v) => (
    append(s, 'transform', prop + '(' + v.map(v => size(v)).join(',') + ')')
  )])),
}));
