import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import { CardGridItem } from "../shared/shared-components";

type SortablePresetCardProps = {
  id: string;
  children: ReactNode;
};

export const SortablePresetCard = ({
  id,
  children,
}: SortablePresetCardProps) => {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <CardGridItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </CardGridItem>
  );
  /* eslint-enable react/jsx-props-no-spreading */
};
