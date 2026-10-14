export const ADMIN_UID = 'U082BAyIb6Un3xEnGdYgg1GrTcs1';
export const DEFAULT_MAP = { url: '/assets/mapa-outubro-2026.webp', version: 'outubro-2026', width: 4096, height: 2893 };
export const actorFor = (user) => {
  if (!user?.uid) throw new Error('Entre novamente para salvar.');
  const login = (user.email || '').split('@')[0];
  return { uid: user.uid, email: user.email || '', name: login ? login.charAt(0).toUpperCase() + login.slice(1) : 'Colaborador' };
};
export const draftKey = (uid) => `diario_draft_v4_${uid}`;
export const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
export const emptyForm = (user) => ({ date: localDate(), startTime: '07:00', endTime: '17:00', responsible: user ? actorFor(user).name : '', weather: 'sun', crews: [], entries: [], photos: [], photoThumbnails: {}, photoUrl: '', notes: '' });
export const auditFields = (user, timestamp, existing) => {
  const actor = actorFor(user);
  return existing ? { updatedBy: actor, updatedAt: timestamp } : { authorId: actor.uid, responsible: actor.name, createdBy: actor, createdAt: timestamp, updatedBy: actor, updatedAt: timestamp };
};
export const fitDimensions = (width, height, maxEdge) => {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
};
export async function optimizeImage(file, maxEdge = 1600, quality = 0.8) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Escolha uma imagem JPG, PNG ou WebP.');
  if (file.size > 80 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 80 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const {width, height} = fitDimensions(img.naturalWidth, img.naturalHeight, maxEdge);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível preparar a imagem neste aparelho.');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob) throw new Error('Falha ao otimizar a imagem.');
    return { blob, width, height, extension: blob.type === 'image/webp' ? 'webp' : 'png' };
  } finally { URL.revokeObjectURL(url); }
}
export const formatBytes = (n) => `${(n / (1024 * 1024)).toFixed(2)} MB`;
export const formatAuditDate = (timestamp) => timestamp?.toDate ? timestamp.toDate().toLocaleString('pt-BR') : '';
export const logPayload = form => ({
  date: form.date, startTime: form.startTime, endTime: form.endTime,
  weather: form.weather, crews: form.crews, entries: form.entries,
  notes: form.notes || '', photos: form.photos || [], photoUrl: form.photoUrl || '',
  photoThumbnails: Object.fromEntries((form.photos || []).filter(url => form.photoThumbnails?.[url]).map(url => [url, form.photoThumbnails[url]])),
});
