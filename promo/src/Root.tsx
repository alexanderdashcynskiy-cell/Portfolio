import React from 'react';
import { Composition } from 'remotion';
import { Promo, PROMO_FRAMES } from './Promo';
import { Deck, DECK_FRAMES } from './deck/Deck';
import { OneOrder, ONE_ORDER_FRAMES } from './oneorder/OneOrder';
import { OrderFlight3D, FLIGHT_FRAMES } from './three/OrderFlight3D';
import './fonts';

export const Root: React.FC = () => (
  <>
    <Composition id="MaminHleb" component={Promo} durationInFrames={PROMO_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MaminHleb-Deck" component={Deck} durationInFrames={DECK_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MaminHleb-OneOrder" component={OneOrder} durationInFrames={ONE_ORDER_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="OneOrder-3D-Test" component={OrderFlight3D} durationInFrames={FLIGHT_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
