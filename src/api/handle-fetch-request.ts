const isSuccessful = (r: Response) => r.status >= 200 && r.status <= 399;

export const handleFetchRequest = async <T>(
  fetchRequest: Promise<Response>
): Promise<T> => {
  const response = await fetchRequest;
  let json = null;
  let text = null;

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.indexOf("text/plain") > -1) {
    text = await response.text();
  } else if (contentType && contentType.indexOf("application/json") > -1) {
    json = await response.json();
  }

  const isSuccess = isSuccessful(response);

  if (!isSuccess) {
    const status = response.status;
    let err: Error;
    if (text) {
      err = new Error(text);
    } else if (json && "message" in json) {
      err = new Error(json.message);
    } else {
      err = new Error(`Response Code: ${status} - ${response.statusText}.`);
    }
    (err as Error & { status?: number }).status = status;
    throw err;
  }

  return text || json;
};
