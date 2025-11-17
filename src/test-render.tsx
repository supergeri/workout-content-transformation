import { useState } from 'react';
import { Button } from './components/ui/button';

export default function TestRender() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-8">
      <h1>Test Render</h1>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
