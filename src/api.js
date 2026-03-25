import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

/**
 * Upload a document to the backend.
 * Returns { session_id, filename, char_count, truncated }
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Ask a question about the uploaded document.
 * Returns { answer }
 */
export async function askQuestion(sessionId, question) {
  const response = await axios.post(`${BASE_URL}/ask`, {
    session_id: sessionId,
    question: question,
  });
  return response.data;
}

/**
 * Clear the session from backend memory.
 */
export async function clearSession(sessionId) {
  await axios.delete(`${BASE_URL}/session/${sessionId}`);
}
