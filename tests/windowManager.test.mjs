import test from 'node:test';
import assert from 'node:assert/strict';
import { activateWindow, createDesktopWindows, fitRect, moveRect, resizeRect, taskbarWindow } from '../src/windowManager.ts';

const bounds = { width: 1280, height: 758 };
const minimum = { width: 280, height: 220 };
const rect = { x: 120, y: 90, width: 450, height: 330 };
const inside = (result, area) => {
  assert.ok(result.x >= 0 && result.y >= 0);
  assert.ok(result.x + result.width <= area.width);
  assert.ok(result.y + result.height <= area.height);
};

test('opening and focusing another section keeps existing windows open', () => {
  const desktop = createDesktopWindows(bounds);
  const opened = activateWindow(activateWindow(desktop, 'Life'), 'Messenger');
  assert.equal(opened.Command.status, 'open');
  assert.equal(opened.Life.status, 'open');
  assert.equal(opened.Explorer.status, 'closed');
  assert.equal(opened.Messenger.status, 'open');
  assert.ok(opened.Messenger.z > opened.Command.z);
  const focused = activateWindow(opened, 'Command');
  assert.equal(focused.Messenger.status, 'open');
  assert.ok(focused.Command.z > focused.Messenger.z);
});

test('taskbar minimizes an active window and restores its size and position', () => {
  const opened = activateWindow(createDesktopWindows(bounds), 'Web');
  const minimized = taskbarWindow(opened, 'Web');
  assert.equal(minimized.Web.status, 'minimized');
  assert.equal(minimized.Command.status, 'open');
  const restored = taskbarWindow(minimized, 'Web');
  assert.equal(restored.Web.status, 'open');
  for (const key of ['x', 'y', 'width', 'height', 'maximized']) assert.equal(restored.Web[key], opened.Web[key]);
});

test('taskbar focuses an inactive open window before minimizing it', () => {
  const opened = activateWindow(createDesktopWindows(bounds), 'Web');
  const focused = taskbarWindow(opened, 'Command');
  assert.equal(focused.Command.status, 'open');
  assert.equal(focused.Web.status, 'open');
  assert.ok(focused.Command.z > focused.Web.z);
});

test('dragging cannot lose a window outside the desktop', () => {
  assert.deepEqual(moveRect(rect, -1000, -1000, bounds), { ...rect, x: 0, y: 0 });
  assert.deepEqual(moveRect(rect, 1000, 1000, bounds), { ...rect, x: 830, y: 428 });
});

test('resizing from the top left preserves the opposite corner', () => {
  const resized = resizeRect(rect, 'nw', -40, -30, bounds, minimum);
  assert.deepEqual(resized, { x: 80, y: 60, width: 490, height: 360 });
  assert.equal(resized.x + resized.width, rect.x + rect.width);
  assert.equal(resized.y + resized.height, rect.y + rect.height);
});

test('all eight resize directions respect minimum sizes and desktop edges', () => {
  for (const edge of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
    for (const delta of [-2000, -400, 0, 100, 2000]) {
      const resized = resizeRect(rect, edge, delta, delta, bounds, minimum);
      inside(resized, bounds);
      assert.ok(resized.width >= minimum.width);
      assert.ok(resized.height >= minimum.height);
    }
  }
});

test('viewport shrink keeps windows reachable even below their usual minimum', () => {
  for (const area of [{ width: 390, height: 700 }, { width: 80, height: 60 }]) {
    const resized = fitRect({ x: 950, y: 650, width: 830, height: 520 }, area, minimum);
    inside(resized, area);
    assert.equal(resized.width, Math.min(830, area.width));
    assert.equal(resized.height, Math.min(520, area.height));
  }
});

test('initial windows stay inside both desktop and small-screen bounds', () => {
  for (const area of [bounds, { width: 390, height: 760 }, { width: 720, height: 460 }]) {
    const desktop = createDesktopWindows(area);
    for (const window of Object.values(desktop)) inside(window, area);
    assert.equal(desktop.Command.status, 'open');
    assert.equal(desktop.Life.status, 'closed');
    assert.equal(desktop.Explorer.status, 'closed');
  }
});

 test('opening chronology changes only on fresh opens, not focus or restore', () => {
   const initial = createDesktopWindows(bounds);
   assert.deepEqual(Object.entries(initial).filter(([, window]) => window.status === 'open').map(([id]) => id), ['Command']);
   const messenger = activateWindow(initial, 'Messenger');
   const web = activateWindow(messenger, 'Web');
   assert.ok(initial.Command.openedAt < web.Messenger.openedAt);
   assert.ok(web.Messenger.openedAt < web.Web.openedAt);
   assert.equal(activateWindow(web, 'Messenger').Messenger.openedAt, web.Messenger.openedAt);
   const restored = taskbarWindow(taskbarWindow(web, 'Web'), 'Web');
   assert.equal(restored.Web.openedAt, web.Web.openedAt);
   const closed = { ...web, Messenger: { ...web.Messenger, status: 'closed' } };
   assert.ok(activateWindow(closed, 'Messenger').Messenger.openedAt > web.Web.openedAt);
 });
