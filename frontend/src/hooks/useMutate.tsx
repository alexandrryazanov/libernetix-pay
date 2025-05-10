import { useCallback, useState } from "react";

// usually I use something like react-query lib, but here it is enough
const useMutate = <TData,>(
  url: string,
  onSuccess?: (data: TData) => void,
  onError?: (error: string) => void,
) => {
  const [{ isLoading, data, error }, setFetchingState] = useState<{
    isLoading: boolean;
    error: string;
    data: TData | null;
  }>({
    isLoading: false,
    error: "",
    data: null,
  });

  const mutate = useCallback(
    (body?: object, headers?: HeadersInit) => {
      setFetchingState((prev) => ({
        ...prev,
        isLoading: true,
      }));
      fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}${url}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setFetchingState((prev) => ({
            ...prev,
            data,
            isLoading: false,
          }));
          if (onSuccess) onSuccess(data);
        })
        .catch((e) => {
          setFetchingState((prev) => ({
            ...prev,
            error: "Error while mutate data",
            isLoading: false,
          }));
          console.error(e); // TODO: create error handler for error from server
          if (onError) onError("Error while mutate data");
        });
    },
    [url, onSuccess, onError],
  );

  return { isLoading, data, error, mutate };
};

export default useMutate;
