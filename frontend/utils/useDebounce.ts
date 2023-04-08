import { debounce, DebounceSettings } from "lodash";
import { useCallback } from "react";

function useDebounce<F>(factory: F, delay: number, opts?: DebounceSettings): F {
  //eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounce(factory as any, delay, opts) as any, [
    factory,
    delay,
  ]);
}

export default useDebounce;
