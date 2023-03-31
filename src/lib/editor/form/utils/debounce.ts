export function getDebouncedFunction<T>(ms: number, callback: (...args: T[]) => void): (...args: T[]) => void {
  let timerId: NodeJS.Timeout
  return (...args: T[]) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback(...args)
    }, ms);
  }
}
