/**
 * 获取process.env对应的属性值
 * @param prop 属性名
 * @param transform 转换属性值
 * @returns
 */
export function env<T>(prop: keyof T): string;
export function env<T, D>(prop: keyof T, transform: (value: string) => D): D;
export function env<T, D>(prop: keyof T, transform?: (value: string) => D) {
  const value = process.env[prop as unknown as string];
  if (value == null) {
    throw new Error('');
  }
  if (typeof transform === 'function') {
    return transform.call(undefined, value);
  }
  return value;
}
