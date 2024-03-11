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

function validate<T extends ZodObject<ZodRawShape>>(
  schema: T,
  input: Partial<z.infer<T>>,
): [Partial<z.infer<T>>, Partial<Record<keyof z.infer<T>, string>>] {
  const parsed: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const [key, field] of Object.entries(schema.shape)) {
    if (!(key in input)) {
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

  const input = { ...defaults, ...values };

  const [parsed, errors] = validate(strict, input);

  function handleChange(key: keyof z.infer<T>) {
    return (value: string) => {
      setValues({ ...values, [key]: value });
    };
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    const { success } = schema.safeParse(parsed);

    if (!success) {
      const placeholders = Object.keys(strict.shape).reduce(
        (acc, key) => ({ ...acc, [key]: "" }),
        {},
      );

      setValues(placeholders);
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
      },
    }),
    {} as Record<keyof z.infer<T>, InputProps>,
  );

  return { inputs, form: { onSubmit } };
}
