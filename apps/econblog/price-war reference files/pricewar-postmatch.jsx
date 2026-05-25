// Post-match analysis — 3 directions.

const MATCH = {
  outcome: 'You win',
  delta: '+$84',
  totalYou: '+$1,420',
  totalOpp: '+$1,336',
  eloDelta: '+18',
  eloFrom: 1248, eloTo: 1266,
  prices: { you: [4.00, 4.00, 4.25, 4.25, 4.00, 4.00, 4.10, 4.25], opp: [4.00, 4.20, 4.20, 4.10, 3.95, 3.95, 4.30, 4.50] },
  cust:   { you: [110, 120, 130, 142, 158, 162, 154, 148], opp: [110, 122, 138, 168, 164, 158, 142, 130] },
};

// little chart
const Chart = ({ youSeries, oppSeries, yLab, w = 600, h = 200, fmt = v => v }) => {
  const all = [...youSeries, ...oppSeries];
  const min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.1 || 1;
  const yLo = min - pad, yHi = max + pad;
  const x = i => (i / (youSeries.length - 1)) * (w - 60) + 36;
  const y = v => h - 28 - ((v - yLo) / (yHi - yLo)) * (h - 60);
  const path = (s) => s.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      {/* gridlines */}
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={36} x2={w - 24} y1={h - 28 - (i / 3) * (h - 60)} y2={h - 28 - (i / 3) * (h - 60)} stroke="#7c7770" strokeWidth=".5" strokeDasharray="3 4" />
      ))}
      {/* x labels */}
      {youSeries.map((_, i) => (
        <text key={i} x={x(i)} y={h - 10} fontFamily="Patrick Hand" fontSize="12" fill="#7c7770" textAnchor="middle">R{i + 1}</text>
      ))}
      {/* y labels */}
      <text x={8} y={20} fontFamily="Patrick Hand" fontSize="11" fill="#7c7770">{fmt(yHi.toFixed(2))}</text>
      <text x={8} y={h - 30} fontFamily="Patrick Hand" fontSize="11" fill="#7c7770">{fmt(yLo.toFixed(2))}</text>
      <text x={8} y={h - 50} fontFamily="Caveat" fontSize="13" fill="#7c7770" transform={`rotate(-90 8 ${h - 50})`}>{yLab}</text>
      {/* lines */}
      <path d={path(oppSeries)} fill="none" stroke="#c84a2c" strokeWidth="2" />
      <path d={path(youSeries)} fill="none" stroke="#1f59c2" strokeWidth="2" />
      {/* dots */}
      {youSeries.map((v, i) => <circle key={`y${i}`} cx={x(i)} cy={y(v)} r="3.5" fill="#1f59c2" />)}
      {oppSeries.map((v, i) => <circle key={`o${i}`} cx={x(i)} cy={y(v)} r="3.5" fill="#c84a2c" />)}
    </svg>
  );
};

// ── A: classic post-match: outcome, charts, key moments, concepts ────
const PostA = () => (
  <>
    <div className="wf-card accent" style={{ padding: 18 }}>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 14 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>Match complete · 8 rounds</div>
          <h1 style={{ fontSize: 52 }}>{MATCH.outcome}.</h1>
          <div className="step-hint" style={{ fontSize: 16 }}>You netted {MATCH.totalYou} to Marina's {MATCH.totalOpp} ({MATCH.delta}).</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-num" style={{ fontSize: 52, color: 'var(--good)' }}>{MATCH.eloDelta}</div>
          <div className="stat-label">Elo · {MATCH.eloFrom} → {MATCH.eloTo}</div>
        </div>
      </div>
      <div className="wf-row" style={{ gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <Btn kind="primary">Rematch</Btn>
        <Btn>New opponent</Btn>
        <Btn kind="ghost">Share recap</Btn>
        <Btn kind="ghost">Back to lobby</Btn>
      </div>
    </div>

    <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
      <div className="wf-card">
        <div className="eyebrow">Prices · 8 rounds</div>
        <Chart youSeries={MATCH.prices.you} oppSeries={MATCH.prices.opp} yLab="$ / cup" fmt={v => `$${v}`} />
        <div className="wf-row" style={{ gap: 14, marginTop: 4 }}>
          <Chip kind="accent">You</Chip>
          <Chip kind="warm">Marina</Chip>
        </div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Customers · 8 rounds</div>
        <Chart youSeries={MATCH.cust.you} oppSeries={MATCH.cust.opp} yLab="customers" />
      </div>
    </div>

    <div className="wf-card" style={{ marginTop: 12 }}>
      <div className="eyebrow">The story</div>
      <p style={{ fontFamily: "'Kalam',cursive", fontSize: 16, lineHeight: 1.5 }}>
        The match turned in <b>round 4</b>: Marina dropped to $3.95 and ran a flash sale, but you held at $4.25 and let your training compound.
        By round 6 your regulars share had climbed to <b>52%</b> — a moat that her price cuts couldn't dent. Her late attempt to raise prices in R7 cost her the customers she'd bought cheaply.
      </p>
    </div>

    <div className="wf-grid cols-3" style={{ marginTop: 12 }}>
      <div className="wf-card good">
        <div className="eyebrow" style={{ color: 'var(--good)' }}>★ Best move</div>
        <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>R3 · Train staff (service)</div>
        <div className="step-hint" style={{ margin: 0 }}>Compounded into +$160 of regulars revenue across R5-R8.</div>
      </div>
      <div className="wf-card warm">
        <div className="eyebrow" style={{ color: 'var(--warm)' }}>⚑ Costly move</div>
        <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700 }}>R7 · Scout opponent</div>
        <div className="step-hint" style={{ margin: 0 }}>$25 spent on intel you couldn't act on. Could've been ad spend.</div>
      </div>
      <div className="wf-card tinted">
        <div className="eyebrow">Concepts in play</div>
        <div className="wf-row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          <Chip kind="ghost">L10 Elasticity</Chip>
          <Chip kind="ghost">L14 Prisoner's dilemma</Chip>
          <Chip kind="ghost">L21 Signaling</Chip>
          <Chip kind="ghost">L108 Labor supply</Chip>
        </div>
      </div>
    </div>
  </>
);

