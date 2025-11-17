import { useState } from 'react';
import { Button } from './components/ui/button';

export default function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="mb-4">TraininQ - Minimal Test</h1>
      <p className="mb-4">Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
