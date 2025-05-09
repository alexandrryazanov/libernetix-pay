type Callback<T> = (err: any, result: T) => void;

export function promisify<TResult, TArgs extends any[] = []>(
  fn: (...args: [...TArgs, Callback<TResult>]) => void,
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) =>
    new Promise<TResult>((resolve, reject) => {
      fn(...args, (err: Error, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
}
