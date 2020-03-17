/**
 * 格式化环境变量
 * @param key 环境变量的键值
 * @param fallbackValue 默认值
 */
export const getEnv = (key: string, fallbackValue: string = ''): string => {
    const value: string | undefined = process.env[key];
    if (typeof value === 'undefined') {
        return fallbackValue;
    }
    return value;
};
/**
 * 格式化数字类型环境变量
 * @param key
 * @param fallbackValue
 */
export const getEnvNumber = (key: string, fallbackValue: number = 0): number => {
    const value: string = getEnv(key);
    return !isNaN(parseFloat(value)) && !isNaN(Number(value)) ? Number(value) : fallbackValue;
};
/**
 * 格式化布尔类型环境变量
 * @param key
 * @param fallbackValue
 */
export const getEnvBoolean = (key: string, fallbackValue: boolean = false) => {
    const value: string = getEnv(key);
    return value === '' ? fallbackValue : value === 'true';
};
/**
 * 格式化对象类型环境变量 可以解析 {} | [] 使用JSON.parse解析
 * @param key
 * @param fallbackValue
 */
export const getEnvObject = (key: string, fallbackValue: object = null) => {
    const value: string = getEnv(key);
    if (!value) {
        return fallbackValue;
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallbackValue;
    }
};