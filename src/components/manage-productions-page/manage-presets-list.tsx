import { useState, useCallback, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { TBasicProductionResponse, TPreset } from "../../api/api";
import { usePresetContext } from "../../contexts/preset-context";
import { CollapsibleItem } from "../shared/collapsible-item";
import { InfoTooltip } from "../info-tooltip/info-tooltip";
import {
  UsersIcon,
  EditIcon,
  SaveIcon,
  RemoveIcon,
  TVIcon,
} from "../../assets/icons/icon";
import {
  IconWrapper,
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

const SectionHeader = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 2rem 1.5rem;

  span {
    top: 1px;
  }
`;

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
    align-self: flex-start;
    padding-top: 0.4rem;
  }

  &.edit {
    align-self: flex-start;
  }
`;

const CompanionIconButton = styled(IconButton)`
  align-self: center;
`;

const Spacer = styled.span`
  flex: 1;
`;

const LocalBadge = styled.span`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.3rem;
  padding: 0.1rem 0.4rem;
  flex-shrink: 0;
`;

const CompanionBadge = styled(LocalBadge)``;

const CompanionEditRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: fit-content;
  margin-left: auto;
`;

const CompanionLabel = styled.span`
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
  flex-shrink: 0;
`;

const CompanionSection = styled.div`
  width: 100%;
`;

const CompanionInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 22rem;
`;

const CompanionPrefix = styled.span`
  position: absolute;
  left: 1.2rem;
  font-size: 1.4rem;
  line-height: 1rem;
  color: #9aa3ab;
  pointer-events: none;
`;

const CompanionInput = styled(FormInput)`
  padding-left: calc(2rem + 3.5ch);
  margin: 0;
  font-size: 1.4rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`;

const CompanionUrl = styled.span`
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.45);
  max-width: 22rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyPresetText = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.45);
  font-style: italic;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  span {
    font-style: normal;
  }
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

const SpacedAddCallForm = styled(AddLineSectionForm)`
  margin-top: 0;
  margin-bottom: 1rem;
`;

const isValidHostPort = (input: string): boolean => {
  const pattern = /^([a-zA-Z0-9.-]+|\[[\da-fA-F:]+\])(:\d{1,5})?$/;
  return pattern.test(input);
};

type ManagePresetCardProps = {
  preset: TPreset;
  productions: TBasicProductionResponse[];
  onUpdate: (
    id: string,
    update: {
      name?: string;
      calls?: { productionId: string; lineId: string }[];
      companionUrl?: string | null;
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

  // Companion editing state
  const [isEditingCompanion, setIsEditingCompanion] = useState(false);
  const [editCompanionValue, setEditCompanionValue] = useState("");
  const [savingCompanion, setSavingCompanion] = useState(false);

  const isEditCompanionValid =
    editCompanionValue.trim() === "" ||
    isValidHostPort(editCompanionValue.trim());

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

  const handleEditCompanionClick = () => {
    const current = preset.companionUrl ?? "";
    setEditCompanionValue(
      current.startsWith("ws://") ? current.slice(5) : current
    );
    setIsEditingCompanion(true);
  };

  const handleCompanionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let v = e.target.value;
    if (v.startsWith("ws://")) v = v.slice(5);
    else if (v.startsWith("wss://")) v = v.slice(6);
    setEditCompanionValue(v);
  };

  const handleSaveCompanion = async () => {
    const trimmed = editCompanionValue.trim();
    const newUrl = trimmed ? `ws://${trimmed}` : null;
    setSavingCompanion(true);
    try {
      // eslint-disable-next-line no-underscore-dangle
      await onUpdate(preset._id, { companionUrl: newUrl });
      setIsEditingCompanion(false);
    } finally {
      setSavingCompanion(false);
    }
  };

  const handleCompanionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") setIsEditingCompanion(false);
    if (e.key === "Enter" && !savingCompanion && isEditCompanionValid)
      handleSaveCompanion();
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
      setAddCallError("This line is already in the saved configuration.");
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
      {preset.isLocal && <LocalBadge>Local</LocalBadge>}
      {preset.companionUrl && <CompanionBadge>Companion</CompanionBadge>}
      <Spacer />
    </>
  );

  const expandedContent = (
    <>
      <CallEntryList>
        {preset.calls.length === 0 && (
          <li>
            <EmptyPresetText>
              No lines in this saved configuration
              <InfoTooltip>
                Lines may have been deleted. You can add new lines below or
                delete this saved configuration.
              </InfoTooltip>
            </EmptyPresetText>
          </li>
        )}
        {preset.calls.map((call, idx) => {
          const { production, line } = resolveCall(call);
          const lineName = line ? line.name : `Line ${call.lineId}`;
          const productionName = production?.name ?? call.productionId;

          return (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`${call.productionId}-${call.lineId}-${idx}`}>
              <Lineblock isProgramOutput={!!line?.programOutputLine}>
                {line?.programOutputLine && (
                  <IconWrapper>
                    <TVIcon />
                  </IconWrapper>
                )}
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
        <SpacedAddCallForm onSubmit={(e) => e.preventDefault()}>
          <AddLineHeader>
            <span>Add Line</span>
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
          <SpacedRow style={{ marginBottom: 0 }}>
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
            style={{ marginTop: "0.5rem" }}
          >
            Add
          </CreateLineButton>
        </SpacedAddCallForm>
      )}

      <CompanionSection>
        <CompanionEditRow>
          <CompanionLabel>Companion</CompanionLabel>
          <InfoTooltip>
            Automatically connect to <strong>Bitfocus Companion</strong> when
            joining this saved configuration. Companion lets you control your{" "}
            <strong>Stream Deck</strong> and other button panels via WebSocket.
            Enter your local Companion server address to enable this.
          </InfoTooltip>
          {isEditingCompanion ? (
            <>
              <CompanionInputWrapper>
                <CompanionPrefix aria-hidden="true">ws://</CompanionPrefix>
                <CompanionInput
                  autoFocus
                  autoComplete="off"
                  placeholder="localhost:12345"
                  value={editCompanionValue}
                  onChange={handleCompanionInputChange}
                  onKeyDown={handleCompanionKeyDown}
                  disabled={savingCompanion}
                />
              </CompanionInputWrapper>
              <CompanionIconButton
                className="save"
                type="button"
                disabled={savingCompanion || !isEditCompanionValid}
                onClick={handleSaveCompanion}
                title="Save"
              >
                <SaveIcon />
              </CompanionIconButton>
              <CompanionIconButton
                type="button"
                onClick={() => setIsEditingCompanion(false)}
                title="Cancel"
              >
                <RemoveIcon />
              </CompanionIconButton>
            </>
          ) : (
            <>
              <CompanionUrl>
                {preset.companionUrl ?? (
                  <span style={{ opacity: 0.4, fontStyle: "italic" }}>
                    Not set
                  </span>
                )}
              </CompanionUrl>
              <IconButton
                className="edit"
                type="button"
                onClick={handleEditCompanionClick}
                title="Edit companion URL"
              >
                <EditIcon />
              </IconButton>
            </>
          )}
        </CompanionEditRow>
        {isEditingCompanion && !isEditCompanionValid && (
          <StyledWarningMessage role="alert">
            Enter a valid host:port (e.g. localhost:12345)
          </StyledWarningMessage>
        )}
      </CompanionSection>

      <ActionBar>
        <AddCallToggleButton
          type="button"
          onClick={() => setShowAddCall((prev) => !prev)}
        >
          Add Line
        </AddCallToggleButton>
        <NoMarginButtonsWrapper>
          <DeleteButton
            type="button"
            disabled={updating}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Saved Configuration
          </DeleteButton>
        </NoMarginButtonsWrapper>
      </ActionBar>

      {showDeleteConfirm && (
        <ConfirmationModal
          title="Delete Saved Configuration"
          description={`You are about to delete the saved configuration: ${preset.name}. Are you sure?`}
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
  const { presets, loading, deletePreset, updatePreset } = usePresetContext();

  const handleUpdate = useCallback(
    async (
      id: string,
      update: {
        name?: string;
        calls?: { productionId: string; lineId: string }[];
        companionUrl?: string | null;
      }
    ) => {
      await updatePreset(id, update);
    },
    [updatePreset]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deletePreset(id);
    },
    [deletePreset]
  );

  if (loading || presets.length === 0) return null;

  return (
    <>
      <SectionHeader>
        Saved Configurations
        <InfoTooltip>
          A <strong>saved configuration</strong> is a saved combination of lines
          you can join with one click. Deleting a line removes it from any saved
          configurations it belongs to.
        </InfoTooltip>
      </SectionHeader>
      <ListWrapper>
        {presets.map((preset) => (
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
