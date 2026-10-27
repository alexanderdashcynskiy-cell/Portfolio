import React from 'react';
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, Grain, MONO, SANS, SERIF, Words } from '../ui';
import { clamp, easeInOut, Sfx } from '../kit';
import { LockPhone } from '../scenes/Rush';
import { Chapter, OVERLAP } from './Chapter';
import { PH, PH_X, PH_Y } from './devices';
import {
  CallArt,
  CheckoutArt,
  DialogArt,
  NotebookArt,
  NotesArt,
  NumbersArt,
  OrderArt,
  AcceptArt,
  ReadyClickArt,
  RepeatArt,
  StaffArt,
  StockArt,
  SumsArt,
} from './arts';

/*
 * The negotiation film, 16:9: a title, the morning's problem, then eight benefits as
 * «было → стало», and a summary slide to stop on. Every product claim is backed by the code
 * of the Mini App and the CRM; the voice-over lines are kept next to the scenes they belong to.
 */
const CHAPTERS = [
  {
    title: 'Заказ без звонка',
    short: 'Заказы через Mini App, без трубки',
    before: 'Телефон звонит, а руки в тесте.',
    benefit: <>Заказ приходит <Accent>сам.</Accent></>,
    line: 'Клиент выбирает и оформляет заказ в Telegram Mini App. Брать трубку не нужно.',
    beforeArt: <CallArt who="+375 29 ••• •• 17" sub="мобильный · 5-й пропущенный" />,
    afterArt: <OrderArt />,
    vo: 'Клиент заказывает сам — в Телеграме. Вам не нужно брать трубку.',
  },
  {
    title: 'Детали — от клиента',
    short: 'Имя, телефон, время — в заказе',
    before: 'Переспрашивать имя, номер и время.',
    benefit: <>Всё уже <Accent>в заказе.</Accent></>,
    line: 'Имя, телефон, время самовывоза или адрес доставки и сумма — клиент указывает сам.',
    beforeArt: <DialogArt lines={['— Во сколько заберёте?', '— Ну, часа в два…', '— Повторите номер, пожалуйста?', '— А это на какое имя?']} />,
    afterArt: <CheckoutArt />,
    vo: 'Имя, телефон, время — всё уже в заказе. Ничего не нужно переспрашивать.',
  },
  {
    title: 'Каждый заказ на виду',
    short: 'Заказ в CRM, «Принять» — чек клиенту',
    before: 'Тетрадь: почерк, зачёркивания, «уточнить».',
    benefit: <>Принять заказ — <Accent>одна кнопка.</Accent></>,
    line: 'Заказ из Mini App сразу в CRM. «Принять заказ» — и клиенту в Telegram уходят чек и подтверждение.',
    beforeArt: <NotebookArt />,
    afterArt: <AcceptArt />,
    vo: 'Вместо тетради — все заказы на одном экране. Ни один не потеряется.',
  },
  {
    title: 'Склад считает сам',
    short: 'Остатки списываются автоматически',
    before: '«Медовик ещё есть?» — идти и пересчитывать.',
    benefit: <>Остатки <Accent>списываются сами.</Accent></>,
    line: 'При каждом заказе остаток товара уменьшается автоматически — видно, что заканчивается.',
    beforeArt: <NotesArt notes={['Медовик — кончился?!', 'Пересчитать полки', 'Багет — сколько осталось?']} />,
    afterArt: <StockArt />,
    vo: 'Остатки списываются сами. Вы видите, что заканчивается, ещё до вопроса клиента.',
  },
  {
    title: 'Клиент знает, когда готово',
    short: '«Готово» в CRM — сообщение клиенту',
    before: 'Звонок: «Ну что, мой заказ готов?»',
    benefit: <>Клиент узнаёт <Accent>без звонка.</Accent></>,
    line: 'Нажали «Готово» в CRM — бот сам пишет клиенту, что заказ ждёт его.',
    beforeArt: <CallArt who="Ольга" sub="3-й звонок за утро" bubble="Ну что, готово?" />,
    afterArt: <ReadyClickArt />,
    vo: 'Когда заказ готов, клиент получает сообщение сам. Меньше звонков «ну что там?».',
  },
  {
    title: 'Цифры дня без подсчётов',
    short: 'Дашборд и отчёт смены в Telegram',
    before: 'Вечером сводить кассу и тетрадь вручную.',
    benefit: <>Цифры дня — <Accent>уже посчитаны.</Accent></>,
    line: 'Выручка, заказы, средний чек и пиковые часы на дашборде. Отчёт смены приходит в Telegram.',
    beforeArt: <SumsArt />,
    afterArt: <NumbersArt />,
    vo: 'Выручка, средний чек, отчёт смены — посчитаны сами и приходят вам в Телеграм.',
  },
  {
    title: 'Повторный заказ в два касания',
    short: 'История и повтор заказа',
    before: '«Мне как в прошлый раз…» — «А что вы брали?»',
    benefit: <>Постоянным — <Accent>проще вернуться.</Accent></>,
    line: 'В Mini App хранится история заказов: «Повторить заказ» — и корзина снова собрана.',
    beforeArt: <DialogArt lines={['— Мне как в прошлый раз!', '— А что вы брали?..', '— Ну… круассан, и ещё что-то…']} />,
    afterArt: <RepeatArt />,
    vo: 'Постоянным клиентам проще вернуться: прошлый заказ повторяется в два касания.',
  },
  {
    title: 'Касса и команда',
    short: 'Касса, роли и журнал смен',
    before: 'Касса отдельно, смены — на словах.',
    benefit: <>Касса, роли и смены — <Accent>в той же системе.</Accent></>,
    line: 'Продажи у прилавка, сотрудники с ролями (кассир видит заказы, пекарь — только склад) и журнал входов.',
    beforeArt: <NotesArt notes={['Кто сегодня на смене?', 'Касса — свести с тетрадью', 'Игорь пришёл во сколько?']} />,
    afterArt: <StaffArt />,
    vo: 'Касса, сотрудники с ролями и журнал смен — в той же системе.',
  },
];

