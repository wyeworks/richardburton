import { debounce } from "lodash";
import { useCallback } from "react";

function useDebounce<F>(factory: F, delay: number): F {
  //eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounce(factory as any, delay) as any, [factory, delay]);
}

export default useDebounce;
