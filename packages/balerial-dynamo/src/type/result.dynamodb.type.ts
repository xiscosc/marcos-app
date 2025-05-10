export interface IDynamoPaginatedResult<T> {
	elements: T[];
	endKey?: Record<string, string | number>;
}
