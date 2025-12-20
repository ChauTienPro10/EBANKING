// Example usage of the custom fetch client

import fetchClient, { CustomFetch } from './fetch';
import { api, apiCall, fetchUtils } from './fetchHelpers';
import { ENDPOINTS } from './URL';

// ===== BASIC USAGE =====

// 1. Using the default fetch client directly
async function basicExample() {
  try {
    // GET request
    const response = await fetchClient.get(ENDPOINTS.USERS);
    console.log('Users:', response.data);

    // POST request
    const newUser = await fetchClient.post(ENDPOINTS.USERS, {
      name: 'John Doe',
      email: 'john@example.com'
    });
    console.log('Created user:', newUser.data);

    // PUT request with custom config
    const updatedUser = await fetchClient.put(ENDPOINTS.USER_BY_ID('123'), 
      { name: 'Jane Doe' },
      { timeout: 5000 }
    );
    console.log('Updated user:', updatedUser.data);

  } catch (error) {
    console.error('API Error:', error);
  }
}

// ===== USING API HELPERS =====

// 2. Using pre-defined API endpoints
async function apiHelpersExample() {
  try {
    // Authentication
    const loginResult = await api.auth.login({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginResult.data);

    // Get user profile
    const profile = await api.users.getProfile();
    console.log('User profile:', profile.data);

    // Get notifications with pagination
    const notifications = await api.notifications.getAll({
      page: 1,
      limit: 10,
      status: 'unread'
    });
    console.log('Notifications:', notifications.data);

  } catch (error) {
    console.error('API Error:', error);
  }
}

// ===== USING API CALL WRAPPER =====

// 3. Using apiCall wrapper for error handling
async function safeApiExample() {
  // Safe API call with automatic error handling
  const result = await apiCall(() => api.users.getProfile());
  
  if (result.success) {
    console.log('Profile data:', result.data);
  } else {
    console.error('Failed to get profile:', result.error);
    console.log('Status code:', result.status);
  }
}

// ===== FILE UPLOAD EXAMPLE =====

// 4. File upload
async function fileUploadExample(file: File) {
  try {
    // Single file upload
    const uploadResult = await api.upload.avatar(file);
    console.log('Upload result:', uploadResult.data);

    // Multiple files upload
    const files = [file]; // array of files
    const multipleUploadResult = await api.upload.multiple(files);
    console.log('Multiple upload result:', multipleUploadResult.data);

  } catch (error) {
    console.error('Upload error:', error);
  }
}

// ===== CUSTOM FETCH INSTANCE =====

// 5. Creating custom fetch instance with different config
const customFetch = new CustomFetch('https://api.example.com', {
  timeout: 15000,
  retry: 5,
  retryDelay: 2000,
  headers: {
    'X-Custom-Header': 'MyApp/1.0'
  }
});

async function customInstanceExample() {
  try {
    const response = await customFetch.get(ENDPOINTS.CUSTOM_ENDPOINT);
    console.log('Custom API response:', response.data);
  } catch (error) {
    console.error('Custom API error:', error);
  }
}

// ===== REACT COMPONENT EXAMPLE =====

// 6. Example usage in React component
/*
import React, { useState, useEffect } from 'react';
import { api, apiCall } from '../services/fetchHelpers';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await apiCall(() => api.users.getProfile());
    
    if (result.success) {
      setProfile(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const updateProfile = async (data) => {
    const result = await apiCall(() => api.users.updateProfile(data));
    
    if (result.success) {
      setProfile(result.data);
      // Show success message
    } else {
      setError(result.error);
      // Show error message
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
*/

// ===== DOWNLOAD FILE EXAMPLE =====

// 7. Download file
async function downloadExample() {
  const result = await fetchUtils.downloadFile(
    '/reports/monthly-report.pdf',
    'monthly-report.pdf'
  );
  
  if (result.success) {
    console.log('File downloaded successfully');
  } else {
    console.error('Download failed:', result.error);
  }
}

// ===== QUERY STRING UTILITY =====

// 8. Using query string utility
function queryStringExample() {
  const params = {
    page: 1,
    limit: 20,
    search: 'john',
    status: 'active',
    tags: ['admin', 'user']
  };
  
  const queryString = fetchUtils.createQueryString(params);
  console.log('Query string:', queryString);
  // Output: page=1&limit=20&search=john&status=active&tags=admin&tags=user
}

// Export examples for testing
export {
  basicExample,
  apiHelpersExample,
  safeApiExample,
  fileUploadExample,
  customInstanceExample,
  downloadExample,
  queryStringExample
};