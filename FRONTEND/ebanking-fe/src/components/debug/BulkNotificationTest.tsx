import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  pushNotificationToUsers, 
  type BulkPushNotiPayload 
} from '@/services/notificationService';

export function BulkNotificationTest() {
  const [title, setTitle] = useState('Test Bulk Notification');
  const [content, setContent] = useState('This is a test bulk notification');
  const [usernames, setUsernames] = useState('user1,user2,user3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendBulkNotification = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const usernameList = usernames
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0);

      if (usernameList.length === 0) {
        throw new Error('Please enter at least one username');
      }

      const payload: BulkPushNotiPayload = {
        title: title.trim(),
        content: content.trim(),
        usernames: usernameList,
      };

      console.log('Sending bulk notification:', payload);
      const response = await pushNotificationToUsers(payload);
      
      setResult(response);
      console.log('Bulk notification response:', response);
    } catch (err: any) {
      console.error('Bulk notification error:', err);
      setError(err.message || 'Failed to send bulk notification');
    } finally {
      setLoading(false);
    }
  };

  const handleTestWithSampleData = () => {
    setTitle('Thông báo bảo trì hệ thống');
    setContent('Hệ thống sẽ được bảo trì vào 2:00 AM ngày mai. Vui lòng hoàn tất các giao dịch trước thời gian này.');
    setUsernames('testuser1,testuser2,testuser3,admin');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Bulk Push Notification Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the bulk push notification API endpoint: /notification/push-to-users
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Notification content"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Usernames (comma separated)
          </label>
          <Textarea
            value={usernames}
            onChange={(e) => setUsernames(e.target.value)}
            placeholder="user1,user2,user3"
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter usernames separated by commas
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSendBulkNotification}
            disabled={loading || !title.trim() || !content.trim() || !usernames.trim()}
          >
            {loading ? 'Sending...' : 'Send Bulk Notification'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleTestWithSampleData}
            disabled={loading}
          >
            Load Sample Data
          </Button>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="p-3 text-sm bg-green-50 rounded-md border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? 'Success' : 'Failed'}
                </Badge>
                <span className="font-medium">{result.message}</span>
              </div>
              
              {result.successCount !== undefined && (
                <div className="text-xs text-green-700">
                  Success: {result.successCount}, Failed: {result.failedCount || 0}
                </div>
              )}
            </div>

            {result.results && result.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Individual Results:</h4>
                <div className="space-y-1 max-h-40 overflow-auto">
                  {result.results.map((r: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 text-xs bg-gray-50 rounded"
                    >
                      <span className="font-mono">{r.username}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={r.success ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {r.success ? 'OK' : 'Failed'}
                        </Badge>
                        {r.message && (
                          <span className="text-muted-foreground">{r.message}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                Raw Response
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}