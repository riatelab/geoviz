/**
 * @function tool/addonts
 * @description The `tool.addonts` function allows add font to the document from an url.
 * @property {string} fontFamily - font family name
 * @property {string} url - tff- file url
 */
export async function addfonts(fonts) {
  if (!window.__geoviz_fonts__) {
    window.__geoviz_fonts__ = [];
  }

  for (const f of fonts) {
    const fontFace = new FontFace(f.fontFamily, `url(${f.url})`, {
      style: f.style,
      weight: f.weight,
      stretch: f.stretch,
    });

    await fontFace.load();
    document.fonts.add(fontFace);

    const base64 = await fontToBase64(f.url);
    window.__geoviz_fonts__.push({
      ...f,
      base64,
      format: getFormat(f.url),
    });
  }

  return fonts;
}

async function fontToBase64(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();

  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function getFormat(url) {
  if (url.endsWith(".woff2")) return "woff2";
  if (url.endsWith(".woff")) return "woff";
  if (url.endsWith(".ttf")) return "truetype";
  return "woff2";
}
