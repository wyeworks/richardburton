import { FC, forwardRef, useMemo } from "react";
import { Author } from "modules/authors";
import { DataInputProps } from "./DataInput";
import Multicombobox from "./Multicombobox";
import useDebounce from "utils/useDebounce";
import { Publication } from "modules/publications";

export default forwardRef<HTMLDivElement, DataInputProps>(
  function TextArrayDataInput(
    { rowId, colId, value, autoValidated, onChange, onBlur, ...props },
    ref
  ) {
    const items = useMemo(
      () => (value === "" ? [] : value.split(",")),
      [value]
    );

    function handleChange(value: string[]) {
      onChange?.(value.join(","));
    }

    const getOptions = useDebounce(
      () => Publication.autocomplete(value, colId),
      350,
      {
        leading: true,
      }
    );

    return (
      <Multicombobox
        {...props}
        ref={ref}
        value={items}
        onChange={handleChange}
        getOptions={getOptions}
      />
    );
  }
) as FC<DataInputProps>;
