export async function notesRequest(path = '', options = {}) {
  const response = await fetch(`/api/notes${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Request failed (${response.status}). Check that the backend is running.`);
  }
  return response.status === 204 ? null : response.json();
}
