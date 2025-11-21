import { Component, input } from '@angular/core';

@Component({
    selector: 'skeleton',
    standalone: true,
    templateUrl: './skeleton.component.html',
    styleUrl: './skeleton.component.css'
})
export class SkeletonComponent {
    kind = input<'card' | 'line'>('line');
}