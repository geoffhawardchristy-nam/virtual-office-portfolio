/* ==========================================================================
   1c · LAYOUTS  —  one floor plan per door.
   Everything here is data. Move a desk by changing two numbers.
   ========================================================================== */
const LAYOUTS = {
  hub: {
    name: 'Reception lobby', sub: 'Four doors. Each one is a chapter.',
    room: { w: 30, d: 24, tone: 'cool', windows: { left: true, right: true },
      // only over the places worth lighting, not a full grid
      lights: 'none' },
    spawn: [0, 8.5], exit: null
  },

  evision: {
    name: 'Evision floor', sub: 'Angular, Shopify, and the first real deadlines',
    /* 38 x 32 -> 32 x 28. The back wall row sets the width, so the cubicles,
       the two founder rooms and the meeting room were all tightened to suit. */
    room: { w: 32, d: 28, tone: 'cool', lights: 'none',
      // one over each founder room, two over the meeting room
      windows: { back: [-13.1, -7.3, -1.45, 3.55, 8.65, 13.45],
                 front: [-9, -1.86],                // meeting room, and the lobby stretch
                 size: [3.2, 1.8], y: 2.3 } },
    spawn: [4, 10.5], exit: [4, 14],

    /* Facing the back wall, as before. The bays open onto the strip between
       them and the wall, so the row needs gaps you can actually steer through:
       1.55 leaves 0.71 of play once the hero's 0.84 width is taken out. The
       pods give up the width to pay for it. */
    cubicles: [
      { x: -14.8, z: -10.6, w: 2.4, ry: Math.PI },
      { x: -10.1, z: -10.6, w: 3.55, bays: 2, ry: Math.PI },
      { x: -5.4, z: -10.6, w: 2.4, ry: Math.PI }
    ],

    /* four a side. The three upright runs sit 5.2 apart now instead of 6.9 —
       that is as close as they go before the chairs on facing rows meet. */
    /* runs are 2.2 across now instead of 2.8, and the chairs follow the desk
       edge (seatOff) so nothing floats. The 3-seat run by the meeting room is
       single sided, which is what lets its back go flat against the wall. */
    tables: [
      { x: -12.25, z: -3.15, w: 7.5, d: 2.2, perSide: 4, pinboard: true,
        seatOff: 1.25, proxOff: 2.3, seats: [
        { p: 'ws04', npc: 'npc04', dual: true }, { p: 'ws05' }, {}, {},
        {}, {}, {}, {} ] },
      { x: -12.25, z: 1.45, w: 7.5, d: 2.2, perSide: 4, pinboard: true,
        seatOff: 1.25, proxOff: 2.3, seats: [
        {}, {}, {}, {}, {}, {}, {}, {} ] },
      // west edge on -3.90, the same line as the Co-founder cabin's west edge
      { x: -2.8, z: -0.85, w: 6.8, d: 2.2, ry: Math.PI / 2, perSide: 4, pinboard: true,
        seatOff: 1.25, proxOff: 2.3, seats: [
        {}, {}, {}, {}, {}, {}, {}, {} ] },
      { x: 5.2, z: -0.85, w: 6.8, d: 2.2, ry: Math.PI / 2, perSide: 4, pinboard: true,
        seatOff: 1.25, proxOff: 2.3, seats: [
        {}, {}, {}, {}, {}, {}, {}, {} ] },
      { x: 10.4, z: -0.85, w: 6.8, d: 2.2, ry: Math.PI / 2, perSide: 4, pinboard: true,
        seatOff: 1.25, proxOff: 2.3, seats: [
        {}, {}, {}, {}, {}, {}, {}, {} ] },
      // back flat under the HR desk, three seats facing out into the floor.
      // Left edge lines up with the meeting room's east wall at x -5.5; the
      // right edge stops at -0.5 so the entry lobby stays clear.
      { x: -2.78, z: 7.9, w: 5.45, d: 1.4, ry: Math.PI, perSide: 3, oneSided: true,
        pinboard: true, seatOff: 0.85, proxOff: 1.9, seats: [ {}, {}, {} ] }
    ],

    cabins: [
      { id: 'cofounder', x: -1.45, z: -11.05, w: 4.9, d: 5.9, style: 'director',
        sides: { e: 1, s: 1, w: 1 }, door: 's', label: 'Co-founder', frame: 'light',
        solid: { e: 1, w: 1 }, ac: 1, deskFrac: 0.52 },
      { id: 'founder', x: 3.55, z: -11.05, w: 5.1, d: 5.9, style: 'director',
        sides: { e: 1, s: 1 }, door: 's', label: 'Founder', frame: 'light',
        solid: { e: 1 }, ac: 1, deskFrac: 0.52 },
      { id: 'meeting', x: 11.05, z: -11.05, w: 9.9, d: 5.9, style: 'meeting',
        sides: { s: 1 }, door: 's', label: 'Meeting', frame: 'light', ac: 1, tv: 'e' },
      // 7 wide (was 8) and pushed west so its open side lands on the store's
      // east wall at -12.5. Everything it frees up goes to the entry lobby.
      { id: 'meeting2', x: -9, z: 10.6, w: 7, d: 6.8, style: 'meeting',
        sides: { n: 1, e: 1 }, door: 'n', label: 'Meeting', frame: 'light',
        solid: { e: 1 }, ac: 1 }
    ],

    rooms: [
      { x: -14.25, z: 10.6, w: 3.5, d: 6.8, label: 'Store', kind: 'store',
        omit: { back: true, xpos: true } },
      { x: 9.4, z: 10.6, w: 3.2, d: 6.8, label: 'Server', kind: 'server',
        omit: { back: true } },
      { x: 13.5, z: 10.6, w: 5, d: 6.8, label: 'Store', kind: 'store',
        omit: { back: true, xpos: true, xneg: true } }
    ],

    /* Right of the meeting room, against the front wall: the HR counter runs
       upright (long axis along z) with its counter facing the gate and the
       chairs on the meeting-room side. It stops at z 8.6 so the single table
       sits underneath it — meeting room | chairs | HR, table below. */
    hrdesk: { x: -0.57, z: 11.9, w: 4.2, ry: -Math.PI / 2 },

    // centred on the clear stretch of the right wall (z -8.1 to 7.2)
    // z -1.7 / len 6.8 puts its ends on -5.10 and 1.70, the same line as the
    // three upright runs and the outer ends of benches A and B
    hwbench: [{ x: 15.32, z: -0.85, ry: -Math.PI / 2, len: 6.8, seats: 4 }],

    // ceiling fans over the open floor: one per bench run, one per cubicle.
    // No size given, so each is the same fan the cabins get.
    fans: [
      [-12.25, -3.15], [-12.25, 1.45],
      [-2.8, -0.85], [5.2, -0.85], [10.4, -0.85],
      [-14.8, -10.6], [-10.1, -10.6], [-5.4, -10.6],
      [-2.78, 7.9], [-0.57, 11.9]                     // the HR-side table and the HR desk
    ],   // 0.55 blocker depth is fixed, so pull in off the wall

    acs: [
      // left wall, one over each of the two horizontal bench runs
      { x: -15.6, z: -3.15, ry: Math.PI / 2, y: 3.05 },
      { x: -15.6, z: 1.45, ry: Math.PI / 2, y: 3.05 },
      { x: 15.6, z: -0.85, ry: -Math.PI / 2, y: 3.05 }, // right wall, over the hardware bench
      { x: -1.86, z: 13.7, ry: Math.PI, y: 3.61 }      // front wall, centred on the window
    ],

    npcs: [{ id: 'npc05', x: 3, z: 4, ry: -0.7 }],
    shelf: null,
    whiteboard: { x: -15.85, z: -0.85, ry: Math.PI / 2, s: 0.4, y: 1.39 },
    plaque: null,
    storage: [],
    plants: []
  },

  evision2: {
    name: 'Evision 207', sub: 'The floor Evision moved into',
    /* Same plate as Logieagle: 20.5 x 16. Window wall at the back, one long
       bench under it, two rows of two, and the store and meeting rooms across
       the front. Rows 1 and 3 are one-sided so the aisles stay 1.34 wide. */
    room: { w: 23.68, d: 18.48, tone: 'cool', lights: 'none', windows: { back: true } },
    spawn: [0, 7], exit: [0, 9.24],

    /* Wide and shallow: the desk rows run the full width and touch both side
       walls, with a 5.00 corridor down the middle. Depth is spent on the two
       rows and the rooms, nothing else.
       Rows sit 5.00 apart — two double-sided runs need 4.55 once chairs and
       approach points are counted, so this leaves a 1.54 aisle. */
    tables: [
      // 0.9 deep, pushed right up to the window wall
      { x: 0, z: -8.79, w: 23.68, d: 0.9, perSide: 4, oneSided: true,
        pinboard: true, board: false, monBack: true, seatOff: 1, proxOff: 1.9,
        seats: [ {}, {}, {}, {} ] },

      { x: -7.92, z: -4.5, w: 7.84, d: 1.8, perSide: 3, pinboard: true,
        seatOff: 1.35, proxOff: 2.4,
        seats: [ {}, {}, {}, {}, {}, {} ] },
      { x: 7.92, z: -4.5, w: 7.84, d: 1.8, perSide: 3, pinboard: true,
        seatOff: 1.35, proxOff: 2.4,
        seats: [ {}, {}, {}, {}, {}, {} ] },
      { x: -7.92, z: 0.5, w: 7.84, d: 1.8, perSide: 3, pinboard: true,
        seatOff: 1.35, proxOff: 2.4,
        seats: [ {}, {}, {}, {}, {}, {} ] },
      { x: 7.92, z: 0.5, w: 7.84, d: 1.8, perSide: 3, pinboard: true,
        seatOff: 1.35, proxOff: 2.4,
        seats: [ {}, {}, {}, {}, {}, {} ] }
    ],

    /* Back to the proportions it had before, carried up with the room's 5%.
       Still turned a quarter so its door lands on its east face, which is why
       its w and d read swapped. */
    rooms: [
      { x: -7.92, z: 6.51, w: 5.46, d: 7.84, ry: Math.PI / 2, label: 'Store',
        kind: 'store', omit: { back: true, xneg: true } }
    ],

    cabins: [
      { id: 'meeting', x: 7.92, z: 6.51, w: 7.84, d: 5.46, style: 'meeting',
        sides: { n: 1, w: 1 }, door: 'w', label: 'Meeting', frame: 'light' }
    ],

    cubicles: [], bathrooms: [], hwbench: [],

    // on the side walls, plus one at the meeting room's far end
    acs: [
      { x: -11.72, z: -2, ry: Math.PI / 2, y: 3.05 },
      { x: 11.72, z: -2, ry: -Math.PI / 2, y: 3.05 },
      { x: 11.72, z: 6.51, ry: -Math.PI / 2, y: 3.05 }
    ],

    fans: [
      [-7.92, -4.5], [7.92, -4.5], [-7.92, 0.5], [7.92, 0.5]
    ],

    npcs: [], shelf: null, whiteboard: null, plaque: null, hrdesk: null
  },

  logieagle: {
    name: 'Logieagle floor', sub: 'Four products, one frontend, three teammates',
    theme: 'logieagle',
    /* another 30% off: 29 x 22.5 -> 20.5 x 16. Rooms, tables, rigs and props
       scaled with it; chairs, monitors and people stay at human scale. */
    room: { w: 20.5, d: 16, windows: { back: true } },
    spawn: [7.65, 6.3], exit: [7.65, 8],

    /* still 4 seats a side. Table 2 (right) and table 3 (left) share z = 0. */
    tables: [
      { x: 6.75, z: -5, w: 7, d: 2.3, seats: [                        // table 1, right, far
        { p: 'ws01', npc: 'npc02', dual: true }, { p: 'ws02' }, {}, {}, {}, {}, {}, {} ] },
      { x: 6.75, z: 0, w: 7, d: 2.3, seats: [                         // table 2, right, near
        { p: 'ws03', npc: 'npc01' }, { p: 'ws06' }, {}, {}, {}, {}, {}, {} ] },
      { x: -6.75, z: 0, w: 7, d: 2.3, endStore: 'right', seats: [      // table 3, left wall
        { npc: 'npc03' }, {}, {}, {}, {}, {}, {}, {} ] }
    ],

    cabins: [
      { id: 'director', x: -6.8, z: -5.8, w: 7.1, d: 4.4, style: 'director',
        sides: { e: 1, s: 1 }, door: 'e', label: 'Director', ac: true },
      { id: 'meeting', x: -6.8, z: 5.8, w: 7.1, d: 4.4, style: 'briefing',
        sides: { n: 1 }, door: 'n', label: 'Meeting', ac: true, whiteTop: true }
    ],

    bathrooms: [
      { x: -1.725, z: 5.8, w: 3.05, d: 4.4, ry: Math.PI, label: 'Men', basin: 'left' },
      { x: 1.325, z: 5.8, w: 3.05, d: 4.4, ry: Math.PI, label: 'Ladies', basin: 'right', omit: ['right'] }
    ],

    logoPanel: { x: 2.97, y: 1.85, z: 5.8, ry: Math.PI / 2, w: 2.6 },   // clear of the 2.93 wall face

    desks: [],
    npcs: [],
    whiteboard: { x: -6.8, z: 7.88, ry: Math.PI, s: 1 },   // was 0.7, never applied
    plaque: null,
    caboodh: [{ x: 4.25, z: 7.64, ry: Math.PI, w: 2.8, h: 3.7 }],   // runs from the washroom wall to the gate jamb
    shelves: [{ x: 8.2, z: 3.6, ry: 0, len: 3.1, bays: 3, levels: 4 }],
    wallDecor: [],
    overhead: [{ x: -5.3, z: 0, ry: 0, w: 0.8 }],
    rigs: [[6.75, -5, 5, 3], [6.75, 0, 5, 3], [-6.75, 0, 5, 3]],
    fans: [],
    tv: { x: 10.13, z: -2.5, ry: -Math.PI / 2, w: 2.2, h: 1.26, y: 1.66, big: true },
    switches: [{ x: 10.15, z: 2.5, ry: -Math.PI / 2, y: 1.25, gangs: 6 }],
    acs: [
      { x: 10.13, z: 0, ry: -Math.PI / 2, y: 3.15 },      // right wall, over table 2
      { x: 10.13, z: -5, ry: -Math.PI / 2, y: 3.15 },     // right wall, over table 1
      { x: -10.13, z: 0, ry: Math.PI / 2, y: 3.15 }       // left wall, over table 3
    ],
    credenzas: [],
    storage: [],
    plants: []
  }

/* ===== LAYOUTS for the parked doors — uncomment together with DOORS above ===
  independent: {
    name: 'The studio', sub: 'One desk, one product, nobody to ask',
    room: { w: 20, d: 15, tone: 'warm', windows: { back: true, left: true } },
    spawn: [0, 5], exit: [0, 7.5],
    desks: [
      { p: 'side', x: -4, z: -3.4, dual: true, screen: 'charts', side: true }
    ],
    npcs: [],
    lounge: { x: 3.6, z: 1.2, laptop: true },
    coffee: { x: -6.5, z: -6.6 },
    plaque: { x: 9.6, z: -1.5, ry: -Math.PI / 2 },
    storage: [],
    plants: [[8.8, 5.6, 'tree', 1.05], [-8.8, 4.6, 'leaf', 0.95], [1.5, -6.4, 'leaf', 0.9]]
  },

  vacant: {
    name: 'The empty office', sub: 'Set up, powered on, unoccupied',
    room: { w: 22, d: 16, tone: 'bright', windows: { back: true, right: true, left: true } },
    spawn: [0, 5.5], exit: [0, 8],
    desks: [
      { p: 'vacancy', x: 0, z: -3.4, screen: 'code', vacant: true }
    ],
    npcs: [],
    contact: { x: 0, z: -7.6 },
    plaque: { x: -9.6, z: 1.5, ry: Math.PI / 2 },
    storage: [],
    plants: [[-9, -6.4, 'tree', 1.05], [9, -6.4, 'tree', 1.05], [9, 5.8, 'leaf', 0.95], [-9, 5.8, 'leaf', 0.95]]
  }
   ========================================================================= */
};

