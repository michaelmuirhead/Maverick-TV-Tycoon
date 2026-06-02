'use client';
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import Welcome from './Welcome';
import Dashboard from './Dashboard';
import ShowCreator from './ShowCreator';
import NetworkHub from './NetworkHub';
import Productions from './Productions';
import TalentMarket from './TalentMarket';
import AwardsCeremony from './AwardsCeremony';
import RivalStudios from './RivalStudios';

export default function Game() {
  const screen = useGameStore((s) => s.screen);

  switch (screen) {
    case 'welcome':       return <Welcome />;
    case 'dashboard':     return <Dashboard />;
    case 'show-creator':  return <ShowCreator />;
    case 'network-hub':   return <NetworkHub />;
    case 'productions':   return <Productions />;
    case 'talent-market': return <TalentMarket />;
    case 'awards':        return <AwardsCeremony />;
    case 'rivals':        return <RivalStudios />;
    default:              return <Welcome />;
  }
}
