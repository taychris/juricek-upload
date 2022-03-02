import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateCategoryListComponent } from './private-category-list.component';

describe('PrivateCategoryListComponent', () => {
  let component: PrivateCategoryListComponent;
  let fixture: ComponentFixture<PrivateCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateCategoryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
