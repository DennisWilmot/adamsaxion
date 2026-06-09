// Margin — motion demo. Plays the round lifecycle so you can FEEL the
// motion choices: decide → lock → reveal → report. Every animation maps to
// information (see the live annotation under the stage). Reuses mt-kit atoms.

// motion-only styles
if (typeof document !== 'undefined' && !document.getElementById('mt-motion-styles')) {
  const s = document.createElement('style');
  s.id = 'mt-motion-styles';
  s.textContent = `
    @keyframes mtq-up   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
    @keyframes mtq-pop  { from { opacity:0; transform:scale(.82); }       to { opacity:1; transform:none; } }
    @keyframes mtq-inL  { from { opacity:0; transform:translateX(-18px);} to { opacity:1; transform:none; } }
    @keyframes mtq-inR  { from { opacity:0; transform:translateX( 22px);} to { opacity:1; transform:none; } }
    @keyframes mtq-flip { from { opacity:0; transform:translateY(60%);}    to { opacity:1; transform:none; } }
    @keyframes mtq-pulse{ 0%,100%{ box-shadow:0 0 0 0 rgba(21,128,61,.0);} 50%{ box-shadow:0 0 0 5px rgba(21,128,61,.16);} }
    @keyframes mtq-shim { 0%{ background-position:-160px 0; } 100%{ background-position:220px 0; } }
    @keyframes mtq-glow { 0%,100%{ box-shadow:0 0 0 0 rgba(10,82,196,0);} 35%{ box-shadow:0 0 0 4px rgba(10,82,196,.22);} }
    @keyframes mtq-shake{ 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
    @keyframes mtq-dots { 0%{opacity:.25;} 50%{opacity:1;} 100%{opacity:.25;} }
    @keyframes mtq-breathe{ 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.05);} }
    .mtq-up{animation:mtq-up .5s cubic-bezier(.2,.7,.3,1) both;}
    .mtq-pop{animation:mtq-pop .42s cubic-bezier(.4,1.5,.5,1) both;}
    .mtq-inL{animation:mtq-inL .5s cubic-bezier(.2,.7,.3,1) both;}
    .mtq-inR{animation:mtq-inR .5s cubic-bezier(.2,.7,.3,1) both;}
    .mtq-flip{animation:mtq-flip .55s cubic-bezier(.2,.7,.3,1) both;}
    .mtq-pulse{animation:mtq-pulse 1.8s ease-in-out infinite;}
    .mtq-glow{animation:mtq-glow 1.4s ease-in-out;}
    .mtq-shim{ background:linear-gradient(90deg,#e9edf3 0%,#f3f6fa 50%,#e9edf3 100%); background-size:240px 100%; animation:mtq-shim 1.1s linear infinite; }
    .mtq-dot{animation:mtq-dots 1.1s ease-in-out infinite;}
    .mtq-dot:nth-child(2){animation-delay:.18s;} .mtq-dot:nth-child(3){animation-delay:.36s;}
    .mtq-breathe{ animation:mtq-breathe 3.6s ease-in-out infinite; transform-origin:50% 64%; }
    @media (prefers-reduced-motion: reduce){
      .mtq-up,.mtq-pop,.mtq-inL,.mtq-inR,.mtq-flip,.mtq-glow{animation:none!important;}
      .mtq-pulse,.mtq-shim,.mtq-dot,.mtq-breathe{animation:none!important;}
    }
  `;
  document.head.appendChild(s);
}

// count-up hook — runs when `run` flips true; cubic ease-out
function useCountUp(target, run, dur = 850, delay = 0) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!run) { setV(0); return; }
    let raf, t0; const start = performance.now() + delay;
    const tick = (t) => {
      if (t < start) { raf = requestAnimationFrame(tick); return; }
      const p = Math.min(1, (t - start) / dur);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, dur, delay]);
  return v;
}

const Num = ({ v, prefix = '', suffix = '', dec = 0, size, color, sign }) => {
  const r = dec ? v.toFixed(dec) : Math.round(v).toLocaleString();
  return <span className="mono" style={{ fontSize: size, color: color || 'inherit', fontWeight: 600 }}>{sign && v > 0 ? '+' : ''}{prefix}{r}{suffix}</span>;
};

