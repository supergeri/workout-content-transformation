import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

export default function App() {
  const [message, setMessage] = useState('Click the button');
  
  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <CardTitle>TraininQ - Test Build</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{message}</p>
          <Button onClick={() => setMessage('Build is working!')}>
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
