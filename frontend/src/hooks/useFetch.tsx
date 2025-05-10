import { useEffect, useState } from "react";

interface FetchOptions {
  skip?: boolean;
}

// usually I use something like react-query lib, but here it is enough
const useFetch = <TData,>(url: string, options?: FetchOptions) => {
  const [{ isLoading, data, error }, setFetchingState] = useState<{
    isLoading: boolean;
    error: string;
    data: TData | null;
  }>({
    isLoading: false,
    error: "",
    data: null,
  });

  useEffect(() => {
    if (options?.skip) return;

    setFetchingState((prev) => ({
      ...prev,
      isLoading: true,
    }));
    fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}${url}`)
      .then((res) => res.json())
      .then((data) => {
        setFetchingState((prev) => ({
          ...prev,
          data,
          isLoading: false,
        }));
      })
      .catch(() =>
        setFetchingState((prev) => ({
          ...prev,
          error: "Error while fetching data",
          isLoading: false,
        })),
      );
  }, [url, options?.skip]);

  return { isLoading, data, error };
};

export default useFetch;
