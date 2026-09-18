import test from 'node:test';
import assert from 'node:assert/strict';
import { reorderVisible } from '../src/desktopLayout.ts';

test('taskbar dragging reorders visible programs without losing closed program slots', () => {
  const order = ['Life', 'Explorer', 'Web', 'Messenger'];
  const visible = ['Life', 'Web', 'Messenger'];
  const result = reorderVisible(order, visible, 'Life', 2);
  assert.deepEqual(result, ['Web', 'Explorer', 'Messenger', 'Life']);
  assert.deepEqual(order, ['Life', 'Explorer', 'Web', 'Messenger']);
  assert.equal(new Set(result).size, 4);
  assert.deepEqual(reorderVisible(result, ['Web', 'Messenger', 'Life'], 'Life', 0), order);
});

test('dropping beyond either end clamps the order and unavailable programs cannot be dragged', () => {
  const order = ['Life', 'Web', 'Messenger'];
  assert.deepEqual(reorderVisible(order, order, 'Web', -10), ['Web', 'Life', 'Messenger']);
  assert.deepEqual(reorderVisible(order, order, 'Web', 100), ['Life', 'Messenger', 'Web']);
  assert.deepEqual(reorderVisible(order, ['Web', 'Messenger'], 'Life', 0), order);
});
