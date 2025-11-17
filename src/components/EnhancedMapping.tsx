import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';
import { ValidationResult } from '../types/workout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';

interface EnhancedMappingProps {
  result: ValidationResult;
  onApplyMapping: (exerciseName: string, newMapping: string) => void;
  onAcceptMapping: (exerciseName: string) => void;
}

export function EnhancedMapping({ result, onApplyMapping, onAcceptMapping }: EnhancedMappingProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [customMapping, setCustomMapping] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleApplySuggestion = () => {
    if (selectedSuggestion) {
      onApplyMapping(result.original_name, selectedSuggestion);
      toast.success('Mapping applied successfully');
      setIsDialogOpen(false);
      setSelectedSuggestion('');
    }
  };

  const handleApplyCustom = () => {
    if (customMapping.trim()) {
      onApplyMapping(result.original_name, customMapping.trim());
      toast.success('Custom mapping applied');
      setIsDialogOpen(false);
      setCustomMapping('');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Simulate search API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSearching(false);
    toast.success(`Found ${Math.floor(Math.random() * 10) + 3} similar exercises`);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-orange-600';
    return 'text-red-600';
  };

  const allSuggestions = [
    ...(result.suggestions?.similar || []),
    ...(result.suggestions?.by_type || [])
  ];
  
  const topSuggestions = allSuggestions.slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base">{result.original_name}</CardTitle>
            {result.mapped_to && result.mapped_to !== result.original_name && (
              <CardDescription className="mt-1 flex items-center gap-2">
                <ArrowRight className="w-3 h-3" />
                {result.mapped_to}
              </CardDescription>
            )}
          </div>
          <Badge 
            variant={result.confidence >= 0.9 ? 'default' : result.confidence >= 0.7 ? 'secondary' : 'destructive'}
            className={getConfidenceColor(result.confidence)}
          >
            {(result.confidence * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick Suggestions */}
        {topSuggestions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">AI Suggestions</Label>
            {topSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm">{suggestion.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(suggestion.score * 100).toFixed(0)}% match
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onApplyMapping(result.original_name, suggestion.name);
                    toast.success('Quick mapping applied');
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {result.status === 'valid' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onAcceptMapping(result.original_name);
                toast.success('Mapping confirmed');
              }}
            >
              <ThumbsUp className="w-3 h-3 mr-2" />
              Confirm
            </Button>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                {result.status === 'needs_review' && !result.mapped_to ? 'Find Mapping' : 'Change Mapping'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Map Exercise: {result.original_name}</DialogTitle>
                <DialogDescription>
                  Select an AI suggestion, search for alternatives, or create a custom mapping
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search Similar Exercises</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search exercise database..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* All Suggestions */}
                {allSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <Label>AI Suggestions ({allSuggestions.length})</Label>
                    <Select value={selectedSuggestion} onValueChange={setSelectedSuggestion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a suggested mapping..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allSuggestions.map((suggestion, idx) => (
                          <SelectItem key={idx} value={suggestion.name}>
                            <div className="flex items-center gap-3">
                              <span>{suggestion.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {(suggestion.score * 100).toFixed(0)}%
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleApplySuggestion}
                      disabled={!selectedSuggestion}
                      className="w-full"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Apply Selected Suggestion
                    </Button>
                  </div>
                )}

                {/* Custom Mapping */}
                <div className="space-y-2">
                  <Label>Custom Mapping</Label>
                  <Input
                    placeholder="Enter custom exercise name..."
                    value={customMapping}
                    onChange={(e) => setCustomMapping(e.target.value)}
                  />
                  <Button
                    onClick={handleApplyCustom}
                    disabled={!customMapping.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Use Custom Mapping
                  </Button>
                </div>

                {/* Reject Option */}
                {result.status !== 'unmapped' && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        toast.info('Exercise marked for manual review');
                        setIsDialogOpen(false);
                      }}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Reject Mapping
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}