import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ToastService } from '../../core/services/toast.service';

@Component({
    selector: 'toast',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.css'
})
export class ToastComponent {
    toastService = inject(ToastService);

    dismiss(id: number) {
        this.toastService.dismiss(id);
    }
}