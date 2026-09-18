import {
  useSensors,
  useSensor,
  DndContext,
  closestCenter,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useCallback } from "react";
import { TBasicProductionResponse } from "../../api/api.ts";
import { LocalError } from "../error.tsx";
import { ProductionsListItem } from "./production-list-item.tsx";
import { SortableProductionsListItem } from "./sortable-production-list-item.tsx";
import { CardGrid, CardGridCell } from "../shared/shared-components.ts";

type TProductionsList = {
  productions: TBasicProductionResponse[];
  error: Error | null;
  managementMode?: boolean;
  onReorder?: (activeId: string, overId: string) => void;
};

export const ProductionsList = ({
  productions,
  error,
  managementMode = false,
  onReorder,
}: TProductionsList) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id && onReorder) {
        onReorder(active.id as string, over.id as string);
      }
    },
    [onReorder]
  );

  const errorCell = error && (
    <div style={{ gridColumn: "1 / -1" }}>
      <LocalError error={error} />
    </div>
  );

  if (!onReorder) {
    return (
      <CardGrid>
        {errorCell}
        {!error &&
          productions &&
          productions.map((p) => (
            <CardGridCell key={p.productionId}>
              <ProductionsListItem
                production={p}
                managementMode={managementMode}
              />
            </CardGridCell>
          ))}
      </CardGrid>
    );
  }

  const productionIds = productions.map((p) => p.productionId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={productionIds} strategy={rectSortingStrategy}>
        <CardGrid>
          {errorCell}
          {!error &&
            productions &&
            productions.map((p) => (
              <SortableProductionsListItem
                key={p.productionId}
                production={p}
                managementMode={managementMode}
              />
            ))}
        </CardGrid>
      </SortableContext>
    </DndContext>
  );
};
