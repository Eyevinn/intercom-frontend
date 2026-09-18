import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProductionsListItem } from "./production-list-item.tsx";
import { TBasicProductionResponse } from "../../api/api.ts";
import { CardGridCell } from "../shared/shared-components.ts";

type SortableProductionsListItemProps = {
  production: TBasicProductionResponse;
  managementMode?: boolean;
};

export const SortableProductionsListItem = ({
  production,
  managementMode = false,
}: SortableProductionsListItemProps) => {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef,
  } = useSortable({ id: production.productionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <CardGridCell ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProductionsListItem
        production={production}
        managementMode={managementMode}
      />
    </CardGridCell>
  );
  /* eslint-enable react/jsx-props-no-spreading */
};
