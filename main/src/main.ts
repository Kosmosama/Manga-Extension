import "reflect-metadata";
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { inject, provideAppInitializer } from "@angular/core";
import { ThemeService } from "./app/settings/services/theme.service";

bootstrapApplication(AppComponent, {
  providers: [
    provideAppInitializer(() => {
      inject(ThemeService);
    })
  ],
});