import { Injectable, signal, computed, inject } from '@angular/core';
import { LanguageCode } from './language.types';
import { TranslocoService } from '@jsverse/transloco';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY = 'language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private storage = inject(StorageService);
    private transloco = inject(TranslocoService);

    private supported: LanguageCode[] = ['en', 'es', 'de', 'fr', 'dev'];

    private currentSignal = signal<LanguageCode>('en');
    current = computed(() => this.currentSignal());

    init() {
        const stored = this.storage.get<LanguageCode>(STORAGE_KEY, null as any);
        const sys = this.getSystemLanguage();
        const lang: LanguageCode =
            stored && this.isSupported(stored) ? stored :
                sys && this.isSupported(sys) ? sys : 'en';
        this.setLanguage(lang);
    }

    setLanguage(lang: LanguageCode) {
        if (!this.isSupported(lang)) return;
        this.currentSignal.set(lang);
        this.transloco.setActiveLang(lang);
        this.storage.set(STORAGE_KEY, lang);
    }

    getAvailable(): LanguageCode[] {
        return this.supported.slice();
    }

    private isSupported(lang: string): lang is LanguageCode {
        return this.supported.includes(lang as LanguageCode);
    }

    private getSystemLanguage(): LanguageCode | null {
        const nav = navigator?.language || (navigator as any)?.userLanguage;
        if (!nav) return null;
        const code = nav.toLowerCase().split('-')[0] as LanguageCode;
        return this.isSupported(code) ? code : null;
    }
}