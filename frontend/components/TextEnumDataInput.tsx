import { Publication } from "modules/publications";
import { FC, forwardRef, useEffect, useMemo, useState } from "react";
import { DataInputProps } from "./DataInput";
import Select, { SelectOption } from "./Select";

export default forwardRef<HTMLInputElement, DataInputProps>(
  function TextDataInput({ rowId, colId, value, onChange, ...props }, ref) {
    function handleChange(option: SelectOption) {
      onChange?.(option.id);
    }

    const [options, setOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
      Publication.autocomplete(value, colId).then(setOptions);
    }, [value, colId]);

    const selectedOption = useMemo(
      () => options.find((opt) => opt.id === value),
      [options, value]
    );

    return (
      <Select
        {...props}
        ref={ref}
        value={selectedOption}
        onChange={handleChange}
        options={options}
      />
    );
  }
) as FC<DataInputProps>;
