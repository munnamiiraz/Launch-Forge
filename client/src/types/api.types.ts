export interface ApiResponse<TData = unknown> {
    success: true;
    message: string;
    data : TData;
    meta ?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export interface ApiErrorResponse {
    success: false;
    message: string;
}