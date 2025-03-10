import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsCardComponent } from './tag-card.component';

describe('TagsCardComponent', () => {
  let component: TagsCardComponent;
  let fixture: ComponentFixture<TagsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
