import { Interpolation } from '../types';

const flatten = <T extends object>(
  chunks: Array<Interpolation<T> | undefined>,
  executionContext: T,
): Array<Interpolation<T> | string> =>
    chunks.reduce((ruleSet: Array<Interpolation<T> | string>, chunk?: Interpolation<T> | undefined) => {
    /* Remove falsey values */
      if (
        chunk === undefined ||
      chunk === null ||
      chunk === false ||
      chunk === ''
      ) {
        return ruleSet;
      }
      /* Flatten ruleSet */
      if (Array.isArray(chunk)) {
        return [...ruleSet, ...flatten(chunk, executionContext)];
      }

      /* Either execute or defer the function */
      if (typeof chunk === 'function') {
        if (executionContext !== null && executionContext !== undefined) {
          return ruleSet.concat(
            ...flatten([chunk(executionContext)], executionContext),
          );
        } else {
        // Handle the case when executionContext is null or undefined
        // You may want to return ruleSet as it is, or add some fallback logic here
          return ruleSet;
        }
      }

      return ruleSet.concat(chunk.toString());
    }, []);

export default flatten;
