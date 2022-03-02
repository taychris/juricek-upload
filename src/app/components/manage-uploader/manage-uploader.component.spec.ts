import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUploaderComponent } from './manage-uploader.component';

describe('ManageUploaderComponent', () => {
  let component: ManageUploaderComponent;
  let fixture: ComponentFixture<ManageUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageUploaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