const PHASES = ['decide', 'lock', 'reveal', 'report'];
const PHASE_LABEL = { decide: 'Decide', lock: 'Lock', reveal: 'Reveal', report: 'Report' };
const PHASE_NOTE = {
  decide: 'Panels fade-up in reading order; domain chips pop staggered. The motion says “read me first, these are your levers.”',
  lock:   'Your card stamps Locked; the opponent shifts from a shimmering “Thinking…” (unknown) to a green pulse (state changed). Nothing else moves — the wait is the point.',
  reveal: 'Hidden prices flip up simultaneously and capacity bars fill from zero — you watch capacity get used. Both sides resolve at the same instant: a sealed bid.',
  report: 'The payoff. Cash delta rolls 0→+$54, customers count up, stars fill, news slides in, narrative fades last — feel the number before you read why.',
};

function Stage({ phase }) {
  const reveal = phase === 'reveal' || phase === 'report';
  const report = phase === 'report';
  const locked = phase !== 'decide';

  const delta = useCountUp(54, report, 850, 120);
  const total = useCountUp(554, report, 950, 120);
  const custs = useCountUp(45, report, 800, 220);
  const stars = useCountUp(3.8, report, 800, 320);
  const oppDelta = useCountUp(79, report, 900, 120);

  const capYou = reveal ? 71 : 0;
  const capOpp = reveal ? 62 : 0;

  return (
    <div className="mt" style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      {/* LEFT — your move */}
      <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="mtq-up" style={{ animationDelay: '0ms', display: 'flex', gap: 11, padding: '13px 15px', background: T.coach, border: `1px solid ${T.coachLine}`, borderRadius: 14 }}>
          <div style={{ flex: '0 0 auto' }}><AvCoach size={38} className="mtq-breathe" /></div>
          <div><Eyebrow style={{ color: T.coachInk, opacity: .8 }}>Prof. Aldo · Coach</Eyebrow>
            <div className="serif" style={{ fontSize: 15.5, lineHeight: 1.32, fontStyle: 'italic', color: '#3a3413', marginTop: 3, fontWeight: 500 }}>“Steady the line before you stretch it again.”</div></div>
        </div>

        <div className="mtq-up" style={{ animationDelay: '90ms', background: T.card, border: `1px solid ${T.rule}`, borderRadius: 16, padding: 16 }}>
          <Eyebrow>Domains · Round 2</Eyebrow>
          <h2 className="serif" style={{ fontSize: 23, color: T.ink, margin: '4px 0 13px', fontWeight: 600 }}>What will you do?</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.keys(T.d).map((k, i) => (
              <div key={k} className="mtq-pop" style={{ animationDelay: `${160 + i * 55}ms` }}>
                <DomainChip dk={k} selected={k === 'ops'} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 13 }}>
            {[['Upgrade equipment', '+capacity · −$80', true], ['Perform maintenance', '+uptime · −$30'], ['Start R&D project', '+quality · −$120'], ['Activate overtime', '+capacity · −$45/rd']].map((m, i) => (
              <div key={i} className="mtq-inL" style={{ animationDelay: `${320 + i * 70}ms` }}>
                <MoveTile dk="ops" name={m[0]} meta={m[1]} selected={m[2]} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CENTER — arena + moves to lock */}
      <div style={{ width: 392, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* head to head */}
        <div style={{ background: T.paper2, border: `1px solid ${T.rule}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
            <Eyebrow>Head to head</Eyebrow>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: T.card, border: `1px solid ${T.rule}` }}>
              <span className={phase === 'decide' || phase === 'lock' ? 'mtq-pulse' : ''} style={{ width: 6, height: 6, borderRadius: 99, background: reveal ? T.green : T.blue, display: 'block' }} />
              <span className="mono" style={{ fontSize: 12, color: T.ink2 }}>{reveal ? 'revealed' : '0:42'}</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* opponent */}
            <ArenaSide av={<AvOpp size={42} className="mtq-breathe" style={{ animationDelay: '-1.3s' }} />} name="Morgan" you={false}
              status={reveal ? 'locked' : 'thinking'} price={450} cap={capOpp} reveal={reveal} win={false} />
            <div style={{ width: 1, background: T.rule, position: 'relative' }}>
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: T.paper2, padding: '2px 0', fontSize: 11, fontWeight: 700, color: T.ink4, letterSpacing: '.1em' }}>VS</span>
            </div>
            {/* you */}
            <ArenaSide av={<AvPlayer size={42} className="mtq-breathe" style={{ animationDelay: '-2.5s' }} />} name="You" you
              status={locked ? 'locked' : 'thinking'} price={450} cap={capYou} reveal={reveal} win={report} />
          </div>
        </div>

        {/* moves to lock + commit */}
        <div className="mtq-up" style={{ animationDelay: '460ms', background: T.card, border: `1px solid ${T.rule}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Eyebrow>Moves to lock</Eyebrow><span className="mono" style={{ fontSize: 12, color: T.ink3, whiteSpace: 'nowrap' }}>3 / 3 slots</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <LockRow dk="product" name="Simplify menu" meta="1 unit" />
            <LockRow dk="sales" name="Surge pricing" meta="enabled this round" />
            <LockRow dk="ops" name="Upgrade equipment" meta="enabled this round" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '13px 0', paddingTop: 12, borderTop: `1px dashed ${T.rule}` }}>
            <Eyebrow>Cost this round</Eyebrow>
            <span className="mono" style={{ fontSize: 13, color: T.ink2 }}><Cash v={-80} size={13} color={T.ink} /> · after <Cash v={474} size={13} color={T.ink} /></span>
          </div>
          {!locked ? (
            <Btn kind="primary" size="lg" full>Review and lock →</Btn>
          ) : (
            <div className="mtq-pop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '12px', borderRadius: 999, background: T.greenSoft, border: `1px solid #bfe6cc`, color: T.green, fontWeight: 700, fontSize: 14.5 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Locked — 3 moves committed
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — turn log */}
      <div style={{ width: 330 }}>
        <div style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 16, padding: 16, minHeight: 360 }}>
          <Eyebrow>Turn log</Eyebrow>
          <div style={{ height: 2, background: T.ink, margin: '8px 0 14px' }} />
          {report ? (
            <>
              <div className="mtq-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 className="serif" style={{ fontSize: 26, color: T.ink, fontWeight: 700, whiteSpace: 'nowrap' }}>Turn 1</h2>
                <Num v={delta} prefix="$" sign size={24} color={T.green} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0 14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.ink2, fontWeight: 600 }}><Cup size={15} c={T.ink2} /><Num v={custs} /> served</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.ink2 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#eab308"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 23l-6 -2.6 1.4-6.8L2.3 9l6.9-.7z"/></svg>
                  <Num v={stars} dec={1} />
                </span>
              </div>
              <div className="mtq-inR" style={{ animationDelay: '120ms', display: 'flex', gap: 9, background: T.paper2, border: `1px solid ${T.rule}`, borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: '#eab308', marginTop: 4, flex: '0 0 auto' }} />
                <div style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.45 }}><b style={{ color: T.ink }}>News:</b> A big office order is up for grabs. Extra cash if you have the capacity.</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="mtq-up" style={{ animationDelay: '220ms', flex: 1, border: `1.5px solid ${T.blueLine}`, background: T.blueSoft, borderRadius: 11, padding: '10px 12px' }}>
                  <Eyebrow style={{ color: T.blue }}>You</Eyebrow><div style={{ marginTop: 3 }}><Num v={delta} prefix="$" sign size={21} color={T.green} /></div>
                </div>
                <div className="mtq-up" style={{ animationDelay: '300ms', flex: 1, border: `1px solid ${T.rule}`, background: T.card, borderRadius: 11, padding: '10px 12px' }}>
                  <Eyebrow>Morgan</Eyebrow><div style={{ marginTop: 3 }}><Num v={oppDelta} prefix="$" sign size={21} color={T.green} /></div>
                </div>
              </div>
              <div style={{ marginTop: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: `1px dashed ${T.rule}` }}>
                <Eyebrow>Cash on hand</Eyebrow><Num v={total} prefix="$" size={20} color={T.ink} />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 188, gap: 8, color: T.ink3, textAlign: 'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.ink4} strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/></svg>
              <div style={{ fontSize: 13, maxWidth: 240, lineHeight: 1.4 }}>The round report appears here after both players reveal.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArenaSide({ av, name, you, status, price, cap, reveal, win }) {
  return (
    <div className={'mt' + (win ? ' mtq-glow' : '')} style={{ flex: 1, padding: 6, borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {av}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{name}</span>
            {you && <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em', color: T.blue, background: T.blueSoft, padding: '2px 5px', borderRadius: 4 }}>YOU</span>}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', color: status === 'locked' ? T.green : T.ink3 }}>
            {status === 'locked'
              ? '● Locked in'
              : <span>○ Thinking<span className="mtq-dot">.</span><span className="mtq-dot">.</span><span className="mtq-dot">.</span></span>}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 11, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div><Eyebrow>Their price</Eyebrow>
          <div style={{ marginTop: 2, height: 30, overflow: 'hidden' }}>
            {reveal
              ? <span className="mtq-flip" style={{ display: 'inline-block' }}><Price v={price} size={27} color={T.ink} /></span>
              : <span className="mono" style={{ fontSize: 27, color: T.ink4, fontWeight: 600, letterSpacing: '.1em' }}>— —</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}><Eyebrow>Capacity</Eyebrow><div className="mono" style={{ fontSize: 14, marginTop: 2, color: T.ink2 }}>{reveal ? cap + '%' : '·'}</div></div>
      </div>
      <div style={{ marginTop: 7, height: 6, borderRadius: 99, background: T.ruleSoft, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: cap + '%', background: you ? T.blue : T.ink4, borderRadius: 99, transition: 'width .9s cubic-bezier(.2,.7,.3,1)' }} />
      </div>
    </div>
  );
}

function MotionDemo() {
  const [phase, setPhase] = React.useState('decide');
  const [playKey, setPlayKey] = React.useState(0);
  const [auto, setAuto] = React.useState(true);
  const timers = React.useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const play = () => {
    clearTimers(); setAuto(true); setPhase('decide'); setPlayKey(k => k + 1);
    timers.current.push(setTimeout(() => setPhase('lock'), 1900));
    timers.current.push(setTimeout(() => setPhase('reveal'), 3600));
    timers.current.push(setTimeout(() => setPhase('report'), 5200));
  };
  React.useEffect(() => { play(); return clearTimers; }, []);

  const jump = (p) => { clearTimers(); setAuto(false); setPhase(p); setPlayKey(k => k + 1); };

  return (
    <div className="mt" style={{ width: 1160, maxWidth: '100%', margin: '0 auto', padding: '8px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>Margin · motion study</Eyebrow>
          <h1 className="serif" style={{ fontSize: 28, color: T.ink, fontWeight: 700, marginTop: 4 }}>A round, in motion</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', gap: 2, padding: 3, background: T.paper2, border: `1px solid ${T.rule}`, borderRadius: 999 }}>
            {PHASES.map(p => (
              <button key={p} onClick={() => jump(p)} className="mt-press" style={{
                padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: phase === p ? T.card : 'transparent', color: phase === p ? T.ink : T.ink3,
                boxShadow: phase === p ? `inset 0 0 0 1px ${T.rule}` : 'none',
              }}>{PHASE_LABEL[p]}</button>
            ))}
          </div>
          <Btn kind="primary" size="md" onClick={play}>↻ Replay</Btn>
        </div>
      </div>

      <div key={playKey} style={{ background: 'linear-gradient(180deg,#e9eef5,#eef1f6 90px)', border: `1px solid ${T.rule}`, borderRadius: 20, padding: 18 }}>
        <Stage phase={phase} />
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 11, alignItems: 'flex-start', padding: '12px 15px', background: T.card, border: `1px solid ${T.rule}`, borderRadius: 13 }}>
        <span style={{ flex: '0 0 auto', marginTop: 1, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.blue, background: T.blueSoft, padding: '3px 8px', borderRadius: 6 }}>{PHASE_LABEL[phase]}</span>
        <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.5 }}><b style={{ color: T.ink }}>What the motion conveys —</b> {PHASE_NOTE[phase]}</div>
      </div>
    </div>
  );
}

Object.assign(window, { MotionDemo });
