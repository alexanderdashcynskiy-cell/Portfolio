import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, Hud, SANS } from '../ui';
import { Caption, IPhone, Sfx } from '../kit';

// The bot's own texts (server.ts: the «принят» and «готов» messages for a pickup order).
const ACCEPTED = ['✅ Здравствуйте, Аня! 🥐', 'Ваш заказ №1244 принят и уже готовится.', 'Мы уведомим вас о готовности.'];
const READY = ['🍞 Ваш заказ №1244 готов!', 'Ждём вас по адресу:', '📍 г. Витебск, ул. Ленина 74'];

const Message: React.FC<{ lines: string[]; time: string; p?: number }> = ({ lines, time, p = 1 }) => (
  <div
    style={{
      alignSelf: 'flex-start',
      maxWidth: '84%',
      padding: '20px 26px 14px',
      borderRadius: '30px 30px 30px 8px',
      background: '#fff',
      boxShadow: '0 2px 2px rgba(0,0,0,0.06)',
      fontFamily: SANS,
      fontSize: 28,
      lineHeight: 1.38,
      color: '#111',
      transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + p * 0.06})`,
      transformOrigin: '0 100%',
      opacity: p,
    }}
  >
    {lines.map((l, i) => (
      <div key={i} style={{ fontWeight: i === 0 ? 700 : 500 }}>
        {l}
      </div>
    ))}
    <div style={{ textAlign: 'right', fontSize: 20, color: '#8a96a3', marginTop: 4 }}>{time}</div>
  </div>
);

/** 06 — the CRM marks it ready; the customer gets the bot's message. One calm notification, not six. */
export const Notify: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const banner = spring({ frame: frame - 10, fps, config: { stiffness: 200, damping: 18 } });
  const bannerOut = spring({ frame: frame - 40, fps, config: { stiffness: 200, damping: 20 } });
  const msg = spring({ frame: frame - 34, fps, config: { stiffness: 220, damping: 18 } });
  const typing = frame >= 16 && frame < 34;

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Hud chapter="// 05 — telegram" offset={offset} />
      <Caption lines={[['Клиент', 'узнаёт'], ['без', <Accent key="z">звонка.</Accent>]]} at={0} size={96} />
      <IPhone>
        <div style={{ position: 'absolute', inset: 0, background: '#DDE5D7' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'radial-gradient(#7d9a6b 1.5px, transparent 1.5px)', backgroundSize: '26px 26px' }} />
        {/* Chat header */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 210, background: 'rgba(250,250,250,0.96)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ position: 'absolute', top: 36, left: 74, fontFamily: SANS, fontWeight: 700, fontSize: 26 }}>14:21</div>
          <div style={{ position: 'absolute', top: 33, left: '50%', width: 190, height: 56, marginLeft: -95, borderRadius: 30, background: '#000' }} />
          <div style={{ position: 'absolute', top: 118, left: 40, fontFamily: SANS, fontSize: 40, color: '#2AABEE' }}>‹</div>
          <div style={{ position: 'absolute', top: 108, left: 0, right: 0, textAlign: 'center', fontFamily: SANS }}>
            <div style={{ fontWeight: 700, fontSize: 30, color: '#111' }}>Мамин Хлеб</div>
            <div style={{ fontSize: 22, color: '#8a96a3', marginTop: 2 }}>бот</div>
          </div>
          <div style={{ position: 'absolute', top: 106, right: 34, width: 70, height: 70, borderRadius: 35, background: 'linear-gradient(135deg,#E8B430,#C9A227)', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>МХ</div>
        </div>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 150, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ alignSelf: 'center', padding: '6px 18px', borderRadius: 20, background: 'rgba(0,0,0,0.18)', color: '#fff', fontFamily: SANS, fontSize: 21, fontWeight: 600 }}>Сегодня</div>
          <Message lines={ACCEPTED} time="14:02" />
          {typing && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 10, padding: '24px 28px', borderRadius: 30, background: '#fff' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: '#8a96a3', opacity: 0.35 + 0.65 * Math.abs(Math.sin((frame + i * 4) / 5)) }} />
              ))}
            </div>
          )}
          {frame >= 34 && <Message lines={READY} time="14:21" p={msg} />}
        </div>
        {/* Message bar */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'rgba(250,250,250,0.96)', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ position: 'absolute', left: 90, right: 90, top: 22, height: 56, borderRadius: 28, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', fontFamily: SANS, fontSize: 24, color: '#9aa4ad', display: 'flex', alignItems: 'center', paddingLeft: 26 }}>Сообщение</div>
        </div>
        {/* The push banner drops in over the chat, then tucks back up. */}
        <div
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            top: 22 + (banner - bannerOut) * 0 - (1 - banner) * 200 - bannerOut * 220,
            padding: '20px 24px',
            borderRadius: 40,
            background: 'rgba(255,250,244,0.95)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
            display: 'flex',
            gap: 20,
            alignItems: 'center',
            fontFamily: SANS,
          }}
        >
          <div style={{ width: 70, height: 70, borderRadius: 18, background: '#2AABEE', color: '#fff', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✈</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 19, fontWeight: 700, color: 'rgba(0,0,0,0.42)', letterSpacing: '0.05em' }}>
              <span>TELEGRAM</span>
              <span style={{ letterSpacing: 0, fontWeight: 500 }}>сейчас</span>
            </div>
            <div style={{ fontSize: 27, fontWeight: 700, color: '#111', marginTop: 4 }}>Мамин Хлеб</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: '#222' }}>🍞 Ваш заказ №1244 готов!</div>
          </div>
        </div>
      </IPhone>
      <Sfx at={10} name="ding" volume={0.6} />
      <Sfx at={34} name="pop" volume={0.6} />
    </AbsoluteFill>
  );
};
