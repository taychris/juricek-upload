import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCategoryUploaderComponent } from './create-category-uploader.component';

describe('CreateCategoryUploaderComponent', () => {
  let component: CreateCategoryUploaderComponent;
  let fixture: ComponentFixture<CreateCategoryUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCategoryUploaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCategoryUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
