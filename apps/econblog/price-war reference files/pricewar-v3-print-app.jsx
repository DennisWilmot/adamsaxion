// Print-friendly version of the v3 canvas — same artboards, rendered one per page.

const PRINT_SCREENS = [
  // Refined v3
  { section: 'Refined · v3',          label: 'Lobby v3',                   sub: 'Elo header + first-time empty-state hint',     body: () => <LobbyV3 /> },
  { section: 'Refined · v3',          label: 'Briefing v3',                sub: 'Opponent playstyle hidden · soft "active today"', body: () => <BriefingV3 /> },
  { section: 'Refined · v3',          label: 'Results v3',                 sub: 'Words instead of % · collapsible inference',     body: () => <ResultsV3 /> },
  { section: 'Refined · v3',          label: 'Decide v3',                  sub: 'Scout = 1 Finance slot clarification',           body: () => <DecideV3 /> },
  { section: 'Refined · v3',          label: 'Submitted v3',               sub: 'Unlock & revise affordance',                     body: () => <SubmittedV3 /> },
  { section: 'Refined · v3',          label: 'Post-match v3',              sub: 'Customer trajectory + lesson CTA',               body: () => <PostmatchV3 /> },

  // Pre-match
  { section: 'Pre-match flow',        label: 'Scenario select',            sub: 'Coffee Shop v1 + 3 future scenarios',            body: () => <ScenarioSelect /> },
  { section: 'Pre-match flow',        label: 'Matchmaking queue',          sub: 'Elo range, delayed-match opt-in',                body: () => <MatchmakingQueue /> },
  { section: 'Pre-match flow',        label: 'Rematch',                    sub: 'Request sent · awaiting accept',                 body: () => <Rematch /> },

  // Mid-match
  { section: 'Mid-match edge states', label: 'Review & submit · A',        sub: 'Modal overlay over Decide',                      body: () => <ReviewSubmitModal /> },
  { section: 'Mid-match edge states', label: 'Review & submit · B',        sub: 'Inline expanded review strip',                   body: () => <ReviewSubmitInline /> },
  { section: 'Mid-match edge states', label: 'Forfeit confirmation',       sub: 'Type FORFEIT to confirm',                        body: () => <ForfeitConfirm /> },
  { section: 'Mid-match edge states', label: 'Unlock & revise',            sub: 'Submitted-screen warning overlay',               body: () => <UndoRevise /> },
  { section: 'Mid-match edge states', label: 'Austerity · A',              sub: 'Banner + grayed-out actions',                    body: () => <AusterityBanner /> },
  { section: 'Mid-match edge states', label: 'Austerity · B',              sub: 'State-strip treatment, calmer',                  body: () => <AusterityCalm /> },

  // Terminal
  { section: 'Terminal states',       label: 'Bankruptcy · A',             sub: 'Dramatic · the shop closes',                     body: () => <BankruptcyDramatic /> },
  { section: 'Terminal states',       label: 'Bankruptcy · B',             sub: 'Clinical · chart-first',                         body: () => <BankruptcyClinical /> },
  { section: 'Terminal states',       label: 'Opponent abandonment',       sub: 'Partial Elo · gentler lesson CTA',               body: () => <AbandonmentResolution /> },

  // Meta
  { section: 'Meta screens',          label: 'Match history',              sub: 'List · filterable by scenario',                  body: () => <MatchHistory /> },
  { section: 'Meta screens',          label: 'Player profile',             sub: 'Elo as hero stat',                               body: () => <PlayerProfile /> },
  { section: 'Meta screens',          label: 'Leaderboard',                sub: 'Coffee Shop ladder',                             body: () => <Leaderboard /> },
  { section: 'Meta screens',          label: 'Notifications',              sub: 'Inbox + behavior matrix',                        body: () => <NotificationsCenter /> },

  // Onboarding
  { section: 'Onboarding',            label: 'Tutorial · guided first turn', sub: 'Decide R1 with coach pins',                    body: () => <TutorialDecide /> },
];

function PrintApp() {
  return (
    <div className="print-root">
      <div className="print-cover">
        <div className="crumbs">
          <span>adamsaxiom · price war</span>
          <span className="dot" />
          <span>v3</span>
          <span className="dot" />
          <span>{PRINT_SCREENS.length} screens</span>
        </div>
        <div className="title-row">
          <h1>The Price War · v3</h1>
          <p>The 6 existing wireframes refined with feedback folded in, plus all 13 missing screens. One artboard per page, in section order.</p>
        </div>
        <div className="print-toc">
          <div className="eyebrow">Contents</div>
          <ol>
            {PRINT_SCREENS.map((s, i) => (
              <li key={i}><b>{String(i + 1).padStart(2, '0')}</b> · <span style={{ color: 'var(--ink-3)' }}>{s.section}</span> — {s.label} <span className="step-hint">— {s.sub}</span></li>
            ))}
          </ol>
        </div>
      </div>

      {PRINT_SCREENS.map((s, i) => {
        const Body = s.body;
        return (
          <section className="print-page" key={i}>
            <div className="print-head">
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <span className="sec">{s.section}</span>
              <span className="dot" />
              <span className="lbl">{s.label}</span>
              <span className="sub">— {s.sub}</span>
            </div>
            <div className="frame density-regular print-frame">
              <div className="tape" />
              <Body />
            </div>
          </section>
        );
      })}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<PrintApp />);
