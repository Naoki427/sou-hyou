export function safeDecode(seg: string): string {
  try { return seg.includes("%") ? decodeURIComponent(seg) : seg; }
  catch { return seg; }
}
export const decodeSegments = (segs: string[] = []) => segs.map(safeDecode);
