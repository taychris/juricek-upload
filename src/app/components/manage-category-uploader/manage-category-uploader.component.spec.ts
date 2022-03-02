import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCategoryUploaderComponent } from './manage-category-uploader.component';

describe('ManageCategoryUploaderComponent', () => {
  let component: ManageCategoryUploaderComponent;
  let fixture: ComponentFixture<ManageCategoryUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCategoryUploaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCategoryUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
