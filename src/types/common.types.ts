//Response
export interface IServiceResponse<T = null> {
    success: boolean,
    error?: string,
    data?: T
}