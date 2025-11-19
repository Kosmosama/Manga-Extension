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

	/**
	 * Subscribes to `keydown` events on the `document` and forwards them
	 * unless the event originates from an editable input element.
	 * Ensures that global keyboard shortcuts only trigger in non-typing contexts.
	 */
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

	/**
	 * Cleans up the event subscription and completes the subject
	 * to avoid memory leaks when the service is destroyed.
	 */
	ngOnDestroy(): void {
		if (this.documentKeyPressSubscription) {
			this.documentKeyPressSubscription.unsubscribe();
		}
		this.keyPressSubject.complete();
	}
}
