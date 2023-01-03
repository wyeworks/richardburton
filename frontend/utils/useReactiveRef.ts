import { MutableRefObject, useCallback, useRef, useState } from "react";

type ReturnTuple<T> = [MutableRefObject<T>, (current: T) => void];

function useReactiveRef<T>(initial: T): ReturnTuple<T> {
  const ref = useRef<T>(initial);
  const [, setKey] = useState(1);
  const setCurrent = useCallback((v: T) => {
    ref.current = v;
    setKey((key) => -key);
  }, []);

  return [ref, setCurrent];
}

export default useReactiveRef;
