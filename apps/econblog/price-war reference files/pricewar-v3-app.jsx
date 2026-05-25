// Price War v3 — canvas app
// Sections, in priority order from the design review feedback:
//   1. Refined v3 of the 6 existing wireframes (Lobby, Briefing, Results, Decide, Submitted, Post-match)
//   2. Pre-match flow (Scenario, Matchmaking, Rematch)
//   3. Mid-match edge states (Review-and-submit ×2, Forfeit, Undo/revise, Austerity ×2)
//   4. Terminal states (Bankruptcy ×2, Abandonment)
//   5. Meta (Match history, Profile, Leaderboard, Notifications)
//   6. Onboarding (First-match tutorial)

const Frame = ({ children, padding = 22 }) => (
  <div className="frame density-regular" style={{ padding, height: '100%', overflow: 'auto', background: 'var(--paper)' }}>
    <div className="tape" />
    {children}
  </div>
);

const App = () => (
  <DesignCanvas>

    <DCSection id="refined" title="Refined · v3" subtitle="The 6 existing wireframes with feedback folded in.">
      <DCArtboard id="lobby-v3" label="Lobby v3 · Elo header + empty-state hint" width={1280} height={900}><Frame><LobbyV3 /></Frame></DCArtboard>
      <DCArtboard id="briefing-v3" label="Briefing v3 · playstyle hidden · soft active" width={1180} height={1020}><Frame><BriefingV3 /></Frame></DCArtboard>
      <DCArtboard id="results-v3" label="Results v3 · words not %s · collapsible inference" width={1280} height={1050}><Frame><ResultsV3 /></Frame></DCArtboard>
      <DCArtboard id="decide-v3" label="Decide v3 · Scout slot clarification" width={1320} height={920}><Frame><DecideV3 /></Frame></DCArtboard>
      <DCArtboard id="submitted-v3" label="Submitted v3 · Unlock & revise" width={1180} height={780}><Frame><SubmittedV3 /></Frame></DCArtboard>
      <DCArtboard id="postmatch-v3" label="Post-match v3 · customer trajectory" width={1280} height={1100}><Frame><PostmatchV3 /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="prematch" title="Pre-match flow" subtitle="Before round 1 — Scenario select, Matchmaking queue, Rematch.">
      <DCArtboard id="scenario" label="Scenario select · Coffee Shop v1 + 3 in design" width={1180} height={900}><Frame><ScenarioSelect /></Frame></DCArtboard>
      <DCArtboard id="queue" label="Matchmaking queue · Elo range + cancel" width={1180} height={840}><Frame><MatchmakingQueue /></Frame></DCArtboard>
      <DCArtboard id="rematch" label="Rematch · awaiting accept" width={1180} height={760}><Frame><Rematch /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="midmatch" title="Mid-match edge states" subtitle="Review-and-submit (2 directions), Forfeit, Undo/revise, Austerity (2 directions).">
      <DCArtboard id="review-modal" label="Review &amp; submit · A · modal overlay" width={900} height={780}><Frame><ReviewSubmitModal /></Frame></DCArtboard>
      <DCArtboard id="review-inline" label="Review &amp; submit · B · inline strip" width={1280} height={760}><Frame><ReviewSubmitInline /></Frame></DCArtboard>
      <DCArtboard id="forfeit" label="Forfeit · type FORFEIT to confirm" width={900} height={800}><Frame><ForfeitConfirm /></Frame></DCArtboard>
      <DCArtboard id="undo" label="Unlock &amp; revise warning" width={900} height={760}><Frame><UndoRevise /></Frame></DCArtboard>
      <DCArtboard id="austerity-banner" label="Austerity · A · banner + grayed actions" width={1180} height={900}><Frame><AusterityBanner /></Frame></DCArtboard>
      <DCArtboard id="austerity-calm" label="Austerity · B · state-strip only" width={1180} height={760}><Frame><AusterityCalm /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="terminal" title="Terminal states" subtitle="Match-ending screens — Bankruptcy (2 directions), Opponent abandonment.">
      <DCArtboard id="bankruptcy-dramatic" label="Bankruptcy · A · dramatic" width={1180} height={900}><Frame><BankruptcyDramatic /></Frame></DCArtboard>
      <DCArtboard id="bankruptcy-clinical" label="Bankruptcy · B · clinical / chart-first" width={1180} height={900}><Frame><BankruptcyClinical /></Frame></DCArtboard>
      <DCArtboard id="abandonment" label="Abandonment resolution · partial Elo" width={1180} height={840}><Frame><AbandonmentResolution /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="meta" title="Meta screens" subtitle="Match history, Player profile (Elo hero), Leaderboard, Notifications.">
      <DCArtboard id="history" label="Match history · list" width={1180} height={820}><Frame><MatchHistory /></Frame></DCArtboard>
      <DCArtboard id="profile" label="Profile · Elo hero stat" width={1180} height={980}><Frame><PlayerProfile /></Frame></DCArtboard>
      <DCArtboard id="leaderboard" label="Leaderboard · Coffee Shop ladder" width={1180} height={900}><Frame><Leaderboard /></Frame></DCArtboard>
      <DCArtboard id="notifs" label="Notifications · in-app inbox + behavior matrix" width={1180} height={960}><Frame><NotificationsCenter /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="onboarding" title="Onboarding" subtitle="Guided first turn — suggested 3 actions, accept or override.">
      <DCArtboard id="tutorial" label="Tutorial · guided first turn (Decide R1)" width={1320} height={920}><Frame><TutorialDecide /></Frame></DCArtboard>
    </DCSection>

  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
