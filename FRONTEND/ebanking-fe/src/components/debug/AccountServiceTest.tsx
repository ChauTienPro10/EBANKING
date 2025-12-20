import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getAllAccounts, 
  getEnrichedAccounts, 
  getAccountById,
  getAccountStats,
  searchAccounts,
  lockAccount,
  unlockAccount
} from '@/services/accountService';
import { ENDPOINTS } from '@/services/URL';
import fetchClient from '@/services/fetch';

export function AccountServiceTest() {
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
      console.log('Testing raw API call to:', ENDPOINTS.ACCOUNTS);
      const response = await fetchClient.get(ENDPOINTS.ACCOUNTS);
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

  const testGetAllAccounts = async () => {
    setLoading(true);
    try {
      const accounts = await getAllAccounts();
      addResult('getAllAccounts()', {
        count: accounts.length,
        sampleAccounts: accounts.slice(0, 3),
        firstAccountStructure: accounts[0] ? Object.keys(accounts[0]) : []
      });
    } catch (error: any) {
      addResult('getAllAccounts()', null, error.message);
    }
    setLoading(false);
  };

  const testGetEnrichedAccounts = async () => {
    setLoading(true);
    try {
      const accounts = await getEnrichedAccounts();
      addResult('getEnrichedAccounts()', {
        count: accounts.length,
        sampleAccounts: accounts.slice(0, 3),
        firstAccountStructure: accounts[0] ? Object.keys(accounts[0]) : []
      });
    } catch (error: any) {
      addResult('getEnrichedAccounts()', null, error.message);
    }
    setLoading(false);
  };

  const testGetAccountById = async () => {
    setLoading(true);
    try {
      // First get all accounts to get a valid ID
      const accounts = await getAllAccounts();
      if (accounts.length === 0) {
        addResult('getAccountById()', null, 'No accounts available to test');
        setLoading(false);
        return;
      }
      
      const testId = accounts[0].accountNumber; // Use accountNumber instead of id
      const account = await getAccountById(testId);
      addResult('getAccountById()', {
        testId,
        found: !!account,
        account: account,
        accountStructure: account ? Object.keys(account) : []
      });
    } catch (error: any) {
      addResult('getAccountById()', null, error.message);
    }
    setLoading(false);
  };

  const testLockUnlockAccount = async () => {
    setLoading(true);
    try {
      // First get all accounts to get a valid ID
      const accounts = await getAllAccounts();
      if (accounts.length === 0) {
        addResult('Lock/Unlock Account', null, 'No accounts available to test');
        setLoading(false);
        return;
      }
      
      const testAccountId = accounts[0].accountId.toString();
      const testReason = "Test lock reason";
      const testLockedBy = "Test Admin";
      const testNotes = "Test notes";
      
      // Test lock
      await lockAccount(testAccountId, testReason, testLockedBy, testNotes);
      addResult('Lock Account', {
        accountId: testAccountId,
        reason: testReason,
        lockedBy: testLockedBy,
        notes: testNotes,
        success: true
      });
      
      // Wait a bit then test unlock
      setTimeout(async () => {
        try {
          await unlockAccount(testAccountId, "Test Admin");
          addResult('Unlock Account', {
            accountId: testAccountId,
            unlockedBy: "Test Admin",
            success: true
          });
        } catch (error: any) {
          addResult('Unlock Account', null, error.message);
        }
      }, 1000);
      
    } catch (error: any) {
      addResult('Lock Account', null, error.message);
    }
    setLoading(false);
  };

  const testSearchAccounts = async () => {
    setLoading(true);
    try {
      // Test keyword search
      const keywordResults = await searchAccounts({ keyword: 'john' });
      addResult('searchAccounts() - keyword', {
        searchTerm: 'john',
        count: keywordResults.length,
        sampleResults: keywordResults.slice(0, 3)
      });
      
      // Test userName search
      const userNameResults = await searchAccounts({ userName: 'john' });
      addResult('searchAccounts() - userName', {
        searchTerm: 'john',
        count: userNameResults.length,
        sampleResults: userNameResults.slice(0, 3)
      });
      
      // Test accountNumber search
      const accountNumberResults = await searchAccounts({ accountNumber: '123' });
      addResult('searchAccounts() - accountNumber', {
        searchTerm: '123',
        count: accountNumberResults.length,
        sampleResults: accountNumberResults.slice(0, 3)
      });
      
    } catch (error: any) {
      addResult('searchAccounts()', null, error.message);
    }
    setLoading(false);
  };

  const testGetAccountStats = async () => {
    setLoading(true);
    try {
      const stats = await getAccountStats();
      addResult('getAccountStats()', stats);
    } catch (error: any) {
      addResult('getAccountStats()', null, error.message);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Account Service Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testRawAPI} disabled={loading}>
            Test Raw API
          </Button>
          <Button onClick={testGetAllAccounts} disabled={loading}>
            Test getAllAccounts()
          </Button>
          <Button onClick={testGetEnrichedAccounts} disabled={loading}>
            Test getEnrichedAccounts()
          </Button>
          <Button onClick={testGetAccountById} disabled={loading}>
            Test getAccountById()
          </Button>
          <Button onClick={testSearchAccounts} disabled={loading}>
            Test searchAccounts()
          </Button>
          <Button onClick={testLockUnlockAccount} disabled={loading}>
            Test Lock/Unlock
          </Button>
          <Button onClick={testGetAccountStats} disabled={loading}>
            Test getAccountStats()
          </Button>
          <Button 
            onClick={async () => {
              setLoading(true);
              try {
                const { debugAccountAPI } = await import('@/services/debugAccountAPI');
                const result = await debugAccountAPI();
                addResult('Debug Account API', result);
              } catch (error: any) {
                addResult('Debug Account API', null, error.message);
              }
              setLoading(false);
            }} 
            disabled={loading}
          >
            Debug API Structure
          </Button>
          <Button 
            onClick={async () => {
              setLoading(true);
              try {
                const { testAccountSearch } = await import('@/services/testAccountSearch');
                const result = testAccountSearch();
                addResult('Test Account Search', result);
              } catch (error: any) {
                addResult('Test Account Search', null, error.message);
              }
              setLoading(false);
            }} 
            disabled={loading}
          >
            Test Search Function
          </Button>
          <Button 
            onClick={async () => {
              setLoading(true);
              try {
                const { testLockFlow } = await import('@/services/testLockFlow');
                // Use first account for testing
                const accounts = await getAllAccounts();
                if (accounts.length > 0) {
                  const result = await testLockFlow(accounts[0].accountId.toString());
                  addResult('Test Lock Flow', result);
                } else {
                  addResult('Test Lock Flow', null, 'No accounts available');
                }
              } catch (error: any) {
                addResult('Test Lock Flow', null, error.message);
              }
              setLoading(false);
            }} 
            disabled={loading}
          >
            Test Lock Flow
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