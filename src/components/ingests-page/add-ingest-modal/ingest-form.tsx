import { FC } from "react";
import { DisplayContainerHeader } from "../../landing-page/display-container-header";
import { ResponsiveFormContainer } from "../../generic-components";
import { AddIngestForm } from "./add-ingest-form";

interface IngestFormModalProps {
  className?: string;
  onSave?: () => void;
}

export const IngestFormModal: FC<IngestFormModalProps> = (props) => {
  const { className, onSave } = props;

  return (
    <ResponsiveFormContainer className={className}>
      <DisplayContainerHeader>Add New Ingest</DisplayContainerHeader>

      <AddIngestForm onSave={onSave} />
    </ResponsiveFormContainer>
  );
};
