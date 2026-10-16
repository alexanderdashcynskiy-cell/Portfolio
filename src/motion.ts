/**
 * Shared state of a gesture-driven page transition ("scrub"): while a trackpad or finger
 * drags between two pages, `p` runs 0..1 from page `from` toward page `to`. Components that
 * animate imperatively (the card deck) read it each frame.
 */
export const scrub = { from: -1, to: -1, p: 0 };
