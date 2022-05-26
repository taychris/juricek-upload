export class SetAlbumTitle {
    static readonly type = '[app] set albumTitle';
    constructor(public albumTitleDisplay: string, public albumTitleFormatted: string, public fsId: string, public coverChosen: boolean) {}
}

export class SetAlbumTitleBefore {
    static readonly type = '[app] set albumTitleBefore';
    constructor(public payload1: string, public payload2: string) {}
}

export class ConfirmAlbum {
    static readonly type = '[app] confirm album';
}

export class AlbumSuccess {
    static readonly type = '[app] album created';
}

export class AlbumCancelled {
    static readonly type = '[app] album cancelled';
}

export class AlbumCleared {
    static readonly type = '[app] album cleared';
}

export class SetFileNameErrorList {
    static readonly type = '[app] set error file list';
    constructor(public payload: string) {}
}

export class UpdateCoverStatus {
    static readonly type = '[app] cover status updated.';
    constructor(public payload: boolean) {}
}

export class SetCoverImageId {
    static readonly type = '[app] cover image id set.';
    constructor(public payload: string) {}
}

export class SetCoverImageIdBefore {
    static readonly type = '[app] cover image id before set.';
    constructor(public payload: string) {}
}

export class SetCategoryDetails {
    static readonly type = '[app] set category details.';
    constructor(public categoryTitle: string, public categoryDownloadURL: string, public categoryDownloadURLBefore: string, public categoryId: string) {}
}

export class ResetCategoryDetails {
    static readonly type = '[app] reset category details.';
}