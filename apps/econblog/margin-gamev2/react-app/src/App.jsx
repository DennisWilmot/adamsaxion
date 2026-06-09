import React, { useState } from 'react';
import {
  Home, QueueSearching, MatchHistory,
} from './screens-home.jsx';
import {
  MatchLobby, Briefing, DecideScreen, Waiting, Report, Review,
} from './screens-match.jsx';
import {
  PostmatchWin, PostmatchLoss, Bankruptcy, YouDisconnected, YouTimedOut,
  YouForfeited, Abandoned, OppForfeited, OppTimedOut,
  DisconnectOverlay, ForfeitOverlay, ErrorAlreadyInMatch, ErrorForbidden, AusterityDecide,
} from './screens-terminal.jsx';
import { Catalog, TutorialBoot } from './screens-extra.jsx';
import { LessonPreview } from './shell.jsx';

// ── screen registry — mirrors the route map in the spec ────────────────────
// Each screen is a self-contained design frame. Wire these into your real
// router (react-router etc.) — the `route`/`phase` notes map 1:1 to the spec.
const GROUPS = [
  {
    title: 'Catalog & Shell',
    screens: [
      { id: 'catalog', label: 'Games catalog', route: '/play', C: Catalog },
      { id: 'home', label: 'Home (Up next / Submitted / Waiting)', route: '/play/price-war', C: Home },
      { id: 'home-dd', label: 'Home — mode dropdown open', route: '/play/price-war', C: () => <Home dropdownOpen /> },
      { id: 'queue', label: 'Queue — searching', route: '/play/price-war/queue', C: QueueSearching },
      { id: 'history', label: 'Match history', route: '/play/price-war/history', C: MatchHistory },
    ],
  },
  {
    title: 'Match · round loop',
    screens: [
      { id: 'match-lobby', label: 'Match lobby (waiting_for_opponent)', route: '/play/price-war/match/{id}', C: MatchLobby },
      { id: 'briefing', label: 'Briefing', route: '/play/price-war/match/{id}/briefing', C: Briefing },
      { id: 'decide', label: 'Decide (canonical)', route: '/play/price-war/match/{id}', C: DecideScreen },
      { id: 'review', label: 'Review (full-bleed)', route: '/play/price-war/match/{id}/review', C: Review },
      { id: 'waiting', label: 'Waiting (you locked)', route: '/play/price-war/match/{id}/waiting', C: Waiting },
      { id: 'report', label: 'Report', route: '/play/price-war/match/{id}/report/{round}', C: Report },
      { id: 'austerity', label: 'Decide — austerity (low cash)', route: '/play/price-war/match/{id}', C: AusterityDecide },
    ],
  },
  {
    title: 'Onboarding',
    screens: [
      { id: 'tutorial', label: 'Tutorial — guided first turn', route: '/play/price-war/tutorial', C: TutorialBoot },
    ],
  },
  {
    title: 'Terminal — you win',
    screens: [
      { id: 'postmatch-win', label: 'Post-match (you win)', route: '/play/price-war/match/{id}/postmatch', C: PostmatchWin },
      { id: 'opp-forfeit', label: 'Morgan forfeited', route: '/play/price-war/match/{id}/postmatch', C: OppForfeited },
      { id: 'opp-timeout', label: 'Morgan ran out of time', route: '/play/price-war/match/{id}/postmatch', C: OppTimedOut },
      { id: 'abandoned', label: 'Morgan stepped out (abandoned)', route: '/play/price-war/match/{id}/abandoned', C: Abandoned },
    ],
  },
  {
    title: 'Terminal — you lose',
    screens: [
      { id: 'postmatch-loss', label: 'Post-match (normal loss)', route: '/play/price-war/match/{id}/postmatch', C: PostmatchLoss },
      { id: 'bankruptcy', label: 'Bankruptcy — out of cash', route: '/play/price-war/match/{id}/bankruptcy', C: Bankruptcy },
      { id: 'disconnected', label: 'You disconnected', route: '/play/price-war/match/{id}/postmatch', C: YouDisconnected },
      { id: 'timeout', label: 'You ran out of time', route: '/play/price-war/match/{id}/postmatch', C: YouTimedOut },
      { id: 'forfeited', label: 'You forfeited', route: '/play/price-war/match/{id}/postmatch', C: YouForfeited },
    ],
  },
  {
    title: 'Overlays & errors',
    screens: [
      { id: 'disconnect-overlay', label: 'Opponent disconnected (grace)', route: 'overlay', C: DisconnectOverlay },
      { id: 'forfeit-overlay', label: 'Forfeit confirm', route: 'overlay', C: ForfeitOverlay },
      { id: 'err-match', label: 'Error — already in match', route: 'overlay', C: ErrorAlreadyInMatch },
      { id: 'err-forbidden', label: 'Error — forbidden', route: 'overlay', C: ErrorForbidden },
    ],
  },
  {
    title: 'Lessons (upsell)',
    screens: [
      { id: 'lesson-preview', label: 'Lesson preview / upsell', route: 'overlay', C: LessonPreview },
    ],
  },
];

const ALL = GROUPS.flatMap(g => g.screens);

export default function App() {
  const [active, setActive] = useState('home');
  const current = ALL.find(s => s.id === active) || ALL[0];
  const Screen = current.C;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* navigator — dev-only, not part of the product */}
      <nav style={{ width: 268, flex: '0 0 auto', background: '#0b1220', color: '#cdd6e4', overflowY: 'auto', padding: '16px 0' }}>
        <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: '1px solid #1d2740', marginBottom: 10 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: '#0a52c4', display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: '#fff' }} />
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', fontFamily: 'Georgia, serif' }}>Margin</div>
            <div style={{ fontSize: 10.5, color: '#6b7894', letterSpacing: '0.04em' }}>PRICE WAR · SCREENS</div>
          </div>
        </div>
        {GROUPS.map(g => (
          <div key={g.title} style={{ marginBottom: 12 }}>
            <div style={{ padding: '6px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5d6b88' }}>{g.title}</div>
            {g.screens.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '7px 18px', border: 'none', cursor: 'pointer',
                background: active === s.id ? '#0a52c4' : 'transparent',
                color: active === s.id ? '#fff' : '#aeb9cf', fontSize: 13, fontWeight: active === s.id ? 600 : 400,
              }}>{s.label}</button>
            ))}
          </div>
        ))}
      </nav>

      {/* stage */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto', background: '#e7ebf2' }}>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #d4dae4', background: '#fff', fontSize: 12, color: '#46505f', fontFamily: 'ui-monospace, monospace', position: 'sticky', top: 0, zIndex: 5 }}>
          <b style={{ color: '#0b1220' }}>{current.label}</b> &nbsp;·&nbsp; route: {current.route}
        </div>
        <div style={{ minHeight: 'calc(100vh - 33px)' }}>
          <Screen />
        </div>
      </main>
    </div>
  );
}
