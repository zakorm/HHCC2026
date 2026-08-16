import { Text, View } from 'react-native';

type MasteryRowProps = {
  topic: string;
  percent: number;
};

function hsvToHex(h: number, s: number, v: number): string {
  // h: 0–360, s: 0–100, v: 0–100
  s /= 100;
  v /= 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h < 60)       [r, g, b] = [c, x, 0];
  else if (h < 120)  [r, g, b] = [x, c, 0];
  else if (h < 180)  [r, g, b] = [0, c, x];
  else if (h < 240)  [r, g, b] = [0, x, c];
  else if (h < 300)  [r, g, b] = [x, 0, c];
  else               [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function interpolateHsv(hex1: string, hex2: string, percent: number): string {
  // percent: 0–100 (0 = hex1, 100 = hex2)
  const t = percent / 100;

  const c1 = hexToHsv(hex1);
  const c2 = hexToHsv(hex2);

  // Interpolate hue along the shortest path around the color wheel
  let dh = c2.h - c1.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  let h = c1.h + dh * t;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;

  const s = c1.s + (c2.s - c1.s) * t;
  const v = c1.v + (c2.v - c1.v) * t;

  return hsvToHex(h, s, v);
}


export function MasteryRow({ topic, percent }: MasteryRowProps) {
  const barColor = interpolateHsv('#FF3B30', '#4CAF50', percent);

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-body-ink">{topic}</Text>
        <View className={"rounded-pill px-2 py-[3px]"} style={{backgroundColor: percent < 50 ? '#FDEEDF' : '#E9F6EA'}}>
          <Text className="font-body-medium text-small" style={{color: percent < 25 ? '#FF3B30' : percent < 50 ? '#F2994A' : percent < 75 ? '#4CAF50' : '#2E7D32'}}>
            {percent < 50 ? (percent < 25 ? '!Danger Zone!' : 'Needs work') : (percent < 75 ? 'Good' : 'Excellent')}
          </Text>
        </View>
      </View>
      <View className="h-1.5 overflow-hidden rounded-pill bg-line">
        <View
          className={`h-full rounded-pill `}
          style={{ width: `${percent}%`, backgroundColor: barColor}}
        />
      </View>
    </View>
  );
}
