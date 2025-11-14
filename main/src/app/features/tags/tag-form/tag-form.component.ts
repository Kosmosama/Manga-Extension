import { Component, inject, input, output } from '@angular/core';
import { Tag } from '../../../core/interfaces/tag.interface';
import { TagService } from '../../../core/services/tag.service';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'tag-form',
    imports: [ReactiveFormsModule, TranslocoPipe],
    templateUrl: './tag-form.component.html',
    styleUrl: './tag-form.component.css'
})
export class TagFormComponent {
    private tagService = inject(TagService);
    private fb = inject(NonNullableFormBuilder);

    tag = input<Tag | null>();

    formSumbitted = output<Tag>();

    tagForm = this.fb.group({
        name: ["", [Validators.required, Validators.minLength(3)]],
        color: ["#ffffff"], //#TODO Color wheel
    });

    ngOnInit() {
        
        if (this.tag()) {
            this.tagForm.patchValue({
                name: this.tag()!.name,
                color: this.tag()!.color || "#ffffff",
            });
            this.tagForm.markAllAsTouched();
        }
    }

    /**
     * Handles the form submission.
     * If the tag is new, it will be added to the database.
     * If the tag already exists, it will be updated.
     */
    submit() {
        if (this.tagForm.invalid) return;

        const newTag: Tag = {
            ...this.tagForm.getRawValue(),
            id: Number(`${Date.now()}${Math.floor(Math.random() * 10000)}`)
        };

        if(this.tag()) {
            this.tagService.addTag(newTag).subscribe({
                next: () => {
                    this.formSumbitted.emit(newTag);
                    console.log("Tag added successfully");
                },
                error: (err) => console.error("Errpr:", err)
            });
        }
        else {
            this.tagService.updateTag(this.tag()!.id, newTag).subscribe({
                next: () => {
                    this.formSumbitted.emit(newTag);
                    console.log("Tag updated successfully");
                },
                error: (err) => console.error("Errpr:", err)
            });
        }
    }
}
