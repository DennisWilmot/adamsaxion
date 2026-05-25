// Café Duel · canvas app — full match-arc + edge states + meta on one canvas.

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ height: '100%', overflow: 'hidden', background: '#fff' }}>{children}</div>
);

const App = () => (
  <DesignCanvas>
    <DCSection id="entry" title="Entry · before the match" subtitle="Lobby → scenario select → queue → opponent reveal.">
      <DCArtboard id="lobby"     label="Lobby · streak + recent + coach tip" width={1320} height={900}><Frame><CafeLobby /></Frame></DCArtboard>
      <DCArtboard id="scenario"  label="Scenario select · 4 worlds, 1 unlocked" width={1180} height={1040}><Frame><CafeScenario /></Frame></DCArtboard>
      <DCArtboard id="queue"     label="Matchmaking · Elo range + coach idle" width={1180} height={900}><Frame><CafeQueue /></Frame></DCArtboard>
      <DCArtboard id="briefing"  label="Briefing · opponent reveal (animated)" width={1320} height={1000}><Frame><CafeBriefing /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="play" title="Play loop" subtitle="Decide (inline sliders) → locked / waiting → slim round report. Cash ticker animates.">
      <DCArtboard id="decide"    label="Decide · inline sliders, no modal" width={1360} height={1280}><Frame><CafeDecide /></Frame></DCArtboard>
      <DCArtboard id="locked"    label="Locked · waiting for opponent" width={1180} height={1080}><Frame><CafeLocked /></Frame></DCArtboard>
      <DCArtboard id="report"    label="Round report · 1-second scan" width={1320} height={580}><Frame><CafeReport /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="edge" title="Edge states · failure modes &amp; exits" subtitle="Forfeit · Unlock &amp; revise · Austerity · Bankruptcy · Abandonment.">
      <DCArtboard id="forfeit"     label="Forfeit · type FORFEIT to confirm" width={1180} height={760}><Frame><CafeForfeit /></Frame></DCArtboard>
      <DCArtboard id="undo"        label="Unlock &amp; revise warning" width={1180} height={720}><Frame><CafeUndo /></Frame></DCArtboard>
      <DCArtboard id="austerity"   label="Austerity · cash under $500 · cheap moves only" width={1360} height={1000}><Frame><CafeAusterity /></Frame></DCArtboard>
      <DCArtboard id="bankruptcy"  label="Bankruptcy · match-ending" width={1180} height={1000}><Frame><CafeBankruptcy /></Frame></DCArtboard>
      <DCArtboard id="abandonment" label="Opponent abandoned · partial Elo" width={1180} height={920}><Frame><CafeAbandonment /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="end" title="After the match · onboarding · profile" subtitle="Post-match summary, first-turn tutorial, profile.">
      <DCArtboard id="postmatch" label="Post-match · final verdict + trajectory" width={1280} height={1100}><Frame><CafePostmatch /></Frame></DCArtboard>
      <DCArtboard id="tutorial"  label="Tutorial · R1 with coach overlay" width={1360} height={1100}><Frame><CafeTutorial /></Frame></DCArtboard>
      <DCArtboard id="profile"   label="Profile · Elo hero + history" width={1280} height={1020}><Frame><CafeProfile /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="meta" title="Meta · social &amp; standings" subtitle="Where the rest of the player base shows up.">
      <DCArtboard id="leaderboard" label="Leaderboard · podium + ladder" width={1180} height={1100}><Frame><CafeLeaderboard /></Frame></DCArtboard>
      <DCArtboard id="notifs"      label="Notifications · inbox + prefs" width={1320} height={880}><Frame><CafeNotifications /></Frame></DCArtboard>
    </DCSection>

    <DCSection id="compare" title="Compare · current flat MVP" subtitle="Faithful repro of the screenshots, for side-by-side.">
      <DCArtboard id="decide-flat" label="Decide · current"  width={1320} height={1080}><Frame><FlatDecide /></Frame></DCArtboard>
      <DCArtboard id="report-flat" label="Report · current"  width={1320} height={1080}><Frame><FlatReport /></Frame></DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(<App />);
