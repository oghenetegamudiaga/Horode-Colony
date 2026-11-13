export async function fetchWithAccessCode(
  url: string,
  options: RequestInit,
  onRequestAccessCode: () => Promise<string | null>
): Promise<Response> {
  const code = sessionStorage.getItem('horode_access_code') || '';
  const headers = new Headers(options.headers || {});
  if (code) {
    headers.set('x-access-code', code);
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    let isAccessRequired = false;
    try {
      const cloned = res.clone();
      const body = await cloned.json();
      isAccessRequired = body?.code === 'ACCESS_REQUIRED';
    } catch {
      isAccessRequired = true;
    }

    if (isAccessRequired) {
      const newCode = await onRequestAccessCode();
      if (newCode) {
        sessionStorage.setItem('horode_access_code', newCode);
        headers.set('x-access-code', newCode);
        return fetch(url, { ...options, headers });
      }
    }
  }

  return res;
}
