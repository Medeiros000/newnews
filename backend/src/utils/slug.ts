/**
 * Gera um slug a partir de uma string de forma padronizada:
 * minúsculas, sem acentos, caracteres especiais removidos e separado por hífens.
 */
export function generateSlug(text: string): string {
	if (!text) return '';

	return text
		.normalize('NFD') // Decompõe caracteres acentuados
		.replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '') // Remove caracteres inválidos
		.replace(/\s+/g, '-') // Substitui espaços por hífen
		.replace(/-+/g, '-') // Remove hífens duplicados
		.replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
}
