/** Clé de fichier audio stable : partagée par l'application et le script de génération. */
export function audioKey(lang: 'en' | 'fr', text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  // petit hachage pour distinguer les textes longs proches
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return `${lang}/${slug}-${(h % 46656).toString(36)}`;
}
