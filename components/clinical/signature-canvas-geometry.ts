export function pointerToCanvasPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  bitmap: { width: number; height: number },
): { x: number; y: number } {
  const scaleX = rect.width > 0 ? bitmap.width / rect.width : 1;
  const scaleY = rect.height > 0 ? bitmap.height / rect.height : 1;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}
