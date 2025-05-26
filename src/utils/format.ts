/**
 * Formata um número de telefone para o formato internacional
 * @param phone Número de telefone (com ou sem formatação)
 * @returns Número formatado ou null se inválido
 */
export function formatPhone(phone: string): string | null {
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Verifica se é um número válido (13 dígitos para números brasileiros com DDD)
  if (numbers.length !== 13 && numbers.length !== 12) {
    return null;
  }
  
  // Formata o número no padrão +55 (11) 9 9999-9999
  const countryCode = numbers.slice(0, 2);
  const areaCode = numbers.slice(2, 4);
  const firstPart = numbers.slice(4, 5);
  const secondPart = numbers.slice(5, 9);
  const thirdPart = numbers.slice(9);
  
  return `+${countryCode} (${areaCode}) ${firstPart} ${secondPart}-${thirdPart}`;
}

/**
 * Calcula o tempo total estimado para envio das mensagens
 * @param contacts Número de contatos
 * @param interval Intervalo entre mensagens em segundos
 * @returns Objeto com tempo total em diferentes formatos
 */
export function calculateTotalTime(contacts: number, interval: number) {
  const totalSeconds = contacts * interval;
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  let formatted = '';
  if (hours > 0) formatted += `${hours}h `;
  if (minutes > 0) formatted += `${minutes}m`;
  if (seconds > 0 && hours === 0) formatted += ` ${seconds}s`;
  formatted = formatted.trim();
  
  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    formatted
  };
}

/**
 * Formata um número como porcentagem
 * @param value Número a ser formatado
 * @param decimals Número de casas decimais
 * @returns String formatada com %
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata um número grande de forma legível
 * @param value Número a ser formatado
 * @returns String formatada (ex: 1.2k, 1.5M)
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
} 