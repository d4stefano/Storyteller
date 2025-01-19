export interface StoryRequest {
    title: string;
    genre: string;
    length: number; // in number of paragraphs
}

export interface StoryResponse {
    success: boolean;
    story?: string;
    error?: string;
}