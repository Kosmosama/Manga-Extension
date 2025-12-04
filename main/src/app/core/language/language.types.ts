export type LanguageCode = 'en' | 'es' | 'de' | 'fr' | 'dev';

export interface LanguageSettings {
    current: LanguageCode;
    available: LanguageCode[];
}