const sec = (s: number) => Math.round(s * 30);
/*
 * The owner's own read of the script (public/voice-deck.mp3, cleaned and levelled), cut into
 * cues by word timings from a speech recogniser. [start, end] are seconds in that file.
 */
const VO = {
  title: [0.68, 5.85],
  phone: [6.15, 9.6],
  book: [9.85, 12.97],
  turn: [13.3, 14.23],
  chapters: [
    [[14.55, 16.59], [16.9, 20.66]],
    [[20.8, 22.5], [22.55, 26.18]],
    [[26.47, 27.93], [28.19, 32.1]],
    [[32.39, 33.53], [33.79, 37.19]],
    [[37.46, 38.68], [38.92, 42.21]],
    [[42.48, 43.89], [44.07, 48.35]],
    [[48.65, 49.92], [50.17, 53.91]],
    [[54.24, 56.54], [56.83, 60.62]],
  ],
  summary: [60.89, 67.02],
  outro: [67.24, 70.54],
} as const;

/*
 * The timeline is cut to the voice: every scene ends a breath after its last word, and
 * neighbouring chapters overlap by OVERLAP frames so one pushes the next in, never a blank.
 */
const dur = (c: readonly [number, number]) => sec(c[1] - c[0]);
const TITLE_LEN = 6 + dur(VO.title) + 8;
const BOOK_AT = 4 + dur(VO.phone) + 6; // inside the problem scene: phone → paper book
const PROBLEM_LEN = BOOK_AT + 2 + dur(VO.book) + 8;
const TURN_LEN = 4 + dur(VO.turn) + 10;
// The CRM → Telegram chapters need time for the messages to land and be read.
const MIN_AFTER_LEN = [0, 0, 132, 0, 112, 0, 0, 0];
const CH_AFTER = VO.chapters.map(([b]) => Math.max(40, 4 + dur(b) + 8));
const CH_LEN = VO.chapters.map(([, a], i) => CH_AFTER[i] + Math.max(4 + dur(a) + 12, MIN_AFTER_LEN[i]));
const CH_FROM = TITLE_LEN + PROBLEM_LEN + TURN_LEN;
const CH_START = CH_LEN.map((_, i) => CH_FROM + CH_LEN.slice(0, i).reduce((x, y) => x + y, 0));
const CH_TOTAL = CH_LEN.reduce((x, y) => x + y, 0);
const SUMMARY_FROM = CH_FROM + CH_TOTAL;
const SUMMARY_LEN = 8 + dur(VO.summary) + 20;
const OUTRO_FROM = SUMMARY_FROM + SUMMARY_LEN;
const OUTRO_LEN = 3 + dur(VO.outro) + 14;
export const DECK_FRAMES = OUTRO_FROM + OUTRO_LEN;

