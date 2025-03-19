import { inject, Injectable, OnInit, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
    providedIn: 'root'
})
export class SettingsService implements OnInit {
    private translocoService = inject(TranslocoService);

    readonly languages = signal(this.translocoService.getAvailableLangs());
    readonly activeLanguage = signal(this.translocoService.getDefaultLang());

    constructor() {
        console.log('SettingsService created');
    }

    ngOnInit() {
        this.translocoService.langChanges$.subscribe(lang => {
            this.activeLanguage.set(lang);
        });

        console.log(this.languages());
        console.log(this.activeLanguage());
    }

    changeLanguage(value: string) {
        this.translocoService.setActiveLang(value);
    }
}
