export function enumToValuesString<T>(
  enumObj: T,
  excludeValues: T[keyof T][] = [],
): string[] {
  return Object.values(enumObj)
    .filter((value) => !excludeValues.includes(value))
    .map((value) => value.toString());
}
