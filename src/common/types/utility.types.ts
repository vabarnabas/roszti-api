export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Extend<T, U = void> = T & U;
