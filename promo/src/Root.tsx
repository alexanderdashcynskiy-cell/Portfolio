import React from 'react';
import { Composition } from 'remotion';
import { Promo, PROMO_FRAMES } from './Promo';
import './fonts';

export const Root: React.FC = () => (
  <Composition id="MaminHleb" component={Promo} durationInFrames={PROMO_FRAMES} fps={30} width={1080} height={1920} />
);
