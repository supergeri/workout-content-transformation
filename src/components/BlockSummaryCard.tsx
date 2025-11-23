import { Block } from '../types/workout';
import { getStructureDisplayName, getBlockSummary } from '../lib/workout-utils';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BlockSummaryCardProps {
  block: Block;
  onSelect: () => void;
  onDelete: () => void;
}

export function BlockSummaryCard({ block, onSelect, onDelete }: BlockSummaryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: `workout-${block.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const structureName = getStructureDisplayName(block.structure);
  const summary = getBlockSummary(block);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 cursor-pointer"
      onClick={onSelect}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{block.label}</span>
          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
            {structureName}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{summary}</p>
      </div>
      
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSelect}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

