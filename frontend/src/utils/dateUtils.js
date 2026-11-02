/**
 * Returns a time-based greeting string in Portuguese.
 * Used in the HomePage header to personalize the user's experience.
 *
 * @returns {'Bom dia'|'Boa tarde'|'Boa noite'}
 */
export function getTimeBasedGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return 'Bom dia';
  if (currentHour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Formats the current date and time in Brazilian Portuguese locale.
 * Returns a string like "segunda-feira, 29 de setembro, às 10:25".
 *
 * @returns {string} Formatted date and time string
 */
export function formatCurrentDateTime() {
  return new Date().toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}


/**
 * Returns a time-based string indicating how long ago a date occurred.
 * Used in the NewsPage to show the relative time of each article.
 *
 * @param {string} dataIso - The date in ISO format
 * @returns {string} A string indicating the time elapsed
 */
export const timeElapsed = (dataIso) => {
  if (!dataIso) return 'Recente';

  const dataPublicacao = new Date(dataIso);
  const agora = new Date();
  const diferencaEmSegundos = Math.floor((agora - dataPublicacao) / 1000);

  // Intervalos em segundos
  const minutos = Math.floor(diferencaEmSegundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  const meses = Math.floor(dias / 30);
  const anos = Math.floor(dias / 365);

  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  if (anos > 0) return rtf.format(-anos, 'year');
  if (meses > 0) return rtf.format(-meses, 'month');
  if (dias > 0) return rtf.format(-dias, 'day');
  if (horas > 0) return rtf.format(-horas, 'hour');
  if (minutos > 0) return rtf.format(-minutos, 'minute');

  return 'agora mesmo';
};