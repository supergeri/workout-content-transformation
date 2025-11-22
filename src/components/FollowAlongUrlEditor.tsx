import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Video, ExternalLink, Edit2, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { FollowAlongInstructions } from './FollowAlongInstructions';

type Props = {
  url: string | null | undefined;
  onSave: (url: string | null) => void;
  exerciseName: string;
  compact?: boolean;
};

export function FollowAlongUrlEditor({ url, onSave, exerciseName, compact = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editUrl, setEditUrl] = useState(url || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(editUrl.trim() || null);
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditUrl(url || '');
    setIsEditing(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
            title="View follow-along video"
            onClick={(e) => e.stopPropagation()}
          >
            <Video className="w-4 h-4" />
          </a>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title="Edit follow-along URL"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Follow-Along Video for {exerciseName}</DialogTitle>
              <DialogDescription>
                Add an Instagram, TikTok, YouTube, or any video URL for this exercise
              </DialogDescription>
            </DialogHeader>
            <div className="mb-4">
              <FollowAlongInstructions />
            </div>
            <div className="space-y-4">
              <div>
                <Label>Video URL</Label>
                <Input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/... or https://www.tiktok.com/..."
                  type="url"
                />
              </div>
              {editUrl && (
                <a
                  href={editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Open link <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => {
                  setEditUrl('');
                  handleSave();
                }}>
                  Clear
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsOpen(false);
                  handleCancel();
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm flex items-center gap-2">
        <Video className="w-4 h-4" />
        Follow-Along Video URL
      </Label>
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="Instagram, TikTok, YouTube, or any video URL"
            type="url"
          />
          {editUrl && (
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Open link <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditUrl('');
                handleSave();
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 flex-1"
            >
              <Video className="w-4 h-4" />
              {url.length > 50 ? `${url.substring(0, 50)}...` : url}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No follow-along video</span>
          )}
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

