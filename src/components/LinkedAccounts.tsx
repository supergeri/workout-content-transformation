import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { 
  Activity,
  Mountain,
  TrendingUp,
  Smartphone,
  Watch,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  getLinkedAccounts,
  connectAccount,
  disconnectAccount,
  isAccountExpired,
  getOAuthUrl,
  PLATFORM_INFO,
  LinkedAccountProvider,
  LinkedAccountStatus,
} from '../lib/linked-accounts';

type Props = {
  onAccountsChange?: () => void;
};

export function LinkedAccounts({ onAccountsChange }: Props) {
  const [accounts, setAccounts] = useState(getLinkedAccounts());
  const [selectedProvider, setSelectedProvider] = useState<LinkedAccountProvider | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    setAccounts(getLinkedAccounts());
  }, []);

  const handleConnect = (provider: LinkedAccountProvider) => {
    // In production, this would redirect to OAuth URL
    const oauthUrl = getOAuthUrl(provider);
    console.log('Redirecting to OAuth URL:', oauthUrl);
    
    // Simulate OAuth success with promise
    const connectPromise = new Promise((resolve) => {
      setTimeout(() => {
        connectAccount(provider, ['read_activities', 'write_activities']);
        setAccounts(getLinkedAccounts());
        onAccountsChange?.();
        resolve(true);
      }, 1500);
    });

    toast.promise(connectPromise, {
      loading: 'Connecting to ' + PLATFORM_INFO[provider].name + '...',
      success: PLATFORM_INFO[provider].name + ' connected successfully!',
      error: 'Failed to connect to ' + PLATFORM_INFO[provider].name,
    });
  };

  const handleManage = (provider: LinkedAccountProvider) => {
    setSelectedProvider(provider);
    setShowManageModal(true);
  };

  const handleDisconnect = () => {
    if (!selectedProvider) return;
    
    disconnectAccount(selectedProvider);
    setAccounts(getLinkedAccounts());
    setShowManageModal(false);
    toast.success(PLATFORM_INFO[selectedProvider].name + ' disconnected.');
    onAccountsChange?.();
  };

  const handleReconnect = (provider: LinkedAccountProvider) => {
    handleConnect(provider);
  };

  const getProviderIcon = (provider: LinkedAccountProvider) => {
    const iconMap = {
      strava: Activity,
      relive: Mountain,
      trainingPeaks: TrendingUp,
      appleHealth: Smartphone,
      garmin: Watch,
      amazfit: Watch,
    };
    
    const Icon = iconMap[provider];
    return <Icon className="w-5 h-5" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAccountCard = (provider: LinkedAccountProvider, status: LinkedAccountStatus) => {
    const info = PLATFORM_INFO[provider];
    const isExpired = isAccountExpired(provider);
    
    return (
      <Card key={provider} className={!info.available ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: info.color + '20' }}
              >
                <div style={{ color: info.color }}>
                  {getProviderIcon(provider)}
                </div>
              </div>
              <div>
                <CardTitle className="text-base">{info.name}</CardTitle>
                <CardDescription className="text-sm mt-1">{info.subtitle}</CardDescription>
              </div>
            </div>
            
            {/* Status Badge */}
            {info.available && (
              <div>
                {status.connected && !isExpired && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {status.connected && isExpired && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Expired
                  </Badge>
                )}
                {!status.connected && (
                  <Badge variant="secondary">Not Connected</Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {!info.available && info.unavailableReason && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {info.unavailableReason}
              </AlertDescription>
            </Alert>
          )}
          
          {info.available && (
            <div className="space-y-3">
              {/* Connection Info */}
              {status.connected && !isExpired && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Connected on:</span>
                    <span>{formatDate(status.connectedAt)}</span>
                  </div>
                  {status.lastSyncAt && (
                    <div className="flex items-center justify-between">
                      <span>Last synced:</span>
                      <span>{formatDate(status.lastSyncAt)}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {!status.connected && (
                  <Button
                    onClick={() => handleConnect(provider)}
                    className="w-full"
                    style={{ backgroundColor: info.color }}
                  >
                    Connect {info.name}
                  </Button>
                )}
                
                {status.connected && isExpired && (
                  <Button
                    onClick={() => handleReconnect(provider)}
                    variant="default"
                    className="w-full"
                  >
                    Reconnect {info.name}
                  </Button>
                )}
                
                {status.connected && !isExpired && (
                  <Button
                    onClick={() => handleManage(provider)}
                    variant="outline"
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Linked Accounts</h2>
        <p className="text-muted-foreground">
          Manage your connected apps and authorize MyAmaka to enhance your workouts.
        </p>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(PLATFORM_INFO) as LinkedAccountProvider[]).map((provider) => 
          renderAccountCard(provider, accounts[provider])
        )}
      </div>

      {/* Manage Connection Modal */}
      {selectedProvider && (
        <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage {PLATFORM_INFO[selectedProvider].name} Connection</DialogTitle>
              <DialogDescription>
                View connection details and manage authorization
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">Connected and Active</span>
              </div>

              {/* Connection Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Connected on:</span>
                  <span>{formatDate(accounts[selectedProvider].connectedAt)}</span>
                </div>

                {accounts[selectedProvider].lastSyncAt && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Last synced:</span>
                    <span>{formatDate(accounts[selectedProvider].lastSyncAt)}</span>
                  </div>
                )}

                {accounts[selectedProvider].expiresAt && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Expires on:</span>
                    <span>
                      {new Date(accounts[selectedProvider].expiresAt!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Permissions */}
              {accounts[selectedProvider].permissions && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Permissions:</span>
                  <div className="flex flex-wrap gap-2">
                    {accounts[selectedProvider].permissions?.map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Disconnecting MyAmaka from {PLATFORM_INFO[selectedProvider].name} will remove all access. You can reconnect anytime.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="w-full sm:w-auto"
              >
                Revoke Authorization
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowManageModal(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}