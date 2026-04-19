export interface ApiResponseData<T> {
  success: boolean;
  message?: string;
  data?: T;
}
