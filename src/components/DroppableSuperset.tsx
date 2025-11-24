import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ReactNode } from 'react';

interface DroppableSupersetProps {
  id: string;
  exerciseIds: string[];
  children: ReactNode;
  isEmpty?: boolean;
}

export function DroppableSuperset({ id, exerciseIds, children, isEmpty = false }: DroppableSupersetProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] transition-colors ${isOver ? 'bg-primary/10 border-primary border-2 rounded' : ''}`}
    >
      <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
        {isEmpty ? (
          <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded">
            Drop exercises here
          </div>
        ) : (
          children
        )}
      </SortableContext>
    </div>
  );
}

