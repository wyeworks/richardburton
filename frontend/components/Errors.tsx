import { FC, useEffect } from "react";
import { atom, useRecoilState, useSetRecoilState } from "recoil";

type Error = string;

const errorsAtom = atom<Error[]>({
  key: "errors",
  default: [],
});

const ERROR_TIMEOUT_MS = 4000;

const Errors: FC = () => {
  const [errors, setErrors] = useRecoilState(errorsAtom);

  useEffect(() => {
    if (errors.length > 0) {
      const timeout = setTimeout(
        () => setErrors(errors.slice(0, -1)),
        ERROR_TIMEOUT_MS
      );

      return () => clearTimeout(timeout);
    }
  }, [errors]);

  return (
    <section className="fixed z-50 flex flex-col items-center space-y-2 -translate-x-1/2 left-1/2 top-10">
      {errors.map((message, index) => (
        <div
          key={index}
          className="px-3 py-2 space-x-2 bg-white rounded shadow-md  w-96 error"
        >
          <span>⚠️</span> <span>{message}</span>
        </div>
      ))}
    </section>
  );
};

const useNotifyError = () => {
  const setErrors = useSetRecoilState(errorsAtom);
  return (error: Error) => setErrors((current) => [...current, error]);
};

export default Errors;
export { useNotifyError };
