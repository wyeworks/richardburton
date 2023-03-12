import { Publication } from "modules/publications";
import { FC, forwardRef, useCallback, useMemo, useState } from "react";
import { DataInputProps } from "./DataInput";
import Select, { SelectOption } from "./Select";
import pDebounce from "p-debounce";

export default forwardRef<HTMLInputElement, DataInputProps>(
  function TextDataInput(
    { rowId, colId, autoValidated, value, onChange, ...props },
    ref
  ) {
    function handleChange(option: SelectOption) {
      onChange?.(option.id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getOptions = useCallback(
      pDebounce(
        (search: string) => Publication.autocomplete(search, colId),
        350
      ),
      [colId]
    );

    const selectedOption = useMemo(
      () => ({ id: value, label: Publication.describeValue(value, colId) }),
      [value]
    );

    return (
      <Select
        {...props}
        ref={ref}
        value={selectedOption}
        onChange={handleChange}
        getOptions={getOptions}
      />
    );
  }
) as FC<DataInputProps>;
