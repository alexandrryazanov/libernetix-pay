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
      .then(async (res) => {
        const responseBody = await res.json();

        if (!res.ok) {
          throw {
            status: res.status,
            statusText: res.statusText,
            body: responseBody,
          };
        }
        return responseBody;
      })
      .then((data) => {
        setFetchingState((prev) => ({
          ...prev,
          data,
          isLoading: false,
        }));
      })
      .catch((e) => {
        const msg = Array.isArray(e.body.message)
          ? e.body.message[0]
          : e.body.message || "Error while fetching data";
        setFetchingState((prev) => ({
          ...prev,
          error: msg,
          isLoading: false,
        }));
      });
  }, [url, options?.skip]);

  return { isLoading, data, error };
};

export default useFetch;
