import { FormEvent, FormEventHandler, useState } from "react";
import { ZodDefault, ZodObject, ZodRawShape, ZodSchema, z } from "zod";

function stripDefaults<T extends ZodObject<ZodRawShape>>(
  schema: T,
): [z.infer<T>, T] {
  const [defaults, s] = Object.entries(schema.shape).reduce(
    ([d, s], [key, field]) => {
      if (field instanceof ZodDefault) {
        return [
          { ...d, [key]: field.parse(undefined) },
          { ...s, [key]: field.removeDefault() },
        ];
      }
      return [d, { ...s, [key]: field }];
    },
    [{}, {}] as [Record<string, unknown>, Record<string, ZodSchema>],
  );

  return [defaults, z.object(s) as T] as const;
}

interface ValidateOptions {
  all: boolean;
}

function validate<T extends ZodObject<ZodRawShape>>(
  schema: T,
  input: Partial<z.infer<T>>,
  { all }: ValidateOptions,
): [Partial<z.infer<T>>, Partial<Record<keyof z.infer<T>, string>>] {
  const parsed: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const [key, field] of Object.entries(schema.shape)) {
    if (!all && !(key in input)) {
      continue;
    }

    const result = field.safeParse(input[key]);

    if (result.success) {
      parsed[key] = result.data;
    } else {
      parsed[key] = input[key]!;
      errors[key] = result.error.errors[0].message;
    }
  }

  return [
    parsed as Partial<z.infer<T>>,
    errors as Partial<Record<keyof z.infer<T>, string>>,
  ];
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}
interface Options {
  onSuccess?: () => void;
}

export function useForm<T extends ZodObject<ZodRawShape>>(
  schema: T,
  options?: Options,
): {
  inputs: Record<keyof z.infer<T>, InputProps>;
  form: { onSubmit: FormEventHandler };
} {
  const { onSuccess } = options ?? {};

  const [defaults, strict] = stripDefaults(schema);
  const [values, setValues] = useState<Partial<z.infer<T>>>({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<T>, string>>
  >({});

  const input = { ...defaults, ...values };

  function handleChange(key: keyof z.infer<T>) {
    return (value: string) => {
      setValues({ ...values, [key]: value });
    };
  }

  function handleBlur() {
    return () => {
      const [, errors] = validate(strict, input, { all: false });
      setErrors(errors);
    };
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    const result = schema.safeParse(input);

    if (!result.success) {
      const [, errors] = validate(strict, input, { all: true });
      setErrors(errors);
      return;
    }

    onSuccess?.();
  }

  const inputs = Object.entries(strict.shape).reduce(
    (acc, [key]) => ({
      ...acc,
      [key]: {
        value: input[key] ?? defaults[key],
        error: errors[key],
        onChange: handleChange(key),
        onBlur: handleBlur(),
      },
    }),
    {} as Record<keyof z.infer<T>, InputProps>,
  );

  return { inputs, form: { onSubmit } };
}