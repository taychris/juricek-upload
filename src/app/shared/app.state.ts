import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetAlbumTitle, ConfirmAlbum, AlbumSuccess, AlbumCancelled, AlbumCleared, UpdateCoverStatus, SetAlbumTitleBefore, SetCoverImageId, SetCoverImageIdBefore, SetCategoryDetails, ResetCategoryDetails } from './app.actions';
import { tap, map, first, delay } from 'rxjs/operators';

export interface AppStateModel {
  albumTitleDisplay: string;
  albumTitleFormatted: string;
  coverImageId: string,
  coverImageIdBefore: string,
  fsId: string;
  coverChosen: boolean;
  status: '' | 'pending' | 'confirmed' | 'cancelled';
  categoryTitle: string;
  categoryDownloadURL: string;
  categoryDownloadURLBefore: string;
  categoryId: string;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    albumTitleDisplay: '',
    albumTitleFormatted: '',
    coverImageId: '',
    coverImageIdBefore: '',
    fsId: '',
    coverChosen: false,
    status: '',
    categoryTitle: '',
    categoryDownloadURL: '',
    categoryDownloadURLBefore: '',
    categoryId: ''
  }
})
export class AppState {
  constructor() {}

  @Selector()
    static albumTitleDisplay(state: AppStateModel) {
      return state.albumTitleDisplay;
    }
  @Selector()
    static albumTitleFormatted(state: AppStateModel) {
      return state.albumTitleFormatted;
    }
  @Selector()
    static coverImageId(state: AppStateModel) {
      return state.coverImageId;
    }
  @Selector()
    static coverImageIdBefore(state: AppStateModel) {
      return state.coverImageIdBefore;
    }
  @Selector()
    static fsId(state: AppStateModel) {
      return state.fsId;
    }
  @Selector() 
    static coverChosen(state: AppStateModel) {
      return state.coverChosen;
    }
  @Selector()
    static status(state: AppStateModel) {
      return state.status;
    }
  @Selector()
    static categoryTitle(state: AppStateModel) {
      return state.categoryTitle;
    }
  @Selector()
    static categoryDownloadURL(state: AppStateModel) {
      return state.categoryDownloadURL;
    }
  @Selector()
    static categoryDownloadURLBefore(state: AppStateModel) {
      return state.categoryDownloadURLBefore;
    }
  @Selector()
    static categoryId(state: AppStateModel) {
      return state.categoryId;
    }
    
  @Action(SetAlbumTitle)
  setAlbumTitle({ patchState }: StateContext<AppStateModel>, { albumTitleDisplay, albumTitleFormatted, fsId, coverChosen }: SetAlbumTitle) {
    patchState({ albumTitleDisplay: albumTitleDisplay, albumTitleFormatted: albumTitleFormatted, fsId: fsId, coverChosen: coverChosen, status: 'pending' });
  }    

  @Action(SetAlbumTitleBefore)
  setAlbumTitleBefore({ patchState }: StateContext<AppStateModel>, { payload1, payload2 }: SetAlbumTitleBefore) {
    patchState({ albumTitleDisplay: payload1, albumTitleFormatted: payload2 });
  }

  @Action(ConfirmAlbum, { cancelUncompleted: true })
  confirmAlbum({ dispatch, patchState }: StateContext<AppStateModel>) {
    patchState({ status: 'pending' });
  }

  @Action(AlbumSuccess)
  albumSuccess({ patchState }: StateContext<AppStateModel>) {
    patchState({ status: 'confirmed' });
  }

  @Action(AlbumCancelled)
  albumCancelled({ patchState }: StateContext<AppStateModel>) {
    patchState({ albumTitleDisplay: '', albumTitleFormatted: '', coverImageId: '', coverImageIdBefore: '', fsId: '', coverChosen: false, status: '' });
  }

  @Action(AlbumCleared)
  albumCleared({ patchState }: StateContext<AppStateModel>) {
    patchState({ albumTitleDisplay: '', albumTitleFormatted: '', coverChosen: false, status: '', coverImageId: '' });
  }

  @Action(UpdateCoverStatus)
  updateCoverStatus({ patchState }: StateContext<AppStateModel>, { payload }: UpdateCoverStatus) {
    patchState({ coverChosen: payload });
  }

  @Action(SetCoverImageId)
  setCoverImageId({ patchState }: StateContext<AppStateModel>, { payload }: SetCoverImageId) {
    patchState({ coverImageId : payload, coverChosen: true });
  }

  @Action(SetCoverImageIdBefore)
  setCoverImageIdBefore({ patchState }: StateContext<AppStateModel>, { payload }: SetCoverImageIdBefore) {
    patchState({ coverImageIdBefore : payload });
  }

  @Action(SetCategoryDetails)
  setCategoryDetails({ patchState }: StateContext<AppStateModel>, { categoryTitle, categoryDownloadURL, categoryDownloadURLBefore, categoryId }: SetCategoryDetails) {
    patchState({ categoryTitle : categoryTitle,  categoryDownloadURL: categoryDownloadURL, categoryId: categoryId, categoryDownloadURLBefore: categoryDownloadURLBefore });
  }

  @Action(ResetCategoryDetails)
  resetCategoryDetails({ patchState }: StateContext<AppStateModel>) {
    patchState({ categoryTitle: '',  categoryDownloadURL: '', categoryDownloadURLBefore: '', categoryId: '' });
  }
}