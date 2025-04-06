import { Injectable, OnDestroy } from '@angular/core';
import { Subject, fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class KeyPressService implements OnDestroy {
  private keyPressSubject = new Subject<KeyboardEvent>();
  public keyPress$ = this.keyPressSubject.asObservable();
  private documentKeyPressSubscription: Subscription | null = null;

  constructor() {
    this.listenToGlobalKeyPresses();
  }

  private listenToGlobalKeyPresses(): void {
    if (typeof document !== 'undefined') {
      this.documentKeyPressSubscription = fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(
          filter(event => {
            const target = event.target as HTMLElement;
            const tagName = target?.tagName?.toUpperCase();
            return tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT';
          }),
        )
        .subscribe(event => {
          this.keyPressSubject.next(event);
        });
    }
  }

  ngOnDestroy(): void {
    if (this.documentKeyPressSubscription) {
      this.documentKeyPressSubscription.unsubscribe();
    }
    this.keyPressSubject.complete();
  }
}