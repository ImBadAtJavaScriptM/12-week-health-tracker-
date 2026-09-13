export const DEFAULT_START = '2026-09-14';
export const PROGRAM_WEEKS = 12;

const DAY = 86400000;

export function toLocalDate(iso) {
  const [y,m,d] = iso.split('-').map(Number);
  return new Date(y, m-1, d);
}

export function isoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

export function dayDiff(dateISO, startISO = DEFAULT_START) {
  const a = toLocalDate(startISO);
  const b = toLocalDate(dateISO);
  return Math.floor((b - a) / DAY);
}

export function weekNumber(dateISO, startISO = DEFAULT_START) {
  const diff = dayDiff(dateISO, startISO);
  if (diff < 0 || diff >= PROGRAM_WEEKS * 7) return null;
  return Math.floor(diff / 7) + 1;
}

export function phaseNumber(dateISO, startISO = DEFAULT_START) {
  const w = weekNumber(dateISO, startISO);
  if (!w) return null;
  if (w <= 4) return 1;
  if (w <= 8) return 2;
  return 3;
}

export function phaseLabel(phase) {
  return ({1:'Foundation',2:'Build',3:'Performance / Maintenance'})[phase] || 'Pre-program';
}

export function dateForProgramDay(dayIndex, startISO = DEFAULT_START) {
  const d = toLocalDate(startISO);
  d.setDate(d.getDate() + dayIndex);
  return isoDate(d);
}

export function programEnd(startISO = DEFAULT_START) {
  return dateForProgramDay(PROGRAM_WEEKS*7 - 1, startISO);
}

export const pelvicFloorDetails = {
  1: '3 sessions/day. Each session: 10 slow contractions with 5-second holds, 10 quick contractions, and 10 deliberate relaxation/reverse-Kegel reps. Do not train during urination.',
  2: '3 sessions/day. Each session: 10 slow holds of 8–10 seconds while breathing normally, plus quick contractions and deliberate relaxation/reverse-Kegel work. Include standing and lying positions across the day.',
  3: 'Maintain the Phase 2 routine at 3 sessions/day; do not escalate volume. Reduce or stop and seek medical guidance if pain or urinary symptoms develop.'
};

const dailyBase = [
  {id:'sleep', label:'Sleep 7–9 hours', group:'am'},
  {id:'wake', label:'Consistent wake time', group:'am'},
  {id:'pelvic', label:'Pelvic-floor wellness — 3 sessions', group:'pm'},
  {id:'beet', label:'Beetroot + leafy greens habit', group:'pm'},
  {id:'moisturize', label:'Unscented moisturizer after shower', group:'pm'}
];

export function scheduleForDate(dateISO, startISO = DEFAULT_START, options = {}) {
  const w = weekNumber(dateISO, startISO);
  const phase = phaseNumber(dateISO, startISO);
  if (!w) return {week:null, phase:null, tasks:[], title:'Outside program'};
  const day = toLocalDate(dateISO).getDay(); // Sun 0 Mon 1
  const tasks = dailyBase.map(t => ({...t, required:true}));
  const cardio = (label, type, min, max, optional=false) => tasks.push({id:'cardio', label, group:'pm', required:!optional, optional, type, min, max});
  const strength = () => tasks.push({id:'strength', label:'Strength training — compound lifts, include lower body', group:'pm', required:true});

  if (phase === 1) {
    if ([1,3,4,6].includes(day)) cardio('Zone 2 cardio — 30–40 min (conversational pace)', 'Zone 2', 30, 40);
    if ([1,3,5].includes(day)) strength();
  } else {
    if ([1,3,5,6].includes(day)) cardio('Zone 2 cardio — 45–50 min (conversational pace)', 'Zone 2', 45, 50);
    if (day === 2) cardio('HIIT — 8 × 30 sec hard / 90 sec easy', 'HIIT', 16, 16);
    if (day === 0) cardio('Optional Zone 2 — 45–50 min or rest', 'Zone 2', 45, 50, true);
    if ([1,3,5].includes(day)) strength();
    if (options.proteinTargetEnabled !== false) tasks.push({id:'protein', label:'Protein target — 1.6 g/kg', group:'pm', required:false, optional:true});
    tasks.push({id:'breathing', label:'Slow diaphragmatic breathing / recovery', group:'pm', required:false, optional:true});
  }

  if (day === 1) {
    tasks.push({id:'weight', label:'Bodyweight measurement', group:'am', required:false, optional:true});
    tasks.push({id:'waist', label:'Waist measurement', group:'am', required:false, optional:true});
  }
  if (day === 5) tasks.push({id:'weight', label:'Bodyweight measurement', group:'am', required:false, optional:true});
  if (day === 6) {
    tasks.push({id:'trim', label:'Weekly trim — about 6 mm', group:'pm', required:false, optional:true});
    tasks.push({id:'exfoliate', label:'Gentle exfoliation', group:'pm', required:false, optional:true});
    tasks.push({id:'hygiene', label:'Weekly hygiene check / thorough wash and dry', group:'pm', required:false, optional:true});
  }
  if (day === 0) tasks.push({id:'review', label:'Weekly review', group:'pm', required:false, optional:true});

  return {week:w, phase, tasks, title:`Week ${w} · ${phaseLabel(phase)}`};
}

export function proteinTargetKg(weightKg) {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
  return Math.round(weightKg * 1.6);
}

export function phaseDates(phase, startISO = DEFAULT_START) {
  const startDay = (phase-1)*28;
  return { start: dateForProgramDay(startDay, startISO), end: dateForProgramDay(startDay+27, startISO) };
}

export function formatShort(iso) {
  return toLocalDate(iso).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}
