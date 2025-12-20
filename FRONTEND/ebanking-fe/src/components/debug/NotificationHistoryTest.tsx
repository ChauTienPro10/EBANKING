import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  listHistory, 
  formatNotificationForDisplay,
  getNotificationTypeText,
  type ListHistoryResponse 
} from '@/services/notificationService';

export function NotificationHistoryTest() {
  const [index, setIndex] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading notification history with params:', { index, limit });
      const response = await listHistory({ index, limit });
      
      setResult(response);
      console.log('Notification history response:', response);
    } catch (err: any) {
      console.error('Notification history error:', err);
      setError(err.message || 'Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on component mount
  useEffect(() => {
    handleLoadHistory();
  }, []);

  const handleNextPage = () => {
    setIndex(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setIndex(prev => Math.max(0, prev - 1));
  };

  const handlePageLoad = () => {
    handleLoadHistory();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Notification History Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the notification history API endpoint: /notifications/history
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="text-sm font-medium">Index (Page)</label>
            <Input
              type="number"
              value={index}
              onChange={(e) => setIndex(parseInt(e.target.value) || 0)}
              min="0"
              className="w-20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
              min="1"
              max="100"
              className="w-20"
            />
          </div>

          <Button 
            onClick={handlePageLoad}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load History'}
          </Button>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Pagination Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                Showing {result.content.length} of {result.total} notifications
                (Page {result.page} of {result.totalPages})
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={index === 0 || loading}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={index >= result.totalPages - 1 || loading}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {result.content.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications found
                </div>
              ) : (
                result.content.map((notification) => {
                  const formatted = formatNotificationForDisplay(notification);
                  return (
                    <div 
                      key={notification.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{notification.title}</h3>
                            <Badge variant="outline">
                              {getNotificationTypeText(notification.type)}
                            </Badge>
                            {notification.status && (
                              <Badge variant="secondary">
                                {notification.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.content}
                          </p>
                          
                          {/* Additional info based on type */}
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>ID: {notification.id}</div>
                            <div>Created: {formatted.time}</div>
                            {notification.username && (
                              <div>Username: {notification.username}</div>
                            )}
                            {notification.sender && (
                              <div>Sender: {notification.sender}</div>
                            )}
                            {notification.amount && (
                              <div>Amount: {notification.amount}</div>
                            )}
                            {notification.noiDungGiaoDich && (
                              <div>Transaction Content: {notification.noiDungGiaoDich}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Raw Response */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                Raw API Response
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}