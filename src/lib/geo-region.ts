/**
 * Auto-detect user's country code (ISO 3166-1 alpha-2) using browser timezone and locale
 */
export function getDefaultUserRegion(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    
    // Map common browser timezones to ISO 3166-1 country codes
    if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.includes('Asia/Colombo')) {
      return 'IN';
    }
    if (timeZone.includes('London') || timeZone.includes('Belfast') || timeZone.includes('Europe/Dublin')) {
      return 'GB';
    }
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver') || timeZone.includes('Edmonton') || timeZone.includes('Winnipeg')) {
      return 'CA';
    }
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Brisbane') || timeZone.includes('Perth')) {
      return 'AU';
    }
    if (timeZone.includes('Paris') || timeZone.includes('Monaco')) {
      return 'FR';
    }
    if (timeZone.includes('Berlin') || timeZone.includes('Frankfurt') || timeZone.includes('Vienna') || timeZone.includes('Zurich')) {
      return 'DE';
    }
    if (timeZone.includes('Tokyo') || timeZone.includes('Asia/Seoul')) {
      return timeZone.includes('Seoul') ? 'KR' : 'JP';
    }
    if (timeZone.includes('America/New_York') || timeZone.includes('America/Chicago') || timeZone.includes('America/Denver') || timeZone.includes('America/Los_Angeles')) {
      return 'US';
    }

    // Secondary fallback: inspect navigator.language (e.g. "en-IN", "en-GB", "en-CA")
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toUpperCase();
    const parts = lang.split('-');
    if (parts.length > 1 && parts[1].length === 2) {
      return parts[1];
    }
  } catch (e) {
    console.warn('Geo region detection fallback to US', e);
  }

  return 'US';
}
