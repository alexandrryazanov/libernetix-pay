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
        .then(async (res) => {
          const isHTML = res.headers.get("Content-Type")?.includes("text/html");
          const responseBody = isHTML ? await res.text() : await res.json();

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
          if (onSuccess) onSuccess(data);
        })
        .catch((e) => {
          const msg = Array.isArray(e.body.message)
            ? e.body.message[0]
            : e.body.message || "Error while mutate data";
          setFetchingState((prev) => ({
            ...prev,
            error: msg,
            isLoading: false,
          }));

          if (onError) onError(msg);
        });
    },
    [url, onSuccess, onError],
  );

  return { isLoading, data, error, mutate };
};

export default useMutate;
