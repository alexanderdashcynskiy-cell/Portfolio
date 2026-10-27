import React from 'react';
import { Composition } from 'remotion';
import { Promo, PROMO_FRAMES } from './Promo';
import { Deck, DECK_FRAMES } from './deck/Deck';
import './fonts';

export const Root: React.FC = () => (
  <>
    <Composition id="MaminHleb" component={Promo} durationInFrames={PROMO_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MaminHleb-Deck" component={Deck} durationInFrames={DECK_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