// ── B: timeline-first replay ─────────────────────────────────────────
const PostB = () => {
  const TIMELINE = [
    { r: 1, you: 'Set price $4.00 + ad $40 + train', them: 'Set price $4.00 + hire + supplier↑',  delta: '+$22' },
    { r: 2, you: 'Hold price · loyalty launch',       them: 'Raise to $4.20',                       delta: '+$48' },
    { r: 3, you: 'Lift to $4.25 · train again',       them: 'Hold $4.20 · sponsor event',           delta: '+$140', pivot: true },
    { r: 4, you: 'Hold $4.25',                         them: 'Drop to $3.95 · flash sale',          delta: '+$230', pivot: true },
    { r: 5, you: 'Drop to $4.00 · ads ↑',              them: 'Hold $3.95',                          delta: '+$180' },
    { r: 6, you: 'Hold $4.00 · equip ↑',               them: 'Match $3.95',                         delta: '+$210' },
    { r: 7, you: 'Lift to $4.10 · scout',              them: 'Lift to $4.30 (greedy)',              delta: '+$240' },
    { r: 8, you: 'Lift to $4.25 (endgame)',            them: 'Lift to $4.50',                       delta: '+$350', final: true },
  ];
  return (
    <>
      <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">Match recap</div>
          <h2>You · {MATCH.totalYou} · vs Marina · {MATCH.totalOpp}</h2>
          <div className="step-hint">Elo {MATCH.eloFrom} → <span style={{ color: 'var(--good)' }}>{MATCH.eloTo} ({MATCH.eloDelta})</span></div>
        </div>
        <div className="wf-row" style={{ gap: 8 }}>
          <Btn>Rematch</Btn>
          <Btn kind="primary">Find new opponent</Btn>
        </div>
      </div>

      <div className="wf-card" style={{ marginTop: 12 }}>
        <div className="eyebrow">Round-by-round</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TIMELINE.map((t, i) => (
            <div key={t.r} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr auto', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: i < TIMELINE.length - 1 ? '1px dashed var(--ink-3)' : 'none', background: t.pivot ? 'rgba(31,89,194,.04)' : 'transparent', borderLeft: t.pivot ? '3px solid var(--accent)' : 'none', paddingLeft: t.pivot ? 8 : 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--ink)', background: t.final ? 'var(--good)' : t.pivot ? 'var(--accent)' : '#fffdf6', color: (t.final || t.pivot) ? '#fff' : 'var(--ink)', fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.r}</div>
              <div>
                <div className="eyebrow" style={{ margin: 0, color: 'var(--accent)' }}>You</div>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{t.you}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ margin: 0, color: 'var(--warm)' }}>Marina</div>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{t.them}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 24, color: 'var(--good)' }}>{t.delta}</div>
                <div className="step-hint" style={{ margin: 0 }}>{t.pivot ? '★ pivot' : t.final ? 'final' : 'cum.'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wf-grid cols-2" style={{ marginTop: 12 }}>
        <div className="wf-card">
          <div className="eyebrow">Price trajectory</div>
          <Chart youSeries={MATCH.prices.you} oppSeries={MATCH.prices.opp} yLab="$ / cup" h={170} fmt={v => `$${v}`} />
        </div>
        <div className="wf-card">
          <div className="eyebrow">What you learned</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
            <li>You held price under flash sale → margins held</li>
            <li>Training compounds — R3 invest paid R5-R8</li>
            <li>Scout in R7 was wasted; intel needs runway</li>
          </ul>
          <Btn kind="ghost" style={{ marginTop: 8 }}>Linked lessons →</Btn>
        </div>
      </div>
    </>
  );
};

