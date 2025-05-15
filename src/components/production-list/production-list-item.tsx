import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { TBasicProductionResponse } from "../../api/api";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  UsersIcon,
} from "../../assets/icons/icon";
import { useGlobalState } from "../../global-state/context-provider";
import { AudioFeedModal } from "../audio-feed-modal/audio-feed-modal";
import {
  FormInput,
  FormLabel,
  SecondaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { useRemoveProductionLine } from "../manage-productions-page/use-remove-production-line";
import { TLine } from "../production-line/types";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import { ManageProductionButtons } from "./manage-production-buttons";
import {
  DeleteButton,
  HeaderIcon,
  HeaderTexts,
  HeaderWrapper,
  InnerDiv,
  Lineblock,
  ParticipantCount,
  ParticipantCountWrapper,
  ProductionItemWrapper,
  ProductionLines,
  ProductionName,
  SpinnerWrapper,
} from "./production-list-components";
import { LineBlock } from "./line-block";
import { useInitiateProductionCall } from "../../hooks/use-initiate-production-call";
import { useEditProductionName } from "../manage-productions-page/use-edit-production-name";
import { useEditLineName } from "../manage-productions-page/use-edit-line-name";
import { useSubmitOnEnter } from "../../hooks/use-submit-form-enter-press";

type ProductionsListItemProps = {
  production: TBasicProductionResponse;
  managementMode?: boolean;
};

type FormValues = {
  productionName: string;
  [key: `lineName-${string}`]: string;
};

export const ProductionsListItem = ({
  production,
  managementMode = false,
}: ProductionsListItemProps) => {
  const [{ userSettings }, dispatch] = useGlobalState();
  const [open, setOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalLineId, setModalLineId] = useState<string | null>(null);
  const [isProgramUser, setIsProgramUser] = useState<boolean>(false);
  const [editNameOpen, setEditNameOpen] = useState<boolean>(false);
  const [savedProduction, setSavedProduction] =
    useState<TBasicProductionResponse | null>(null);
  const [editLineId, setEditLineId] = useState<{
    productionId: string;
    lineId: string;
    name: string;
  } | null>(null);
  const [editProductionId, setEditProductionId] = useState<{
    productionId: string;
    name: string;
  } | null>(null);

  const navigate = useNavigate();

  const [selectedLine, setSelectedLine] = useState<TLine | null>();
  const [lineRemoveId, setLineRemoveId] = useState<string>("");

  const { initiateProductionCall } = useInitiateProductionCall({
    dispatch,
  });

  const {
    loading: deleteLineLoading,
    successfullDelete: successfullDeleteLine,
    error: lineDeleteError,
  } = useRemoveProductionLine(production.productionId, lineRemoveId);

  const {
    loading: editProductionLoading,
    successfullEdit: successfullEditProduction,
    error: editProductionError,
  } = useEditProductionName(editProductionId);

  const {
    loading: editLineLoading,
    successfullEdit: successfullEditLine,
    error: editLineError,
  } = useEditLineName(editLineId);

  useEffect(() => {
    if (
      successfullDeleteLine ||
      successfullEditLine ||
      successfullEditProduction
    ) {
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
  }, [
    successfullDeleteLine,
    successfullEditLine,
    successfullEditProduction,
    dispatch,
  ]);

  useEffect(() => {
    if (successfullDeleteLine) {
      setLineRemoveId("");
      setSelectedLine(null);
    }
    if (successfullEditLine) {
      setEditLineId(null);
    }
    if (successfullEditProduction) {
      setEditProductionId(null);
    }
  }, [successfullDeleteLine, successfullEditLine, successfullEditProduction]);

  useEffect(() => {
    if (
      (successfullEditLine || successfullEditProduction) &&
      !editProductionLoading &&
      !editLineLoading &&
      !editProductionError &&
      !editLineError
    ) {
      setEditNameOpen(false);
      setSavedProduction(null);
    }
  }, [
    successfullEditLine,
    successfullEditProduction,
    editProductionLoading,
    editLineLoading,
    editProductionError,
    editLineError,
  ]);

  const totalParticipants = useMemo(() => {
    return (
      production.lines
        ?.map((line) => line.participants.length || 0)
        .reduce((partialSum, a) => partialSum + a, 0) || 0
    );
  }, [production]);

  const getLineByLineId = (lineId: string) => {
    return production.lines?.find((l) => l.id === lineId);
  };

  const goToProduction = async (lineId: string) => {
    if (userSettings?.username) {
      const payload = {
        productionId: production.productionId,
        lineId,
        username: userSettings.username,
        audioinput: userSettings?.audioinput,
        lineUsedForProgramOutput:
          getLineByLineId(lineId)?.programOutputLine || false,
        isProgramUser,
      };

      const callPayload = {
        joinProductionOptions: payload,
        audiooutput: userSettings?.audiooutput,
      };

      const success = await initiateProductionCall({ payload: callPayload });

      if (success) {
        navigate(
          `/production-calls/production/${payload.productionId}/line/${lineId}`
        );
      }
    }
  };

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resetOptions: {
      keepDirtyValues: true,
      keepErrors: true,
    },
  });

  const formValues = watch();
  const [productionName] = watch(["productionName"]);

  const hasLineChanges = () => {
    if (!savedProduction?.lines) return false;
    return savedProduction.lines.some(
      (line, index) =>
        formValues[`lineName-${index}`] &&
        formValues[`lineName-${index}`] !== line.name
    );
  };

  const isUpdated =
    productionName !== savedProduction?.name || hasLineChanges();

  useEffect(() => {
    if (savedProduction?.name) {
      setValue(`productionName`, savedProduction.name);
    }
    if (savedProduction?.lines) {
      savedProduction.lines.forEach((line, index) => {
        setValue(`lineName-${index}`, line.name);
      });
    }
  }, [savedProduction, setValue]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (
      savedProduction?.name !== data.productionName &&
      data.productionName !== ""
    ) {
      setEditProductionId({
        productionId: savedProduction?.productionId || production.productionId,
        name: data.productionName,
      });
    }
    savedProduction?.lines.forEach((line, index) => {
      if (
        line.name !== data[`lineName-${index}`] &&
        data[`lineName-${index}`] !== ""
      ) {
        setEditLineId({
          productionId:
            savedProduction?.productionId || production.productionId,
          lineId: line.id,
          name: data[`lineName-${index}`],
        });
      }
    });
    setEditNameOpen(false);
  };

  useSubmitOnEnter<FormValues>({
    handleSubmit,
    submitHandler: onSubmit,
    shouldSubmitOnEnter: isUpdated,
  });

  return (
    <ProductionItemWrapper>
      <HeaderWrapper
        onClick={() => {
          if (!editNameOpen) {
            setOpen(!open);
          }
        }}
      >
        <HeaderTexts
          open={open}
          isProgramOutputLine={false}
          className={totalParticipants > 0 ? "active" : ""}
        >
          {!editNameOpen && (
            <ProductionName title={production.name}>
              {production.name.length > 40
                ? `${production.name.slice(0, 40)}...`
                : production.name}
            </ProductionName>
          )}
          {editNameOpen && (
            <FormLabel>
              <FormInput
                // eslint-disable-next-line
                {...register(`productionName`)}
                placeholder="New production name"
                className="with-loader edit-name"
                autoComplete="off"
              />
            </FormLabel>
          )}
          <ParticipantCountWrapper>
            <UsersIcon />
            <ParticipantCount>{totalParticipants}</ParticipantCount>
          </ParticipantCountWrapper>
        </HeaderTexts>
        <HeaderIcon>
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </HeaderIcon>
      </HeaderWrapper>
      <ProductionLines className={open ? "expanded" : ""}>
        <InnerDiv>
          {production.lines?.map((l, index) => (
            <Lineblock
              key={`line-${l.id}-${l.name}`}
              isProgramOutput={l.programOutputLine}
              className={editNameOpen ? "edit-name-open" : ""}
            >
              {!editNameOpen && (
                <>
                  <LineBlock
                    managementMode={managementMode}
                    line={l}
                    production={production}
                  />
                  {managementMode ? (
                    <DeleteButton
                      type="button"
                      disabled={!!l.participants.length}
                      onClick={() => setSelectedLine(l)}
                    >
                      Delete
                      {deleteLineLoading && (
                        <SpinnerWrapper>
                          <Spinner className="production-list" />
                        </SpinnerWrapper>
                      )}
                    </DeleteButton>
                  ) : (
                    <SecondaryButton
                      type="button"
                      onClick={() => {
                        if (l.programOutputLine) {
                          setModalLineId(l.id);
                          setIsModalOpen(true);
                        } else {
                          goToProduction(l.id);
                        }
                      }}
                    >
                      Join
                    </SecondaryButton>
                  )}
                  {isModalOpen && modalLineId && (
                    <AudioFeedModal
                      onClose={() => setIsModalOpen(false)}
                      onJoin={() => {
                        setIsModalOpen(false);
                        goToProduction(modalLineId);
                      }}
                      setIsProgramUser={setIsProgramUser}
                      isProgramUser={isProgramUser}
                    />
                  )}
                </>
              )}
              {editNameOpen && (
                <FormLabel>
                  <FormInput
                    // eslint-disable-next-line
                    {...register(`lineName-${index.toString()}`)}
                    placeholder="New line name"
                    className="with-loader edit-name"
                    autoComplete="off"
                  />
                </FormLabel>
              )}
            </Lineblock>
          ))}
          {lineDeleteError && (
            <StyledWarningMessage className="error-message production-list">
              {lineDeleteError.message}
            </StyledWarningMessage>
          )}
          {managementMode && (
            <ManageProductionButtons
              production={production}
              isDeleteProductionDisabled={totalParticipants > 0}
              editNameOpen={editNameOpen}
              isUpdated={isUpdated}
              isLoading={editProductionLoading || editLineLoading}
              setEditNameOpen={() => {
                if (!editNameOpen) {
                  setSavedProduction(production);
                } else {
                  setSavedProduction(null);
                }
                setEditNameOpen(!editNameOpen);
              }}
              onEditNameSubmit={handleSubmit(onSubmit)}
            />
          )}
        </InnerDiv>
      </ProductionLines>
      {selectedLine && (
        <ConfirmationModal
          title="Delete Line"
          description={`You are about to delete the line: ${selectedLine.name}. Are you sure?`}
          onCancel={() => setSelectedLine(null)}
          onConfirm={() => setLineRemoveId(selectedLine.id)}
        />
      )}
    </ProductionItemWrapper>
  );
};
