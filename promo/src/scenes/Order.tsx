import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, Hud, Tap } from '../ui';
import { Badge, Caption, clamp, easeInOut, IPhone, pt, Screen, Sfx, useTween } from '../kit';
import { NotebookPage } from './Notebook';

// Button centres on the captures, in iPhone points (measured from the screens themselves).
const PEREPECHI_PLUS = { x: 270, y: 748 };
const CROISSANT_PLUS = { x: 191, y: 544 };
const DONUT_PLUS = { x: 390, y: 545 };
const CART = { x: 389, y: 107 };
const CHECKOUT = { x: 333, y: 863 };
const HEADER_BADGE = { x: 409, y: 87 };
const FLOAT_BADGE = { x: 398, y: 831 };

const P = (p: { x: number; y: number }) => ({ x: pt(p.x), y: pt(p.y) });

/** 03 — «А если так?»: the notebook page flips up and away, and the Mini App is underneath. */
export const Turn: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flip = interpolate(frame, [6, 26], [0, 1], clamp);
  const phone = useTween(4, 30);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Hud chapter="// 03 — mini app" offset={offset} />
      <IPhone style={{ transform: `translateY(${(1 - phone) * 140}px) scale(${0.92 + phone * 0.08})` }}>
        <Screen name="m1-home" />
      </IPhone>
      <div style={{ position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: '50% 0%' }}>
        <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 0%', transform: `rotateX(${easeInOut(flip) * 105}deg)`, opacity: flip > 0.92 ? 0 : 1 }}>
          <div style={{ position: 'absolute', inset: 0, background: '#EFE6D8', opacity: 1 - flip }} />
          <NotebookPage frame={99} fps={fps} />
        </div>
      </div>
      <Caption lines={[['А', 'если', <Accent key="t">так?</Accent>]]} at={8} size={110} />
      <Sfx at={6} name="whoosh" volume={0.9} />
    </AbsoluteFill>
  );
};

/**
 * 04 — the order, on the real Mini App: + on Перепечи, scroll, + Круассан, + Пончик,
 * the cart, «Оформить заказ», and the receipt.
 */
export const Order: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const adds = [10, 44, 56];
  const count = adds.filter((t) => frame >= t).length;
  const changedAt = [...adds].reverse().find((t) => frame >= t) ?? 0;
  const scroll = useTween(20, 34);
  const toCart = useTween(70, 84);
  const toReceipt = useTween(104, 118);
  const drift = pt(240);

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Hud chapter="// 03 — mini app" offset={offset} />
      <Caption lines={[['Клиент', 'заказывает'], ['сам —', <Accent key="t">в Telegram.</Accent>]]} at={0} size={90} />

      <IPhone>
        {/* Home → the feed, as one scroll: the page slides up and the feed slides in under it. */}
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-toCart * 100}%)` }}>
          <Screen name="m1-home" style={{ transform: `translateY(${-scroll * drift}px)`, opacity: 1 - scroll }} />
          <Screen name="m2-feed" style={{ transform: `translateY(${(1 - scroll) * drift}px)`, opacity: scroll }} />
          {frame < 34 ? (
            <Badge count={count} changedAt={changedAt} x={P(HEADER_BADGE).x} y={P(HEADER_BADGE).y} size={pt(19)} />
          ) : (
            <>
              <Badge count={count} changedAt={changedAt} x={P(HEADER_BADGE).x} y={P(HEADER_BADGE).y} size={pt(19)} />
              <Badge count={count} changedAt={changedAt} x={P(FLOAT_BADGE).x} y={P(FLOAT_BADGE).y} size={pt(17)} />
            </>
          )}
        </div>
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - toCart) * 100}%)` }}>
          <Screen name="m4-cart" />
        </div>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - toReceipt) * 100}%)`, boxShadow: '0 -30px 60px rgba(0,0,0,0.25)' }}>
          <Screen name="m6-receipt" />
        </div>

        <Tap at={adds[0]} {...P(PEREPECHI_PLUS)} />
        <Tap at={adds[1]} {...P(CROISSANT_PLUS)} />
        <Tap at={adds[2]} {...P(DONUT_PLUS)} />
        <Tap at={64} {...P(CART)} />
        <Tap at={98} {...P(CHECKOUT)} />
      </IPhone>

      {[...adds, 64, 98].map((t) => (
        <Sfx key={t} at={t} name="tap" volume={0.8} />
      ))}
      <Sfx at={20} name="whoosh" volume={0.25} />
      <Sfx at={70} name="whoosh" volume={0.3} />
      <Sfx at={110} name="pop" volume={0.7} />
    </AbsoluteFill>
  );
};