type Cue = { at: number; from: number; to: number };
const CUES: Cue[] = [
  { at: 6, from: VO.title[0], to: VO.title[1] },
  { at: TITLE_LEN + 4, from: VO.phone[0], to: VO.phone[1] },
  { at: TITLE_LEN + BOOK_AT + 2, from: VO.book[0], to: VO.book[1] },
  { at: TITLE_LEN + PROBLEM_LEN + 4, from: VO.turn[0], to: VO.turn[1] },
  ...VO.chapters.flatMap(([b, a], i) => {
    const start = CH_START[i];
    const afterAt = CH_AFTER[i] + 4;
    return [
      { at: start + 4, from: b[0], to: b[1] },
      { at: start + afterAt, from: a[0], to: a[1] },
    ];
  }),
  { at: SUMMARY_FROM + 8, from: VO.summary[0], to: VO.summary[1] },
  { at: OUTRO_FROM + 3, from: VO.outro[0], to: VO.outro[1] },
];

const Voice: React.FC = () => (
  <>
    {CUES.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={sec(c.to - c.from) + 2} layout="none">
        <Audio src={staticFile('voice-deck.mp3')} startFrom={sec(c.from)} endAt={sec(c.to) + 2} />
      </Sequence>
    ))}
  </>
);

/** The music bed dips under the voice and comes back up in the gaps. */
const musicVolume = (f: number) => {
  const speaking = CUES.some((c) => f >= c.at - 6 && f <= c.at + sec(c.to - c.from) + 8);
  const fadeIn = interpolate(f, [0, 30], [0, 1], clamp);
  const fadeOut = interpolate(f, [DECK_FRAMES - 60, DECK_FRAMES], [1, 0], clamp);
  return (speaking ? 0.16 : 0.34) * fadeIn * fadeOut;
};

