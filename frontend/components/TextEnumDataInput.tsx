import { COUNTRIES } from "modules/publications";
import { FC, forwardRef, useMemo } from "react";
import { DataInputProps } from "./DataInput";
import Select, { SelectOption } from "./Select";

const OPTIONS = Object.entries(COUNTRIES).map(([key, label]) => ({
  id: key,
  label: label,
}));

export default forwardRef<HTMLInputElement, DataInputProps>(
  function TextDataInput({ rowId, colId, value, onChange, ...props }, ref) {
    function handleChange(option: SelectOption) {
      onChange?.(option.id);
    }

    const selectedOption = useMemo(
      () => OPTIONS.find((opt) => opt.id === value),
      [value]
    );

    return (
      <Select
        {...props}
        ref={ref}
        value={selectedOption}
        onChange={handleChange}
        options={OPTIONS}
      />
    );
  }
) as FC<DataInputProps>;
