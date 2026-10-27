import { continueRender, delayRender } from 'remotion';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/caveat/500.css';

// Hold the first frame until every face (with Cyrillic) is in, so no frame renders in a fallback font.
const handle = delayRender('fonts');
const sample = 'Аа Aa 0';
Promise.all([
  document.fonts.load(`500 40px Montserrat`, sample),
  document.fonts.load(`700 40px Montserrat`, sample),
  document.fonts.load(`800 40px Montserrat`, sample),
  document.fonts.load(`700 40px "Playfair Display"`, sample),
  document.fonts.load(`italic 700 40px "Playfair Display"`, sample),
  document.fonts.load(`500 40px "JetBrains Mono"`, sample),
  document.fonts.load(`500 40px Caveat`, sample),
]).then(() => continueRender(handle));
