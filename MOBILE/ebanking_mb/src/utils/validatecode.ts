
export const validateCodeWithMessage = (codes: string[]): string | null => {
  if (codes.some(c => c.trim() === '')) return 'empty';
  if (codes.length !== 6) return 'length';
  if (!codes.every(c => /^\d$/.test(c))) return 'number';
  if (new Set(codes).size !== codes.length)
    return 'duplicate';
  return null; // hợp lệ
};
