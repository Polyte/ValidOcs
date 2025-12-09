const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fraud-detection-api-qqgl.onrender.com';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'test-123';

export interface HealthResponse {
  status?: string;
  [key: string]: any;
}

export interface AnalyzeStatementResponse {
  [key: string]: any;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

/**
 * Check API health status
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Analyze a statement file
 */
export async function analyzeStatement(file: File): Promise<AnalyzeStatementResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze-statement`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 422) {
      const error: HTTPValidationError = await response.json();
      throw new Error(`Validation error: ${error.detail.map(e => e.msg).join(', ')}`);
    }
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return response.json();
}

