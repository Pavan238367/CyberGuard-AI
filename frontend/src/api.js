const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Sends a target string and target type to the CyberGuard AI FastAPI backend for security analysis.
 * 
 * @param {string} target - The target string (IP address, domain, URL, file hash, or payload).
 * @param {string} targetType - The type of target (e.g. 'ip', 'domain', 'url', 'hash', 'payload').
 * @returns {Promise<Object>} The API response object containing target, target_type, risk_level, confidence, status, message, and detected_indicators.
 */
export async function analyzeThreat(target, targetType = 'payload') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: target,
        target_type: targetType,
      }),
    });

    if (!response.ok) {
      let errorDetail = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorDetail = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch (_) {
        // Fallback to default message
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Could not connect to CyberGuard AI backend at http://127.0.0.1:8000. Please ensure FastAPI server is running.');
    }
    throw error;
  }
}

/**
 * Fetches recent persistent scan history from CyberGuard AI FastAPI backend.
 * 
 * @param {number} limit - Maximum number of scan history items to retrieve (default: 50).
 * @returns {Promise<Array>} List of historical scan objects.
 */
export async function getScanHistory(limit = 50) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history?limit=${limit}`);
    
    if (!response.ok) {
      let errorDetail = `Failed to fetch scan history (status ${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorDetail = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch (_) {}
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Could not connect to CyberGuard AI backend at http://127.0.0.1:8000. Please ensure FastAPI server is running.');
    }
    throw error;
  }
}

/**
 * Fetches calculated analytics statistics from CyberGuard AI FastAPI backend.
 * 
 * @returns {Promise<Object>} Object containing total_scans, critical_count, high_count, medium_count, low_count, active_count, resolved_count, average_confidence, recent_scan_count, severity_distribution, scan_trend.
 */
export async function getAnalytics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics`);
    
    if (!response.ok) {
      let errorDetail = `Failed to fetch analytics (status ${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorDetail = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch (_) {}
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Could not connect to CyberGuard AI backend at http://127.0.0.1:8000. Please ensure FastAPI server is running.');
    }
    throw error;
  }
}

