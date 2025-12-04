import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    private http = inject(HttpClient);

    getTranslation(lang: string): Observable<any> {
        return this.http.get(`/assets/i18n/${lang}.json`);
    }
}