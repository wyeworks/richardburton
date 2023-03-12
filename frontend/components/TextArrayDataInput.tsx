import { FC, forwardRef, useCallback, useMemo } from "react";
import { DataInputProps } from "./DataInput";
import { Publication } from "modules/publications";
import Multicombobox from "./Multicombobox";
import pDebounce from "p-debounce";

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getOptions = useCallback(
      pDebounce(
        (search: string) => Publication.autocomplete(search, colId),
        350
      ),
      [colId]
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
