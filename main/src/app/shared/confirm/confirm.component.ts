import { Component, effect, inject, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ModalComponent } from '../modal/modal.component';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
    selector: 'confirm',
    standalone: true,
    imports: [ModalComponent, TranslocoPipe],
    templateUrl: './confirm.component.html',
    styleUrl: './confirm.component.css'
})
export class ConfirmComponent {
    confirmService = inject(ConfirmService);

    modal = viewChild.required<ModalComponent>('modal');

    constructor() {
        effect(() => {
            const req = this.confirmService.request();
            if (req) {
                this.modal().open();
            } else {
                try { this.modal().close(); } catch { /* ignored */ }
            }
        });
    }

    onCancel() {
        this.confirmService.cancel();
    }

    onConfirm() {
        this.confirmService.resolve(true);
    }
}