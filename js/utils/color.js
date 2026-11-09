// "rgb(r, g, b)" -> [h, s, l] (h in degrees, s/l in 0..100)
export function rgbStringToHsl(color) {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? [255, 0, 127])
    .slice(0, 3)
    .map((value) => Number(value) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return [0, 0, lightness * 100];
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  return [(hue * 60 + 360) % 360, saturation * 100, lightness * 100];
}
