import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { searchExercises, ExerciseLibraryItem } from '../lib/exercise-library';
import { Search } from 'lucide-react';

interface ExerciseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (exercise: ExerciseLibraryItem) => void;
  placeholder?: string;
}

export function ExerciseAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Search exercises..." 
}: ExerciseAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<ExerciseLibraryItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const searchResults = searchExercises(value, 8);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (exercise: ExerciseLibraryItem) => {
    onChange(exercise.name);
    setIsOpen(false);
    onSelect?.(exercise);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-[300px] overflow-auto shadow-lg">
          <div className="p-1">
            {results.map((exercise, index) => (
              <div
                key={exercise.id}
                onClick={() => handleSelect(exercise)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{exercise.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {exercise.category}
                      </Badge>
                      {exercise.equipment && (
                        <span className="text-xs text-muted-foreground">
                          {exercise.equipment}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
