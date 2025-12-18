
import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";

export function useFetch<T = unknown>(url: string, config?: AxiosRequestConfig) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    axios
      .get<T>(url, config)
      .then((res) => {
        if (!active) return;
        setData(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, error };
}
