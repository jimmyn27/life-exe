// Keep closed programs in their slots while rearranging the currently visible buttons.
export function reorderVisible<T>(order: T[], visible: T[], dragged: T, index: number): T[] {
  if (!visible.includes(dragged)) return order;
  const next = visible.filter(item => item !== dragged);
  next.splice(Math.max(0, Math.min(index, next.length)), 0, dragged);
  let cursor = 0;
  return order.map(item => visible.includes(item) ? next[cursor++] : item);
}
