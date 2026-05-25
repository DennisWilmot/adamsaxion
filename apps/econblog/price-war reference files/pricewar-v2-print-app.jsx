// Print-friendly variant of the v2 wireframes app:
// renders every screen stacked, each on its own page.

const PRINT_SCREENS = [
  { id: 'lobby',     order: '1', label: 'Lobby',          pick: 'B',   body: () => <LobbyV2 />,     title: 'Kanban by status · scenario label · results-ready elevated',
    why: 'Picked direction B, refined: scenario label on every card; results-ready column now sits left with urgent red treatment so it visually outranks waiting.' },
  { id: 'briefing',  order: '2', label: 'Briefing',       pick: 'A',   body: () => <BriefingV2 />,  title: 'Narrative briefing · opponent identity hero',
    why: 'Picked direction A, refined: opponent moved to a hero card so the match feels personal; "price = a Sales action" phrasing instead of treating price as special.' },
  { id: 'results',   order: '3', label: 'Results',        pick: 'A',   body: () => <ResultsV2 />,   title: 'P&L report · event-pill tooltips · stochastic events space',
    why: 'Picked direction A, refined: hover-tooltips on every event/market pill explain the mechanic (not just the word). Dedicated "Events this round" subsection inside the public card, under the You/Marina cards.' },
  { id: 'library',   order: 'L', label: 'Action Library', pick: 'NEW', body: () => <Library />,     title: 'The rendering spec · quiet by default, details on hover',
    why: 'New tab. Defines 10 input types, what stays visible on the card vs. what hides behind hover.' },
  { id: 'decide',    order: '4', label: 'Decide',         pick: 'B',   body: () => <DecideV2 />,    title: 'Pick 3 moves · master / detail · details on hover',
    why: 'Picked direction B, rebuilt: cards show name + 1-line effect + only-meaningful chips, expanded details live behind hover.' },
  { id: 'submitted', order: '5', label: 'Submitted',      pick: 'A',   body: () => <SubmittedV2 />, why: 'Picked direction A, refined: plan split into definite vs. conditional.',
    title: 'Active watch tower · definite vs conditional' },
  { id: 'postmatch', order: '6', label: 'Post-match',     pick: 'C',   body: () => <PostmatchV2 />, title: 'Trophy hero + turning point + concept rail',
    why: 'Picked direction C, refined: Turning Point added as a top-level explainer card; price chart highlights the pivot round.' },
];

function PrintApp() {
  return (
    <div className="page print-root" style={{ '--accent': '#1f59c2' }}>
      <div className="print-cover">
        <div className="crumbs">
          <span>adamsaxiom · wireframes</span>
          <span className="dot" />
          <span>the price war</span>
          <span className="dot" />
          <span>v0.2 · picked directions + action library</span>
        </div>
        <div className="title-row">
          <h1>The Price War · v2 · pick 3 moves</h1>
          <p>Your 6 picks (1-B, 2-A, 3-A, 4-B, 5-A, 6-C) refined twice. The Action Library tab documents the rendering system underneath.</p>
        </div>
        <div className="notes">
          <div className="note"><b>Moves, not settings</b><span>Action names are verbs: "Stock up", "Raise wages", "Advertise locally". Strategic, not administrative.</span></div>
          <div className="note"><b>Quiet by default</b><span>Only show a chip when it actually matters now. Persistent + private are defaults.</span></div>
          <div className="note"><b>Details live in the hover</b><span>Mechanic, forecast, and risk live in the expanded tooltip.</span></div>
        </div>
        <div className="print-toc">
          <div className="eyebrow">In this document</div>
          <ol>
            {PRINT_SCREENS.map(s => (
              <li key={s.id}><b>{s.order}</b> · {s.label} <span className="step-hint">— {s.title}</span></li>
            ))}
          </ol>
        </div>
      </div>

      <div className="options print-options">
        {PRINT_SCREENS.map((screen) => {
          const Body = screen.body;
          return (
            <section className="option print-option" key={screen.id}>
              <div className="option-head">
                <span className={`tag ${screen.pick === 'NEW' ? 'v2' : ''}`}>
                  {screen.pick === 'NEW' ? 'New' : `Option ${screen.pick} · refined`}
                </span>
                <h3>{screen.order} · {screen.label} — {screen.title}</h3>
                <span className="why">{screen.why}</span>
              </div>
              <div className="frame density-regular">
                <div className="tape" />
                <Body />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<PrintApp />);
