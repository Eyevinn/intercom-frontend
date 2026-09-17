import { ReactNode, useEffect, useMemo, useState } from "react";
import { TBridgeState } from "../../api/api";
import { DeleteIcon, PlayIcon, StopIcon } from "../../assets/icons/icon";
import {
  ButtonsWrapper,
  DeleteButton,
  SpinnerWrapper,
} from "../delete-button/delete-button-components";
import { useFetchProduction } from "../landing-page/use-fetch-production";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import { Spinner } from "../loader/loader";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import {
  ButtonContentWrapper,
  IconWrapper,
  StateChangeButton,
} from "./io-bridge-components";
import {
  IOBridgeItemBase,
  IOBridgePropsList,
  TEditableField,
  UrlConfig,
} from "./io-bridge-props-list";

export type IOBridgeUpdatePayload = {
  id: string;
  label: string;
  productionId: number;
  lineId: number;
};

type IOBridgeExpandedContentProps = {
  item: IOBridgeItemBase;
  typeName: string;
  urlConfig: UrlConfig;
  extraRows?: ReactNode;
  toggleLoading: boolean;
  deleteLoading: boolean;
  displayConfirmationModal: boolean;
  onToggle: () => void;
  onUpdate: (payload: IOBridgeUpdatePayload) => Promise<unknown>;
  setDisplayConfirmationModal: (display: boolean) => void;
  setRemoveItemId: (id: string | null) => void;
  refresh?: () => void;
};

const getStateChangeButtonColor = (status: TBridgeState) => {
  switch (status) {
    case "running":
      return "#f96c6c";
    case "failed":
      return "#ebca6a";
    case "stopped":
      return "#22c55e";
    case "idle":
      return "#22c55e";
    default:
      return "#59cbe8";
  }
};

const renderToggleButtonContent = (status: TBridgeState) => {
  if (status === "running") {
    return (
      <ButtonContentWrapper>
        <IconWrapper>
          <StopIcon />
        </IconWrapper>
        <p>Stop</p>
      </ButtonContentWrapper>
    );
  }
  return (
    <ButtonContentWrapper>
      <IconWrapper>
        <PlayIcon />
      </IconWrapper>
      <p>Run</p>
    </ButtonContentWrapper>
  );
};

export const IOBridgeExpandedContent = ({
  item,
  typeName,
  urlConfig,
  extraRows,
  toggleLoading,
  deleteLoading,
  displayConfirmationModal,
  onToggle,
  onUpdate,
  setDisplayConfirmationModal,
  setRemoveItemId,
  refresh,
}: IOBridgeExpandedContentProps) => {
  const [editingField, setEditingField] = useState<TEditableField>(null);
  const [editLabel, setEditLabel] = useState(item.label || "");
  const [editProductionId, setEditProductionId] = useState(item.productionId);
  const [editLineId, setEditLineId] = useState(item.lineId);

  const isDeleteDisabled = item.status === "running";

  const { productions } = useFetchProductionList({ extended: "true" });
  const productionIdNum = item.productionId || null;
  const lineIdStr = item.lineId?.toString() || "";
  const { production } = useFetchProduction(productionIdNum);

  const line = useMemo(
    () =>
      production && lineIdStr
        ? production.lines.find((l) => l.id === lineIdStr)
        : undefined,
    [production, lineIdStr]
  );

  const selectedProduction = useMemo(() => {
    const list = productions?.productions ?? [];
    return list.find(
      (p) => String(p.productionId) === String(editProductionId)
    );
  }, [productions, editProductionId]);

  const availableLines = selectedProduction?.lines || [];

  useEffect(() => {
    // Don't sync from polling while a field is being edited, or in-progress edits get wiped
    if (editingField === null) {
      setEditLabel(item.label || "");
      setEditProductionId(item.productionId);
      setEditLineId(item.lineId);
    }
  }, [item, editingField]);

  const handleSave = async () => {
    const updated = await onUpdate({
      // eslint-disable-next-line no-underscore-dangle
      id: item._id,
      label: editLabel,
      productionId: editProductionId,
      lineId: editLineId,
    });

    if (updated) {
      setEditingField(null);
      if (refresh) refresh();
    }
  };

  const handleCancel = () => {
    setEditLabel(item.label || "");
    setEditProductionId(item.productionId);
    setEditLineId(item.lineId);
    setEditingField(null);
  };

  return (
    <>
      <IOBridgePropsList
        item={item}
        editingField={editingField}
        setEditingField={setEditingField}
        productionName={production?.name ?? ""}
        lineName={line?.name ?? ""}
        productions={productions?.productions ?? []}
        availableLines={availableLines}
        editLabel={editLabel}
        editProductionId={editProductionId}
        editLineId={editLineId}
        setEditLabel={setEditLabel}
        setEditProductionId={setEditProductionId}
        setEditLineId={setEditLineId}
        onSave={handleSave}
        onCancel={handleCancel}
        urlConfig={urlConfig}
        extraRows={extraRows}
      />
      <ButtonsWrapper>
        <StateChangeButton
          onClick={onToggle}
          disabled={toggleLoading}
          bgColor={getStateChangeButtonColor(item.status as TBridgeState)}
        >
          {renderToggleButtonContent(item.status as TBridgeState)}
        </StateChangeButton>
        <DeleteButton
          disabled={isDeleteDisabled}
          onClick={() => setDisplayConfirmationModal(true)}
        >
          <DeleteIcon />
          {deleteLoading && (
            <SpinnerWrapper>
              <Spinner className="production-list" />
            </SpinnerWrapper>
          )}
        </DeleteButton>
      </ButtonsWrapper>
      {displayConfirmationModal && (
        <ConfirmationModal
          title={`Delete ${typeName}`}
          description={`You are about to delete the ${typeName.toLowerCase()} ${
            // eslint-disable-next-line no-underscore-dangle
            item.label ?? `with ID ${item._id}`
          }`}
          confirmationText="Are you sure?"
          onCancel={() => setDisplayConfirmationModal(false)}
          // eslint-disable-next-line no-underscore-dangle
          onConfirm={() => setRemoveItemId(item._id)}
        />
      )}
    </>
  );
};