/* ==========================================================================
   Evision at 90%
   The floor plate and everything standing on it shrink together. Only
   horizontal figures move — positions, footprints, desk runs, approach
   offsets. Heights stay put, because wall height, chairs, monitors and
   people are all built at fixed human scale and must not follow.
   ========================================================================== */
(function shrinkEvision(k) {
  const L = LAYOUTS.evision;
  const HORIZ = ['x', 'z', 'w', 'd', 'len', 'seatOff', 'proxOff', 's'];
  const SKIP  = ['y', 'ry', 'bays', 'seats', 'perSide', 'levels', 'gangs'];

  const walk = (o) => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    Object.keys(o).forEach(f => {
      if (SKIP.indexOf(f) >= 0) return;
      if (typeof o[f] === 'number') { if (HORIZ.indexOf(f) >= 0) o[f] *= k; }
      else if (typeof o[f] === 'object') walk(o[f]);
    });
  };
  ['cubicles', 'tables', 'cabins', 'rooms', 'hwbench', 'npcs', 'acs',
   'bathrooms', 'lockers', 'shelves', 'credenzas', 'caboodh',
   'room', 'hrdesk', 'whiteboard', 'tv', 'shelf', 'plaque'
  ].forEach(key => { if (L[key]) walk(L[key]); });

  // bare number arrays the walker cannot tell apart from counts
  ['spawn', 'exit'].forEach(key => {
    if (L[key]) L[key] = L[key].map(v => v * k);
  });
  // fans are [x, z, span] and rigs [x, z, w, d] — scale the positions, not the span
  (L.fans || []).forEach(f => { f[0] *= k; f[1] *= k; });
  (L.rigs || []).forEach(r => { for (let i = 0; i < 4; i++) r[i] *= k; });
  const wnd = L.room && L.room.windows;
  if (wnd) {
    ['back', 'front', 'left', 'right'].forEach(side => {
      if (Array.isArray(wnd[side])) wnd[side] = wnd[side].map(v => v * k);
    });
    if (Array.isArray(wnd.size)) wnd.size[0] *= k;   // width only; height stays
  }
})(0.9);
const TIERS = {
  silver:   { base: 0xC3CBD6, glow: 0x8FA6BF, metal: 0.85, rough: 0.28, css: '#C8D0DA' },
  gold:     { base: 0xE0A233, glow: 0xF5A524, metal: 0.9,  rough: 0.24, css: '#F5A524' },
  platinum: { base: 0xD9E6EE, glow: 0x9FE7F5, metal: 0.92, rough: 0.16, css: '#9FE7F5' },
  diamond:  { base: 0xB9A7FF, glow: 0xC9B8FF, metal: 0.55, rough: 0.08, css: '#B9A7FF' }
};
