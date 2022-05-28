import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAlbumTitleComponent } from './create-album-title.component';

describe('CreateAlbumTitleComponent', () => {
  let component: CreateAlbumTitleComponent;
  let fixture: ComponentFixture<CreateAlbumTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAlbumTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAlbumTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
