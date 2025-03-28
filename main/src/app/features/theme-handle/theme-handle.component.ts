import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { Theme } from '../../core/interfaces/theme.interface';

@Component({
  selector: 'app-theme-handle',
  imports: [],
  templateUrl: './theme-handle.component.html',
  styleUrl: './theme-handle.component.css'
})
export class ThemeHandleComponent {
    protected themeService = inject(ThemeService);
    
    themeChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const theme = target.value === 'light' ? Theme.Light : Theme.Dark;
        this.themeService.setTheme(theme);
    }
}
