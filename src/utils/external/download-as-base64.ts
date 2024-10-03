export default async function downloadAsBase64 (url: string, headers?: Record<string, string>, method = "GET", body: Record<string, any> = {}): Promise<string> {
  let response: Response;
  if (method === "GET")  {
    response = await fetch(url, { headers });

  } else {
    response = await fetch(url, { headers, method, body });

  }
  const blob = await response.blob();

  return new Promise<string>(resolve => {
    // Read as base64 URL.
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
  });
};
