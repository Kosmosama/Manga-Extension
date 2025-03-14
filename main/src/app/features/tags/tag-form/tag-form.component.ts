import { Component, input, output } from '@angular/core';
import { Tag } from '../../../core/interfaces/tag.interface';

@Component({
    selector: 'tag-form',
    imports: [],
    templateUrl: './tag-form.component.html',
    styleUrl: './tag-form.component.css'
})
export class TagFormComponent {
    tag = input<Tag | null>();

    formSumbitted = output<Tag>();
}
