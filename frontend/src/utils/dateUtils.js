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
 * Returns a human-readable relative time string in Portuguese (e.g. "Há 10 min", "Há 2 h").
 *
 * @param {string|Date} dateString - The ISO date or timestamp
 * @returns {string} Formatted relative time
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return 'Recente';
  const diffInMinutes = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 60000,
  );
  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Há ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
}

