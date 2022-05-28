import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCategoryTitleComponent } from './create-category-title.component';

describe('CreateCategoryTitleComponent', () => {
  let component: CreateCategoryTitleComponent;
  let fixture: ComponentFixture<CreateCategoryTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCategoryTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCategoryTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
