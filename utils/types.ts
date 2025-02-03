export interface ImageMeta {
    id: string;
    url: string;
    type: string;
    size: number;
    createdAt: Date;
    name: string;
}

export interface ImageSlice {
    data: Uint8Array
}