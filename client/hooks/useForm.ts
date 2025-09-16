import { useState } from "react";

export function useForm<T>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  function handleChange<K extends keyof T>(key: K, value: T[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  function reset(next?: T) {
    setValues(next ?? initial);
  }
  return { values, handleChange, reset, setValues };
}
