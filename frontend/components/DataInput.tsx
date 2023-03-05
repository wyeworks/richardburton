import { Author } from "modules/authors";
import {
  Publication,
  PublicationId,
  PublicationKey,
} from "modules/publications";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLProps,
  useEffect,
  useMemo,
  useState,
} from "react";
import Multicombobox from "./Multicombobox";
import c from "classnames";

type Props = Omit<HTMLProps<HTMLInputElement>, "onChange"> & {
  rowId: PublicationId;
  colId: PublicationKey;
  value: string;
  error: string;
  onChange?: (value: string) => void;
};

const DataInput = forwardRef<HTMLInputElement, Props>(function DataInput(
  { rowId, colId, value: data, onChange, ...props },
  ref
) {
  const override = Publication.STORE.ATTRIBUTES.useOverride();
  const [value, setValue] = useState(data);

  useEffect(() => {
    if (data !== value) {
      setValue(data);
    }
  }, [data, rowId, colId, value, setValue]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
    override(rowId, colId, e.target.value);
    onChange?.(e.target.value);
  };

  const handleArrayChange = (value: string[]) => {
    const v = value.join(",");
    setValue(v);
    override(rowId, colId, v);
    onChange?.(v);
  };

  const isArray = Publication.ATTRIBUTE_TYPES[colId] === "array";

  const items = useMemo(() => (value === "" ? [] : value.split(",")), [value]);

  return isArray ? (
    <Multicombobox
      {...props}
      ref={ref}
      value={items}
      onChange={handleArrayChange}
      placeholder={Publication.ATTRIBUTE_LABELS[colId]}
      getOptions={async (search) => {
        const authors = await Author.REMOTE.search("Richard");

        return authors
          .map(({ name }) => name)
          .filter((name) => name.toLowerCase().startsWith(search));
      }}
    />
  ) : (
    <input
      {...props}
      ref={ref}
      placeholder={Publication.ATTRIBUTE_LABELS[colId]}
      className={c(
        "px-2 py-1 rounded outline-none bg-transparent focus:bg-gray-active focus:shadow-sm placeholder:text-xs",
        "error:focus:bg-red-400/80 error:bg-red-300/40 error:focus:text-white error:shadow-sm error:placeholder-white"
      )}
      value={value}
      onChange={handleChange}
    />
  );
});

export default DataInput;
