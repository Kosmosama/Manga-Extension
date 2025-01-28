import { InjectionToken } from '@angular/core';
import { DataSource } from 'typeorm';

export const DATABASE_CONNECTION = new InjectionToken<DataSource>('DatabaseConnection');
