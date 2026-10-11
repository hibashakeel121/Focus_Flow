// Vite forwards /api requests to the Express backend during development.
export async function tasksRequest(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`/api/tasks${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Unable to connect. Check that the backend is running and try again.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Unable to load or save tasks (${response.status}). Please try again.`);
  }
  return response.status === 204 ? null : response.json();
}
