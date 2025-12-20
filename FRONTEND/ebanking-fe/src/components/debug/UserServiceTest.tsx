import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUsers, getAllUsersAsSimple } from '@/services/userService';
import { api } from '@/services/URL';
import fetchClient from '@/services/fetch';

export function UserServiceTest() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (title: string, data: any, error?: any) => {
    setResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      title,
      data,
      error,
      success: !error
    }]);
  };

  const testRawAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing raw API call to:', api.GET_ALL_USER);
      const response = await fetchClient.get(api.GET_ALL_USER);
      addResult('Raw API Call', {
        status: response.status,
        dataType: typeof response.data,
        hasSuccess: 'success' in response.data,
        hasMessage: 'message' in response.data,
        hasData: 'data' in response.data,
        dataStructure: response.data,
        sampleData: response.data?.data?.slice(0, 2)
      });
    } catch (error: any) {
      addResult('Raw API Call', null, error.message);
    }
    setLoading(false);
  };

  const testGetAllUsers = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();
      addResult('getAllUsers()', {
        count: users.length,
        sampleUsers: users.slice(0, 3),
        firstUserStructure: users[0] ? Object.keys(users[0]) : []
      });
    } catch (error: any) {
      addResult('getAllUsers()', null, error.message);
    }
    setLoading(false);
  };

  const testGetAllUsersAsSimple = async () => {
    setLoading(true);
    try {
      const users = await getAllUsersAsSimple();
      addResult('getAllUsersAsSimple()', {
        count: users.length,
        sampleUsers: users.slice(0, 3),
        firstUserStructure: users[0] ? Object.keys(users[0]) : []
      });
    } catch (error: any) {
      addResult('getAllUsersAsSimple()', null, error.message);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>User Service Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testRawAPI} disabled={loading}>
            Test Raw API
          </Button>
          <Button onClick={testGetAllUsers} disabled={loading}>
            Test getAllUsers()
          </Button>
          <Button onClick={testGetAllUsersAsSimple} disabled={loading}>
            Test getAllUsersAsSimple()
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-auto">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`p-3 rounded border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{result.title}</h4>
                <span className="text-xs text-gray-500">{result.timestamp}</span>
              </div>
              
              {result.error ? (
                <div className="text-red-600 text-sm">
                  Error: {result.error}
                </div>
              ) : (
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Click a test button to see results
          </div>
        )}
      </CardContent>
    </Card>
  );
}