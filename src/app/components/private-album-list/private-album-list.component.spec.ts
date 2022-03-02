import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateAlbumListComponent } from './private-album-list.component';

describe('PrivateAlbumListComponent', () => {
  let component: PrivateAlbumListComponent;
  let fixture: ComponentFixture<PrivateAlbumListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateAlbumListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateAlbumListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
