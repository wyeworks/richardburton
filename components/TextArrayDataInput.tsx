import {
  FC,
  ForwardedRef,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Publication } from "modules/publications";
import { Author } from "modules/authors";
import { DataInputProps } from "./DataInput";
import Multicombobox from "./Multicombobox";
import useDebounce from "utils/useDebounce";

export default forwardRef<HTMLElement, DataInputProps>(
  function TextArrayDataInput(
    {
      rowId,
      colId,
      value: data,
      error,
      autoValidated,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) {
    const validate = Publication.REMOTE.useValidate();
    const override = Publication.STORE.ATTRIBUTES.useOverride();
    const [value, setValue] = useState(data);

    const items = useMemo(
      () => (value === "" ? [] : value.split(",")),
      [value]
    );

    function doValidate() {
      if (autoValidated) {
        validate([rowId]);
      }
    }

    function handleChange(value: string[]) {
      const v = value.join(",");
      setValue(v);
      override(rowId, colId, v);
      doValidate();
      onChange?.(v);
    }

    useEffect(() => {
      if (data !== value) {
        setValue(data);
      }
    }, [data, rowId, colId, value, setValue]);

    //TODO: decouple this component from author search
    const getOptions = useDebounce(Author.REMOTE.search, 350, {
      leading: true,
    });

    return (
      <Multicombobox
        {...props}
        ref={ref as ForwardedRef<HTMLDivElement>}
        placeholder={Publication.ATTRIBUTE_LABELS[colId]}
        value={items}
        onBlur={doValidate}
        onChange={handleChange}
        error={Boolean(error)}
        getOptions={getOptions}
      />
    );
  }
) as FC<DataInputProps>;