/** One soft, warm space behind every slide: light pools drifting over a cream gradient. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const orb = (x: number, y: number, r: number, color: string, phase: number) => (
    <div style={{ position: 'absolute', left: x + Math.sin(frame / 140 + phase) * 80 - r, top: y + Math.cos(frame / 170 + phase) * 60 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, ${color}, transparent)` }} />
  );
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(120% 100% at 70% 40%, #FBF6EE 0%, #F3EADF 60%, #EADDCD 100%)', overflow: 'hidden' }}>
      {orb(1450, 380, 620, 'rgba(232,180,48,0.16)', 0)}
      {orb(1700, 900, 520, 'rgba(208,105,42,0.12)', 2)}
      {orb(300, 900, 560, 'rgba(208,105,42,0.07)', 4)}
      <AbsoluteFill style={{ opacity: 0.5, backgroundImage: 'radial-gradient(rgba(45,21,5,0.07) 1.2px, transparent 1.2px)', backgroundSize: '34px 34px', maskImage: 'radial-gradient(80% 70% at 70% 50%, #000, transparent)' }} />
    </AbsoluteFill>
  );
};

/** The bakery at dawn (AI footage supplied by the owner), darkened under the title. */
const Dawn: React.FC<{ from: number; rate?: number; push?: number; dim?: number }> = ({ from, rate = 1, push = 0.06, dim = 0.55 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = 1 + push * (frame / durationInFrames);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <OffthreadVideo src={staticFile('video/dawn.mp4')} startFrom={from} playbackRate={rate} volume={2.5} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 45%, rgba(20,10,4,${dim * 0.6}) 0%, rgba(20,10,4,${Math.min(0.92, dim + 0.3)}) 100%)` }} />
    </AbsoluteFill>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 20, fps, config: { stiffness: 120, damping: 20 } });
  const b = interpolate(frame, [40, 56], [0, 1], clamp);
  const out = interpolate(frame, [TITLE_LEN - 4, TITLE_LEN + OVERLAP], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: out }}>
      <Dawn from={0} />
      <div style={{ position: 'relative', fontFamily: MONO, fontSize: 28, color: 'rgba(251,246,238,0.7)', opacity: b, marginBottom: 26 }}>// для пекарен и кофеен</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 150, lineHeight: 1, color: C.cream, opacity: a, transform: `translateY(${(1 - a) * 40}px)`, textShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
        Mini App <span style={{ fontStyle: 'italic', color: '#F09A5B' }}>+ CRM</span>
      </div>
      <div style={{ position: 'relative', fontFamily: SANS, fontWeight: 500, fontSize: 44, color: C.cream, marginTop: 40, opacity: b, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        Как заказ проходит через пекарню — <Accent color="#F09A5B">без единого звонка.</Accent>
      </div>
      <div style={{ position: 'absolute', bottom: 80, fontFamily: MONO, fontSize: 24, color: 'rgba(251,246,238,0.6)', opacity: b }}>демо на рабочем продукте</div>
      <Sfx at={20} name="hit" volume={0.45} />
    </AbsoluteFill>
  );
};

/** The last word, back on the dough: what stays with the baker, and what the system takes. */
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 8, fps, config: { stiffness: 120, damping: 20 } });
  const b = spring({ frame: frame - 22, fps, config: { stiffness: 120, damping: 20 } });
  const c = interpolate(frame, [40, 54], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 150, textAlign: 'center' }}>
      <Dawn from={211} rate={0.45} push={0.05} dim={0.5} />
      <div style={{ position: 'relative', fontFamily: SANS, fontWeight: 800, fontSize: 110, lineHeight: 1.08, color: C.cream, letterSpacing: '-0.03em', textShadow: '0 10px 40px rgba(0,0,0,0.45)' }}>
        <div style={{ opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>Руки — для теста.</div>
        <div style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
          <Accent color="#F09A5B">Заказы — для системы.</Accent>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 80, fontFamily: MONO, fontSize: 24, color: 'rgba(251,246,238,0.7)', opacity: c }}>
        Mini App + CRM · Alexander Dashcynskiy · дизайн и разработка
      </div>
    </AbsoluteFill>
  );
};

/** The morning, first as the phone filling up, then as the paper book. */
const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const book = frame >= BOOK_AT;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 120, top: 330, width: 700, fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.06, color: C.ink, letterSpacing: '-0.03em' }}>
        {book ? (
          <>
            <Words at={BOOK_AT + 2}>{['Заказы —', 'в звонках,']}</Words>
            <br />
            <Words at={BOOK_AT + 10}>{['директе', 'и', <Accent key="t">тетради.</Accent>]}</Words>
          </>
        ) : (
          <>
            <Words at={2}>{['8:00.', 'Пекарня', 'открылась.']}</Words>
            <br />
            <Words at={30}>{['Телефон —', <Accent key="t">тоже.</Accent>]}</Words>
          </>
        )}
      </div>
      {!book && (
        <div style={{ position: 'absolute', left: PH_X, top: PH_Y, width: 686, height: 1445, transformOrigin: '0 0', transform: `perspective(2400px) rotateY(-14deg) rotateX(5deg) scale(${(PH.w + PH.bezel * 2) / 686})` }}>
          <LockPhone style={{ left: -(1080 - 686) / 2, top: -420 }} />
        </div>
      )}
      {book && (
        <Sequence from={BOOK_AT} layout="none">
          <NotebookArt />
          <Sfx at={2} name="pen" volume={0.5} />
          <Sfx at={20} name="pen" volume={0.5} />
          <Sfx at={50} name="slap" volume={0.7} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

/** The same push the chapters use, for the scenes around them. */
const Push: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  const enter = 1 - easeInOut(interpolate(frame, [0, OVERLAP], [0, 1], clamp));
  const exit = easeInOut(interpolate(frame, [len, len + OVERLAP], [0, 1], clamp));
  const blur = (enter + exit) * 10;
  return (
    <AbsoluteFill style={{ opacity: 1 - Math.max(enter, exit) * 0.9, transform: `translateX(${enter * 160 - exit * 160}px) scale(${1 + 0.02 * (frame / (len + OVERLAP))})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

const Turn: React.FC = () => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 150, color: C.ink, letterSpacing: '-0.03em' }}>
      <Words at={2} step={7}>{['А', 'если', <Accent key="t">так?</Accent>]}</Words>
    </div>
    <Sfx at={2} name="whoosh" volume={0.6} />
  </AbsoluteFill>
);

