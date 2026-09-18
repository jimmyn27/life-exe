export type WindowId = 'Command' | 'Life' | 'Explorer' | 'Web' | 'Messenger';
export type Bounds = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type WindowState = Rect & { status: 'open' | 'minimized' | 'closed'; maximized: boolean; z: number; openedAt: number };
export type DesktopWindows = Record<WindowId, WindowState>;
export type ResizeEdge = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
export const windowIds: WindowId[] = ['Command', 'Life', 'Explorer', 'Web', 'Messenger'];
export const minimumSize: Record<WindowId, Bounds> = {
  Command: { width: 280, height: 200 }, Life: { width: 300, height: 320 }, Explorer: { width: 320, height: 280 },
  Web: { width: 300, height: 260 }, Messenger: { width: 240, height: 260 }
};
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function fitRect(rect: Rect, bounds: Bounds, minimum: Bounds): Rect {
  const width = clamp(rect.width, Math.min(minimum.width, bounds.width), bounds.width);
  const height = clamp(rect.height, Math.min(minimum.height, bounds.height), bounds.height);
  return { width, height, x: clamp(rect.x, 0, bounds.width - width), y: clamp(rect.y, 0, bounds.height - height) };
}
export function moveRect(rect: Rect, dx: number, dy: number, bounds: Bounds): Rect {
  return { ...rect, x: clamp(rect.x + dx, 0, bounds.width - rect.width), y: clamp(rect.y + dy, 0, bounds.height - rect.height) };
}
export function resizeRect(rect: Rect, edge: ResizeEdge, dx: number, dy: number, bounds: Bounds, minimum: Bounds): Rect {
  const minWidth = Math.min(minimum.width, bounds.width);
  const minHeight = Math.min(minimum.height, bounds.height);
  let { x, y, width, height } = rect;
  if (edge.includes('e')) width = clamp(width + dx, minWidth, bounds.width - x);
  if (edge.includes('s')) height = clamp(height + dy, minHeight, bounds.height - y);
  if (edge.includes('w')) { const right = x + width; x = clamp(x + dx, 0, right - minWidth); width = right - x; }
  if (edge.includes('n')) { const bottom = y + height; y = clamp(y + dy, 0, bottom - minHeight); height = bottom - y; }
  return { x, y, width, height };
}
export function activateWindow(windows: DesktopWindows, id: WindowId): DesktopWindows {
  const z = Math.max(...Object.values(windows).map(window => window.z)) + 1;
  return { ...windows, [id]: { ...windows[id], status: 'open', z, openedAt: windows[id].status === 'closed' ? Math.max(...Object.values(windows).map(window => window.openedAt)) + 1 : windows[id].openedAt } };
}
export function taskbarWindow(windows: DesktopWindows, id: WindowId): DesktopWindows {
  const front = windowIds.filter(key => windows[key].status === 'open').sort((a, b) => windows[b].z - windows[a].z)[0];
  if (windows[id].status === 'open' && front === id) return { ...windows, [id]: { ...windows[id], status: 'minimized' } };
  return activateWindow(windows, id);
}
export function createDesktopWindows(bounds: Bounds): DesktopWindows {
  const compact = bounds.width <= 670;
  const origin = compact ? 10 : 120;
  const mainWidth = compact ? bounds.width - 20 : Math.min(800, bounds.width - 440);
  const mainHeight = compact ? Math.max(240, bounds.height - 190) : Math.min(490, bounds.height - 145);
  const base = { status: 'closed' as const, maximized: false, z: 0, openedAt: 0 };
  const main = { x: origin, y: compact ? 55 : 28, width: mainWidth, height: mainHeight };
  const result = Object.fromEntries(windowIds.map((id, i) => [id, {
    ...base, ...fitRect({ ...main, x: origin + i * 26, y: (compact ? 65 : 55) + i * 30, width: Math.min(bounds.width - 20, 720), height: Math.min(bounds.height - 90, 520) }, bounds, minimumSize[id])
  }])) as DesktopWindows;
  result.Command = { ...base, ...fitRect(main, bounds, minimumSize.Command), status: 'open', z: 2, openedAt: 1 };
  result.Life = { ...base, ...fitRect({ x: compact ? 20 : bounds.width - 360, y: 28, width: compact ? bounds.width - 30 : 340, height: Math.min(500, bounds.height - 130) }, bounds, minimumSize.Life), status: 'closed', z: 0 };
  result.Explorer = { ...base, ...fitRect({ x: compact ? 20 : 150, y: 65, width: Math.min(740, bounds.width - 30), height: Math.min(500, bounds.height - 130) }, bounds, minimumSize.Explorer) };
  result.Messenger = { ...base, ...fitRect({ x: bounds.width - 330, y: 80, width: 310, height: Math.min(480, bounds.height - 135) }, bounds, minimumSize.Messenger) };
  return result;
}
