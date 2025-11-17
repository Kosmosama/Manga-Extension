import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates optional URL fields. Empty string passes.
 * Accepts http:// or https:// and basic domain/path.
 */
export function optionalUrlValidator(): ValidatorFn {
    const pattern = /^https?:\/\/\S+/i;
    return (control: AbstractControl): ValidationErrors | null => {
        const value = (control.value ?? '').trim();
        if (!value) return null;
        return pattern.test(value) ? null : { urlInvalid: true };
    };
}