// ── C: split-screen "trophy" + side concepts ─────────────────────────
const PostC = () => (
  <div className="wf-row" style={{ alignItems: 'flex-start' }}>
    <div className="wf-col" style={{ flex: 1.4 }}>
      <div className="wf-card" style={{ background: 'linear-gradient(180deg, rgba(58,125,68,.10), transparent)', padding: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 28, color: 'var(--good)' }}>🏆</div>
        <h1 style={{ fontSize: 60, lineHeight: 1 }}>Victory</h1>
        <div className="step-hint" style={{ fontSize: 16 }}>You won the price war by <b>$84</b>.</div>
        <div className="wf-row" style={{ justifyContent: 'center', gap: 26, marginTop: 18, flexWrap: 'wrap' }}>
          <div><div className="stat-num">{MATCH.totalYou}</div><div className="stat-label">your profit</div></div>
          <div><div className="stat-num" style={{ color: 'var(--warm)' }}>{MATCH.totalOpp}</div><div className="stat-label">Marina</div></div>
          <div><div className="stat-num" style={{ color: 'var(--good)' }}>{MATCH.eloDelta}</div><div className="stat-label">Elo gained</div></div>
        </div>
        <div className="wf-row" style={{ justifyContent: 'center', gap: 10, marginTop: 18 }}>
          <Btn kind="primary" className="big">Rematch</Btn>
          <Btn className="big">New opponent</Btn>
        </div>
      </div>

      <div className="wf-card">
        <div className="eyebrow">Charts</div>
        <Chart youSeries={MATCH.prices.you} oppSeries={MATCH.prices.opp} yLab="price" h={170} fmt={v => `$${v}`} />
        <div className="wf-row" style={{ gap: 10, marginTop: 4 }}>
          <Chip kind="accent">You</Chip>
          <Chip kind="warm">Marina</Chip>
        </div>
      </div>
    </div>

    <div className="wf-col" style={{ flex: 1 }}>
      <div className="wf-card good">
        <div className="eyebrow" style={{ color: 'var(--good)' }}>★ Best move</div>
        <h4>R3 · Train staff</h4>
        <div className="step-hint">+$160 across R5-R8 from the regulars you kept.</div>
      </div>
      <div className="wf-card warm">
        <div className="eyebrow" style={{ color: 'var(--warm)' }}>⚑ Worst move</div>
        <h4>R7 · Scout (too late)</h4>
        <div className="step-hint">$25 spent; you couldn't react with only one round left.</div>
      </div>
      <div className="wf-card">
        <div className="eyebrow">Economics in play · L = lesson</div>
        <div className="wf-col" style={{ gap: 8, marginTop: 4 }}>
          {[
            { code: 'L10',  name: 'Price elasticity of demand' },
            { code: 'L14',  name: 'Prisoner\'s dilemma' },
            { code: 'L21',  name: 'Signaling' },
            { code: 'L108', name: 'Labor supply curves' },
          ].map(c => (
            <div key={c.code} className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', border: '1.5px dashed var(--ink-3)', borderRadius: 8 }}>
              <div>
                <div className="step-hint" style={{ margin: 0 }}>{c.code}</div>
                <div style={{ fontFamily: "'Kalam',cursive", fontWeight: 700, fontSize: 14 }}>{c.name}</div>
              </div>
              <Btn kind="ghost">Open →</Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

window.PostmatchOptions = [
  { tag: 'A', title: 'Outcome + charts + key moments', why: 'Closest to chess.com analysis. Outcome banner, charts, narrative, concepts.', Body: PostA },
  { tag: 'B', title: 'Round-by-round timeline',          why: 'Replay-style: every round laid out with both moves and profit delta.',     Body: PostB },
  { tag: 'C', title: 'Trophy hero + concept sidebar',    why: 'Celebratory + educational rail. Good for younger learners.',               Body: PostC },
];
