import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAlbumComponent } from './manage-album.component';

describe('ManageAlbumComponent', () => {
  let component: ManageAlbumComponent;
  let fixture: ComponentFixture<ManageAlbumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageAlbumComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
