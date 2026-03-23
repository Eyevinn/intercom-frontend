import { useState, useCallback, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { API, TBasicProductionResponse, TPreset } from "../../api/api";
import { usePresets } from "../../hooks/use-presets";
import { CollapsibleItem } from "../shared/collapsible-item";
import { PageHeader } from "../page-layout/page-header";
import {
  UsersIcon,
  EditIcon,
  SaveIcon,
  RemoveIcon,
} from "../../assets/icons/icon";
import {
  Lineblock,
  ParticipantCount,
  ParticipantCountWrapper,
  AddLineSectionForm,
  AddLineHeader,
  RemoveIconWrapper,
  CreateLineButton,
  ManageLineInputRow,
} from "../production-list/production-list-components";
import {
  FormInput,
  FormSelect,
  SecondaryButton,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import {
  ButtonsWrapper,
  DeleteButton,
} from "../delete-button/delete-button-components";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 0 0 2rem;
  align-items: flex-start;
`;

const PresetName = styled.span`
  font-size: 1.4rem;
  font-weight: bold;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 0.5rem;
`;

const EditWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  overflow: hidden;
`;

const EditNameInput = styled(FormInput)`
  margin: 0;
  font-size: 1.4rem;
  padding: 0.5rem;
  min-width: 0;
  max-width: 100%;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #9e9e9e;
  display: flex;
  justify-content: flex-start;
  align-self: flex-start;
  flex-shrink: 0;
  height: 2rem;
  width: 2rem;

  svg {
    width: 100%;
    height: 100%;
  }

  &:hover svg {
    transform: scale(1.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:disabled:hover svg {
    transform: none;
  }

  &.save {
    justify-content: center;
    align-self: center;
  }

  &.edit {
    align-self: flex-start;
  }
`;

const Spacer = styled.span`
  flex: 1;
`;

const CallEntryList = styled.ul`
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const LineName = styled.div`
  font-weight: bold;
  font-size: 1.5rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ProductionSubtext = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 0.2rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const LineNameWrapper = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const ActionBar = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  justify-content: flex-end;
`;

const AddCallToggleButton = styled(SecondaryButton)`
  flex-shrink: 0;
`;

const SpacedRow = styled(ManageLineInputRow)`
  margin-bottom: 1rem;
`;

const FullWidthSelect = styled(FormSelect)`
  width: 100%;
`;

const NoMarginButtonsWrapper = styled(ButtonsWrapper)`
  margin-top: 0;
  margin-bottom: 0;
`;

type ManagePresetCardProps = {
  preset: TPreset;
  productions: TBasicProductionResponse[];
  onUpdate: (
    id: string,
    update: {
      name?: string;
      calls?: { productionId: string; lineId: string }[];
    }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const ManagePresetCard = ({
  preset,
  productions,
  onUpdate,
  onDelete,
}: ManagePresetCardProps) => {
  const [selectedProductionId, setSelectedProductionId] = useState<string>("");
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [addCallError, setAddCallError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddCall, setShowAddCall] = useState(false);

  // Inline name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const editWrapperRef = useRef<HTMLSpanElement>(null);

  // Cancel name edit on click-outside
  useEffect(() => {
    if (!isEditingName) return undefined;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        editWrapperRef.current &&
        !editWrapperRef.current.contains(e.target as Node)
      ) {
        setIsEditingName(false);
        setEditNameValue("");
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isEditingName]);

  const handleEditNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditNameValue(preset.name);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed || trimmed === preset.name) {
      setIsEditingName(false);
      setEditNameValue("");
      return;
    }
    setSavingName(true);
    try {
      // eslint-disable-next-line no-underscore-dangle
      await onUpdate(preset._id, { name: trimmed });
      setIsEditingName(false);
      setEditNameValue("");
    } finally {
      setSavingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsEditingName(false);
      setEditNameValue("");
    }
    if (
      e.key === "Enter" &&
      !savingName &&
      editNameValue.trim() !== preset.name.trim()
    ) {
      handleSaveName();
    }
  };

  const resolveCall = (call: { productionId: string; lineId: string }) => {
    const production = productions.find(
      (p) => p.productionId === call.productionId
    );
    const line = production?.lines.find((l) => l.id === call.lineId);
    return { production, line };
  };

  const totalParticipants = preset.calls.reduce((sum, call) => {
    const { line } = resolveCall(call);
    return sum + (line?.participants.filter((p) => !p.isWhip).length ?? 0);
  }, 0);

  const selectedProduction = productions.find(
    (p) => p.productionId === selectedProductionId
  );

  const handleRemoveCall = async (
    callProductionId: string,
    callLineId: string
  ) => {
    const remaining = preset.calls.filter(
      (c) => !(c.productionId === callProductionId && c.lineId === callLineId)
    );
    setUpdating(true);
    try {
      // eslint-disable-next-line no-underscore-dangle
      await onUpdate(preset._id, { calls: remaining });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddCall = async () => {
    setAddCallError(null);
    if (!selectedProductionId || !selectedLineId) return;

    const alreadyExists = preset.calls.some(
      (c) =>
        c.productionId === selectedProductionId && c.lineId === selectedLineId
    );

    if (alreadyExists) {
      setAddCallError("This call is already in the preset.");
      return;
    }

    const newCall = {
      productionId: selectedProductionId,
      lineId: selectedLineId,
    };
    setUpdating(true);
    try {
      // eslint-disable-next-line no-underscore-dangle
      await onUpdate(preset._id, { calls: [...preset.calls, newCall] });
      setSelectedProductionId("");
      setSelectedLineId("");
      setShowAddCall(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleProductionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductionId(e.target.value);
    setSelectedLineId("");
    setAddCallError(null);
  };

  const headerContent = (
    <>
      <EditWrapper ref={editWrapperRef}>
        {isEditingName ? (
          <>
            <EditNameInput
              className="edit-name"
              autoFocus
              autoComplete="off"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onClick={(e) => e.stopPropagation()}
              disabled={savingName}
            />
            <IconButton
              className="save"
              type="button"
              disabled={
                savingName || editNameValue.trim() === preset.name.trim()
              }
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSaveName();
              }}
              title="Save name"
            >
              <SaveIcon />
            </IconButton>
          </>
        ) : (
          <>
            <PresetName title={preset.name}>{preset.name}</PresetName>
            <IconButton
              className="edit"
              type="button"
              onClick={handleEditNameClick}
              title="Edit name"
            >
              <EditIcon />
            </IconButton>
          </>
        )}
      </EditWrapper>
      <ParticipantCountWrapper
        className={totalParticipants > 0 ? "active" : ""}
      >
        <UsersIcon />
        <ParticipantCount>{totalParticipants}</ParticipantCount>
      </ParticipantCountWrapper>
      <Spacer />
    </>
  );

  const expandedContent = (
    <>
      <CallEntryList>
        {preset.calls.map((call, idx) => {
          const { production, line } = resolveCall(call);
          const lineName = line ? line.name : `Line ${call.lineId}`;
          const productionName = production?.name ?? call.productionId;

          return (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`${call.productionId}-${call.lineId}-${idx}`}>
              <Lineblock>
                <LineNameWrapper>
                  <LineName>{lineName}</LineName>
                  <ProductionSubtext>{productionName}</ProductionSubtext>
                </LineNameWrapper>
                <DeleteButton
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    handleRemoveCall(call.productionId, call.lineId)
                  }
                >
                  Remove
                </DeleteButton>
              </Lineblock>
            </li>
          );
        })}
      </CallEntryList>

      {showAddCall && (
        <AddLineSectionForm onSubmit={(e) => e.preventDefault()}>
          <AddLineHeader>
            <span>Add Call</span>
            <RemoveIconWrapper
              onClick={() => {
                setShowAddCall(false);
                setAddCallError(null);
                setSelectedProductionId("");
                setSelectedLineId("");
              }}
            >
              <RemoveIcon />
            </RemoveIconWrapper>
          </AddLineHeader>
          <SpacedRow>
            <FullWidthSelect
              value={selectedProductionId}
              onChange={handleProductionChange}
            >
              <option value="">Select production…</option>
              {productions.map((p) => (
                <option key={p.productionId} value={p.productionId}>
                  {p.name}
                </option>
              ))}
            </FullWidthSelect>
          </SpacedRow>
          <SpacedRow>
            <FullWidthSelect
              value={selectedLineId}
              onChange={(e) => {
                setSelectedLineId(e.target.value);
                setAddCallError(null);
              }}
              disabled={!selectedProduction}
            >
              <option value="">Select line…</option>
              {selectedProduction?.lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </FullWidthSelect>
          </SpacedRow>
          {addCallError && (
            <StyledWarningMessage style={{ marginTop: "0.5rem" }}>
              {addCallError}
            </StyledWarningMessage>
          )}
          <CreateLineButton
            type="button"
            disabled={!selectedProductionId || !selectedLineId || updating}
            onClick={handleAddCall}
          >
            Add
          </CreateLineButton>
        </AddLineSectionForm>
      )}

      <ActionBar>
        <AddCallToggleButton
          type="button"
          onClick={() => setShowAddCall((prev) => !prev)}
        >
          Add Call
        </AddCallToggleButton>
        <NoMarginButtonsWrapper>
          <DeleteButton
            type="button"
            disabled={updating}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Preset
          </DeleteButton>
        </NoMarginButtonsWrapper>
      </ActionBar>

      {showDeleteConfirm && (
        <ConfirmationModal
          title="Delete Preset"
          description={`You are about to delete the preset: ${preset.name}. Are you sure?`}
          onCancel={() => setShowDeleteConfirm(false)}
          // eslint-disable-next-line no-underscore-dangle
          onConfirm={() => onDelete(preset._id)}
        />
      )}
    </>
  );

  return (
    <CollapsibleItem
      headerContent={headerContent}
      expandedContent={expandedContent}
      // eslint-disable-next-line no-underscore-dangle
      testId={`manage-preset-${preset._id}`}
    />
  );
};

type ManagePresetsListProps = {
  productions: TBasicProductionResponse[];
};

export const ManagePresetsList = ({ productions }: ManagePresetsListProps) => {
  const { presets, loading, deletePreset } = usePresets();
  const [localPresets, setLocalPresets] = useState<TPreset[] | null>(null);

  const displayPresets = localPresets ?? presets;

  const handleUpdate = useCallback(
    async (
      id: string,
      update: {
        name?: string;
        calls?: { productionId: string; lineId: string }[];
      }
    ) => {
      const updated = await API.updatePreset(id, update);
      setLocalPresets((prev) => {
        const base = prev ?? presets;
        return base.map((p) =>
          // eslint-disable-next-line no-underscore-dangle
          p._id === id ? updated : p
        );
      });
    },
    [presets]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deletePreset(id);
      setLocalPresets((prev) => {
        const base = prev ?? presets;
        // eslint-disable-next-line no-underscore-dangle
        return base.filter((p) => p._id !== id);
      });
    },
    [deletePreset, presets]
  );

  if (loading || displayPresets.length === 0) return null;

  return (
    <>
      <PageHeader title="Manage Presets" />
      <ListWrapper>
        {displayPresets.map((preset) => (
          <ManagePresetCard
            // eslint-disable-next-line no-underscore-dangle
            key={preset._id}
            preset={preset}
            productions={productions}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ListWrapper>
    </>
  );
};
