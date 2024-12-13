export interface IPaginatedDtoResult<T> {
  elements: T[];
  endKey?: Record<string, string | number>;
}
