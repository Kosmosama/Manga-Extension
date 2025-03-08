import { Component, viewChild } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'app-ejemplo',
    templateUrl: './ejemplo.component.html',
    imports: [ModalComponent]
})
export class EjemploComponent {
    modalComponent = viewChild.required<ModalComponent>('myModal');
    
    openModal() {
        this.modalComponent().open();
    }

    onModalClosed() {
        console.log('Modal cerrado');
    }

    confirmAction() {
        console.log('Acción confirmada');
    }
}
