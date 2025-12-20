import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  testLoadHistory,
  testHistoryPagination,
  analyzeNotificationTypes,
  getRecentNotifications
} from '@/services/testNotificationHistory';
import { 
  testPushToUser,
  testBulkPushToUsers,
  sendBulkWelcomeNotifications
} from '@/services/testPushNotification';

export function NotificationFlowTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addResult = (title: string, data: any) => {
    setResults(prev => [...prev, { title, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Running test: ${testName}`);
      
      const result = await testFn();
      addResult(testName, result);
      console.log(`Test completed: ${testName}`, result);
    } catch (err: any) {
      console.error(`Test failed: ${testName}`, err);
      setError(`${testName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification System Test Suite</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test all notification APIs: history, push single, push bulk
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => runTest('Load History', testLoadHistory)}
              disabled={loading}
              variant="outline"
            >
              Test History API
            </Button>
            
            <Button 
              onClick={() => runTest('Test Pagination', testHistoryPagination)}
              disabled={loading}
              variant="outline"
            >
              Test Pagination
            </Button>
            
            <Button 
              onClick={() => runTest('Analyze Types', analyzeNotificationTypes)}
              disabled={loading}
              variant="outline"
            >
              Analyze Types
            </Button>
            
            <Button 
              onClick={() => runTest('Recent Notifications', () => getRecentNotifications(5))}
              disabled={loading}
              variant="outline"
            >
              Get Recent (5)
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Push Notification Tests</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => runTest('Push to User', testPushToUser)}
                disabled={loading}
                variant="outline"
              >
                Test Single Push
              </Button>
              
              <Button 
                onClick={() => runTest('Bulk Push', testBulkPushToUsers)}
                disabled={loading}
                variant="outline"
              >
                Test Bulk Push
              </Button>
              
              <Button 
                onClick={() => runTest('Welcome Bulk', () => sendBulkWelcomeNotifications(['user1', 'user2']))}
                disabled={loading}
                variant="outline"
              >
                Test Welcome Bulk
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={clearResults}
              variant="ghost"
              size="sm"
            >
              Clear Results
            </Button>
            {loading && (
              <Badge variant="secondary">Running test...</Badge>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{result.title}</h4>
                  <Badge variant="outline">{result.timestamp}</Badge>
                </div>
                
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground mb-2">
                    View Result Data
                  </summary>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-xs">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}