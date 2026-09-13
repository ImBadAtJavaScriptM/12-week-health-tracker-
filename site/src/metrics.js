export function taskCompletion(entry, schedule) {
  if (!schedule?.tasks?.length) return 0;
  const checks = entry?.taskStates || {};
  const required = schedule.tasks.filter(t=>t.required);
  if (!required.length) return 0;
  const done = required.filter(t=>checks[t.id] === true || inferredDone(t.id, entry)).length;
  return Math.round((done/required.length)*100);
}

function inferredDone(id,e={}) {
  if (id==='sleep') return Number(e.sleepHours)>0;
  if (id==='wake') return !!e.wakeConsistency;
  if (id==='cardio') return !!e.cardioDone;
  if (id==='strength') return !!e.strengthDone;
  if (id==='pelvic') return Number(e.pelvicFloorSessionsCompleted)>=3;
  return false;
}

export function weeklyMetrics(entries, scheduleFn) {
  const byWeek={};
  for (const [date,e] of Object.entries(entries||{})) {
    const sched=scheduleFn(date); if (!sched.week) continue;
    const w=sched.week; byWeek[w] ||= {days:0, sleep:[], cardio:0, strengthPlanned:0, strengthDone:0, adherence:[]};
    const m=byWeek[w]; m.days++;
    if (Number(e.sleepHours)>0) m.sleep.push(Number(e.sleepHours));
    if (e.cardioDone) m.cardio += Number(e.cardioMinutes)||0;
    if (sched.tasks.some(t=>t.id==='strength')) m.strengthPlanned++;
    if (e.strengthDone) m.strengthDone++;
    m.adherence.push(taskCompletion(e,sched));
  }
  for (const m of Object.values(byWeek)) {
    m.avgSleep = m.sleep.length ? m.sleep.reduce((a,b)=>a+b,0)/m.sleep.length : 0;
    m.sleepTargetPct = m.sleep.length ? Math.round(100*m.sleep.filter(x=>x>=7&&x<=9).length/m.sleep.length) : 0;
    m.strengthPct = m.strengthPlanned ? Math.round(100*m.strengthDone/m.strengthPlanned) : 0;
    m.adherencePct = m.adherence.length ? Math.round(m.adherence.reduce((a,b)=>a+b,0)/m.adherence.length) : 0;
  }
  return byWeek;
}