const Summary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame: frame - 2, fps, config: { stiffness: 160, damping: 18 } });
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 120, top: 96, fontFamily: MONO, fontSize: 26, color: C.orange, opacity: head }}>// итог</div>
      <div style={{ position: 'absolute', left: 120, top: 138, fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.ink, letterSpacing: '-0.03em', opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
        Что получает <Accent>ваша пекарня</Accent>
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 300, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 26 }}>
        {CHAPTERS.map((c, i) => {
          const p = spring({ frame: frame - 12 - i * 5, fps, config: { stiffness: 200, damping: 18 } });
          return (
            <div key={i} style={{ height: 250, padding: '30px 30px', borderRadius: 30, background: '#fff', border: '2px solid rgba(45,21,5,0.08)', boxShadow: '0 16px 40px rgba(60,30,10,0.07)', opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
              <div style={{ fontFamily: MONO, fontSize: 24, color: C.orange }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, lineHeight: 1.12, color: C.ink, marginTop: 14, letterSpacing: '-0.02em' }}>{c.title}</div>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 23, lineHeight: 1.35, color: '#7A604B', marginTop: 12 }}>{c.short}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, bottom: 90, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: interpolate(frame, [60, 76], [0, 1], clamp) }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink }}>
          Всё это — <Accent>одна система</Accent> для вашей пекарни.
        </div>
        <div style={{ textAlign: 'right', fontFamily: MONO, fontSize: 22, color: C.muted, lineHeight: 1.6 }}>
          Mini App + CRM для пекарни
          <br />
          Alexander Dashcynskiy · дизайн и разработка
        </div>
      </div>
      <Sfx at={2} name="hit" volume={0.6} />
    </AbsoluteFill>
  );
};

/** Top bar during the chapters: the eight steps, and the call counter that stays at zero. */
const ChapterBar: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = CH_FROM + frame;
  const active = Math.max(0, CH_START.filter((st) => abs >= st).length - 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 110, display: 'flex', gap: 10 }}>
        {CHAPTERS.map((_, i) => {
          const fill = i < active ? 1 : i > active ? 0 : (abs - CH_START[i]) / CH_LEN[i];
          return (
            <div key={i} style={{ width: 70, height: 6, borderRadius: 3, background: 'rgba(45,21,5,0.1)', overflow: 'hidden' }}>
              <div style={{ width: `${fill * 100}%`, height: '100%', background: C.orange }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 120, bottom: 80, padding: '14px 24px', borderRadius: 999, background: '#fff', border: '2px solid rgba(45,21,5,0.08)', fontFamily: SANS, fontSize: 24, fontWeight: 600, color: C.ink }}>
        Звонков, чтобы принять заказ: <span style={{ color: '#1D8A5A', fontWeight: 800 }}>0</span>
      </div>
    </>
  );
};

export const Deck: React.FC = () => (
  <AbsoluteFill style={{ background: C.cream }}>
    <Backdrop />
    <Sequence durationInFrames={TITLE_LEN + OVERLAP}>
      <Title />
    </Sequence>
    <Sequence from={TITLE_LEN} durationInFrames={PROBLEM_LEN + OVERLAP}>
      <Push len={PROBLEM_LEN}>
        <Problem />
      </Push>
    </Sequence>
    <Sequence from={TITLE_LEN + PROBLEM_LEN} durationInFrames={TURN_LEN + OVERLAP}>
      <Push len={TURN_LEN}>
        <Turn />
      </Push>
    </Sequence>
    {CHAPTERS.map((c, i) => (
      <Sequence key={i} from={CH_START[i]} durationInFrames={CH_LEN[i] + OVERLAP}>
        <AbsoluteFill>
          <Chapter n={i + 1} title={c.title} before={c.before} benefit={c.benefit} line={c.line} beforeArt={c.beforeArt} afterArt={c.afterArt} len={CH_LEN[i]} after={CH_AFTER[i]} />
        </AbsoluteFill>
      </Sequence>
    ))}
    <Sequence from={CH_FROM} durationInFrames={CH_TOTAL}>
      <ChapterBar />
    </Sequence>
    <Sequence from={SUMMARY_FROM} durationInFrames={SUMMARY_LEN}>
      <Push len={SUMMARY_LEN + 99}>
        <Summary />
      </Push>
    </Sequence>
    <Sequence from={OUTRO_FROM} durationInFrames={OUTRO_LEN}>
      <Outro />
    </Sequence>
    <Grain opacity={0.04} />
    <Voice />
    <Audio src={staticFile('music-deck.mp3')} volume={musicVolume} />
  </AbsoluteFill>
);
