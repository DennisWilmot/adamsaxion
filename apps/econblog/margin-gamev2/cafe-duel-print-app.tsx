// Print-only app — renders every screen sequentially on its own print page.

interface PrintSlide { id: string; label: string; w: number; h: number; node: React.ReactNode; }

const PRINT_SLIDES: PrintSlide[] = [
  { id: 'lobby',        label: '01 · Lobby',                       w: 1320, h: 900,  node: <CafeLobby /> },
  { id: 'scenario',     label: '02 · Scenario select',             w: 1180, h: 1040, node: <CafeScenario /> },
  { id: 'queue',        label: '03 · Matchmaking',                 w: 1180, h: 900,  node: <CafeQueue /> },
  { id: 'briefing',     label: '04 · Briefing · opponent reveal',  w: 1320, h: 1000, node: <CafeBriefing /> },
  { id: 'rematch',      label: '05 · Rematch · awaiting accept',   w: 1180, h: 920,  node: <CafeRematch /> },
  { id: 'decide',       label: '06 · Decide · inline cards',       w: 1360, h: 1280, node: <CafeDecide /> },
  { id: 'review-modal', label: '07 · Review &amp; lock · modal (A)', w: 1180, h: 760,  node: <CafeReviewModal /> },
  { id: 'review-inline',label: '08 · Review &amp; lock · inline (B)', w: 1360, h: 800,  node: <CafeReviewInline /> },
  { id: 'locked',       label: '09 · Locked · waiting',            w: 1180, h: 1080, node: <CafeLocked /> },
  { id: 'report',       label: '10 · Round report (slim)',         w: 1320, h: 580,  node: <CafeReport /> },
  { id: 'forfeit',      label: '11 · Forfeit · confirm',           w: 1180, h: 760,  node: <CafeForfeit /> },
  { id: 'undo',         label: '12 · Unlock &amp; revise',         w: 1180, h: 720,  node: <CafeUndo /> },
  { id: 'austerity',    label: '13 · Austerity · A · banner',      w: 1360, h: 1000, node: <CafeAusterity /> },
  { id: 'austerity-calm',label: '14 · Austerity · B · calm strip', w: 1360, h: 1000, node: <CafeAusterityCalm /> },
  { id: 'bankruptcy',   label: '15 · Bankruptcy · A · dramatic',   w: 1180, h: 1000, node: <CafeBankruptcy /> },
  { id: 'bankruptcy-clinical', label: '16 · Bankruptcy · B · clinical', w: 1280, h: 1100, node: <CafeBankruptcyClinical /> },
  { id: 'abandonment',  label: '17 · Abandonment',                 w: 1180, h: 920,  node: <CafeAbandonment /> },
  { id: 'postmatch',    label: '18 · Post-match',                  w: 1280, h: 1100, node: <CafePostmatch /> },
  { id: 'tutorial',     label: '19 · Tutorial · R1',               w: 1360, h: 1100, node: <CafeTutorial /> },
  { id: 'profile',      label: '20 · Profile',                     w: 1280, h: 1020, node: <CafeProfile /> },
  { id: 'leaderboard',  label: '21 · Leaderboard',                 w: 1180, h: 1100, node: <CafeLeaderboard /> },
  { id: 'history',      label: '22 · Match history',               w: 1320, h: 920,  node: <CafeHistory /> },
  { id: 'notifs',       label: '23 · Notifications',               w: 1320, h: 880,  node: <CafeNotifications /> },
];

// Each slide rendered at its native size, scaled to fit the print page width via CSS transform.
// Page is landscape A3-ish proportions to give the wider artboards room. The transform-origin
// is top-left and the wrapper height is set to the scaled height so siblings don't overlap.

const PrintSlideCard = ({ s }: { s: PrintSlide }) => {
  const PAGE_W = 1400; // CSS px target width for scaled screens
  const scale = PAGE_W / s.w;
  return (
    <section className="print-page">
      <div className="print-label">{s.label}</div>
      <div style={{ width: PAGE_W, height: s.h * scale, position: 'relative', overflow: 'hidden',
                    border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
        <div style={{
          width: s.w, height: s.h,
          transform: `scale(${scale})`, transformOrigin: 'top left',
        }}>
          {s.node}
        </div>
      </div>
    </section>
  );
};

const PrintApp = () => (
  <div style={{ background: '#fff', padding: '24px 32px', fontFamily: 'Inter, system-ui, sans-serif' }}>
    {/* Cover */}
    <section className="print-page print-cover">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', height: '100%', maxWidth: 900 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Adam's Axioms · Design</div>
        <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 96, lineHeight: 1, margin: '12px 0 0', fontWeight: 600, color: '#0a0a0a' }}>
          The Price War
        </h1>
        <p style={{ fontSize: 18, color: '#4b5563', marginTop: 18, lineHeight: 1.5, maxWidth: 640 }}>
          Visual direction for the turn-based economics game. 17 screens covering the full match arc —
          entry, play loop, edge states, end-of-match, and meta.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 36, width: '100%', maxWidth: 720 }}>
          <Pill label="Palette" value="Adam's Axioms · royal blue + cool greys" />
          <Pill label="Type"    value="Source Serif 4 + Inter" />
          <Pill label="Screens" value="23 across 6 sections" />
          <Pill label="Stack"   value="React + TypeScript" />
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 56 }}>May 2026</div>
      </div>
    </section>

    {PRINT_SLIDES.map(s => <PrintSlideCard key={s.id} s={s} />)}
  </div>
);

const Pill = ({ label, value }: { label: string; value: string }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', background: '#fafbfd' }}>
    <div style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 14, color: '#0a0a0a', marginTop: 4 }}>{value}</div>
  </div>
);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(<PrintApp />);

// Auto-print after fonts + Babel have settled.
(function autoPrint() {
  const fire = () => setTimeout(() => window.print(), 600);
  if ((document as any).fonts && (document as any).fonts.ready) {
    (document as any).fonts.ready.then(fire);
  } else {
    window.addEventListener('load', fire);
  }
})();
