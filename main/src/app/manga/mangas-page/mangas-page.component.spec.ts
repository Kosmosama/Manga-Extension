import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangasPageComponent } from './mangas-page.component';

describe('MangasPageComponent', () => {
  let component: MangasPageComponent;
  let fixture: ComponentFixture<MangasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MangasPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MangasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
