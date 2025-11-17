import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { 
  Users, 
  UserPlus, 
  Send, 
  QrCode, 
  Copy,
  Check,
  X,
  Mail,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import QRCode from 'react-qr-code';

// Mock clients data
const MOCK_CLIENTS = [
  { id: '1', name: 'John Smith', email: 'john@example.com', devices: ['garmin', 'apple'] as const },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', devices: ['garmin'] as const },
  { id: '3', name: 'Mike Williams', email: 'mike@example.com', devices: ['apple', 'zwift'] as const },
  { id: '4', name: 'Emily Brown', email: 'emily@example.com', devices: ['garmin'] as const },
  { id: '5', name: 'David Lee', email: 'david@example.com', devices: ['zwift'] as const },
];

// Mock classes data
const MOCK_CLASSES = [
  { id: '1', name: 'Morning Warriors', memberCount: 15, schedule: 'Mon/Wed/Fri 6:00 AM' },
  { id: '2', name: 'Elite Athletes', memberCount: 8, schedule: 'Tue/Thu 5:00 PM' },
  { id: '3', name: 'Weekend Warriors', memberCount: 22, schedule: 'Sat/Sun 8:00 AM' },
  { id: '4', name: 'CrossFit Fundamentals', memberCount: 12, schedule: 'Mon-Fri 7:00 PM' },
];

interface TrainerDistributionProps {
  workoutTitle: string;
}

export function TrainerDistribution({ workoutTitle }: TrainerDistributionProps) {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);

  // Generate unique workout URL for QR code
  const workoutUrl = `https://amakaflow.com/w/${btoa(workoutTitle).slice(0, 12)}`;

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const selectAllClients = () => {
    setSelectedClients(MOCK_CLIENTS.map(c => c.id));
  };

  const clearAllClients = () => {
    setSelectedClients([]);
  };

  const selectAllClasses = () => {
    setSelectedClasses(MOCK_CLASSES.map(c => c.id));
  };

  const clearAllClasses = () => {
    setSelectedClasses([]);
  };

  const sendToClients = () => {
    if (selectedClients.length === 0) {
      toast.error('Please select at least one client');
      return;
    }

    const clients = MOCK_CLIENTS.filter(c => selectedClients.includes(c.id));
    toast.success(`Sending workout to ${selectedClients.length} client${selectedClients.length > 1 ? 's' : ''}`, {
      description: clients.map(c => c.name).join(', ')
    });
    setSelectedClients([]);
  };

  const sendToClasses = () => {
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    const classes = MOCK_CLASSES.filter(c => selectedClasses.includes(c.id));
    const totalMembers = classes.reduce((sum, c) => sum + c.memberCount, 0);
    
    toast.success(`Sending workout to ${selectedClasses.length} class${selectedClasses.length > 1 ? 'es' : ''} (${totalMembers} members)`, {
      description: classes.map(c => c.name).join(', ')
    });
    setSelectedClasses([]);
  };

  const copyQrUrl = async () => {
    try {
      await navigator.clipboard.writeText(workoutUrl);
      setCopiedQr(true);
      toast.success('Workout URL copied to clipboard');
      setTimeout(() => setCopiedQr(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const downloadQrCode = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${workoutTitle}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR code downloaded');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Trainer Distribution
            </CardTitle>
            <CardDescription>
              Send this workout to your clients or generate a QR code for classes
            </CardDescription>
          </div>
          <Badge variant="secondary">Trainer Mode</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clients">Individual Clients</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          {/* Individual Clients */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Clients ({selectedClients.length} selected)</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selectAllClients}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllClients}
                  disabled={selectedClients.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>

            <ScrollArea className="h-64 w-full rounded-md border">
              <div className="p-4 space-y-2">
                {MOCK_CLIENTS.map(client => (
                  <div
                    key={client.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => toggleClient(client.id)}
                  >
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => toggleClient(client.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{client.name}</span>
                        <div className="flex gap-1">
                          {client.devices.map(device => (
                            <Badge key={device} variant="outline" className="text-xs">
                              {device}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button
              onClick={sendToClients}
              disabled={selectedClients.length === 0}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to {selectedClients.length} Client{selectedClients.length !== 1 ? 's' : ''}
            </Button>
          </TabsContent>

          {/* Classes */}
          <TabsContent value="classes" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Classes ({selectedClasses.length} selected)</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selectAllClasses}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllClasses}
                  disabled={selectedClasses.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>

            <ScrollArea className="h-64 w-full rounded-md border">
              <div className="p-4 space-y-2">
                {MOCK_CLASSES.map(classItem => (
                  <div
                    key={classItem.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => toggleClass(classItem.id)}
                  >
                    <Checkbox
                      checked={selectedClasses.includes(classItem.id)}
                      onCheckedChange={() => toggleClass(classItem.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{classItem.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {classItem.memberCount} members
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {classItem.schedule}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button
              onClick={sendToClasses}
              disabled={selectedClasses.length === 0}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to {selectedClasses.length} Class{selectedClasses.length !== 1 ? 'es' : ''}
              {selectedClasses.length > 0 && ` (${MOCK_CLASSES.filter(c => selectedClasses.includes(c.id)).reduce((sum, c) => sum + c.memberCount, 0)} members)`}
            </Button>
          </TabsContent>

          {/* QR Code */}
          <TabsContent value="qr" className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCode
                  id="qr-code"
                  value={workoutUrl}
                  size={256}
                  level="H"
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Workout:</span> <strong>{workoutTitle}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Students can scan this QR code to import the workout to their devices
                </p>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={copyQrUrl}
                  className="flex-1"
                >
                  {copiedQr ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadQrCode}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </div>

              <div className="w-full p-3 bg-muted rounded-lg text-xs break-all">
                {workoutUrl}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Label>Usage Instructions</Label>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Display QR code on screen or print for in-person classes</span>
                </div>
                <div className="flex gap-2">
                  <QrCode className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Students scan with AmakaFlow mobile app or camera</span>
                </div>
                <div className="flex gap-2">
                  <Send className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Workout auto-syncs to their preferred device (Garmin, Apple, Zwift)</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}