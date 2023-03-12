import { FC, forwardRef, useMemo } from "react";
import { Publication } from "modules/publications";
import { Author } from "modules/authors";
import { DataInputProps } from "./DataInput";
import Multicombobox from "./Multicombobox";
import useDebounce from "utils/useDebounce";

export default forwardRef<HTMLDivElement, DataInputProps>(
  function TextArrayDataInput(
    { rowId, colId, value, onChange, onBlur, ...props },
    ref
  ) {
    const placeholder = Publication.ATTRIBUTE_LABELS[colId];
    const error = Boolean(props.error);

    const items = useMemo(
      () => (value === "" ? [] : value.split(",")),
      [value]
    );

    function handleChange(value: string[]) {
      onChange?.(value.join(","));
    }

    //TODO: decouple this component from author search
    const getOptions = useDebounce(Author.REMOTE.search, 350, {
      leading: true,
    });

    return (
      <Multicombobox
        {...props}
        ref={ref}
        placeholder={placeholder}
        value={items}
        error={error}
        onChange={handleChange}
        getOptions={getOptions}
      />
    );
  }
) as FC<DataInputProps>;
