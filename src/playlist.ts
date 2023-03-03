export interface Playlist {
    tracklist: Tracklist
}

export interface Tracklist {
    tracks: Track[]
}

export interface Track {
    offset: Offset,
    uris: URI[]
}

export interface Offset {
    start: number,
    end: number
}

export interface URI {
    id: string,
    uri: string
}
