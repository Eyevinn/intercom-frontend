import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { TBasicProductionResponse } from "../../api/api";
import { useGlobalState } from "../../global-state/context-provider";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PersonIcon,
  RemoveIcon,
  UsersIcon,
} from "../../assets/icons/icon";
import {
  FormInput,
  FormLabel,
  SecondaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { useAddProductionLine } from "../manage-productions/use-add-production-line";
import { ListItemWrapper } from "../create-production/create-production";
import { Spinner } from "../loader/loader";
import { useRemoveProductionLine } from "../manage-productions/use-remove-production-line";
import { useDeleteProduction } from "../manage-productions/use-delete-production";
import {
  AddLineHeader,
  AddLineSectionForm,
  CreateLineButton,
  DeleteButton,
  HeaderIcon,
  HeaderTexts,
  HeaderWrapper,
  InnerDiv,
  Lineblock,
  LineBlockParticipant,
  LineBlockParticipants,
  LineBlockTexts,
  LineBlockTitle,
  ManageButtons,
  ParticipantCount,
  PersonText,
  ProductionItemWrapper,
  ProductionLines,
  ProductionName,
  RemoveIconWrapper,
  SpinnerWrapper,
} from "./production-list-components";

type ProductionsListItemProps = {
  production: TBasicProductionResponse;
  managementMode?: boolean;
};

export const ProductionsListItem = ({
  production,
  managementMode = false,
}: ProductionsListItemProps) => {
  const [{ userSettings }, dispatch] = useGlobalState();
  const navigate = useNavigate();

  const [open, setOpen] = useState<boolean>(false);
  const [addLineOpen, setAddLineOpen] = useState<boolean>(false);
  const [lineRemoveId, setLineRemoveId] = useState<string>("");
  const [removeProductionId, setRemoveProductionId] = useState<string>("");
  const [lineName, setLineName] = useState<string>("");

  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
  } = useForm<{ lineName: string }>({
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const {
    loading: createLineLoading,
    successfullCreate: successfullCreateLine,
    error: lineCreateError,
  } = useAddProductionLine(parseInt(production.productionId, 10), lineName);

  const {
    loading: deleteLineLoading,
    successfullDelete: successfullDeleteLine,
    error: lineDeleteError,
  } = useRemoveProductionLine(
    parseInt(production.productionId, 10),
    parseInt(lineRemoveId, 10)
  );

  const {
    loading: deleteProductionLoading,
    successfullDelete: successfullDeleteProduction,
    error: productionDeleteError,
  } = useDeleteProduction(parseInt(removeProductionId, 10));

  useEffect(() => {
    if (successfullDeleteLine || successfullDeleteProduction) {
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
    setLineRemoveId("");
    setRemoveProductionId("");
  }, [successfullDeleteLine, successfullDeleteProduction, dispatch]);

  useEffect(() => {
    if (successfullCreateLine) {
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
      setValue("lineName", "");
      setLineName("");
      setAddLineOpen(false);
    }
  }, [successfullCreateLine, setValue, dispatch]);

  const totalParticipants = useMemo(() => {
    return (
      production.lines
        ?.map((line) => line.participants.length || 0)
        .reduce((partialSum, a) => partialSum + a, 0) || 0
    );
  }, [production]);

  const goToProduction = (lineId: string) => {
    if (userSettings?.username) {
      const payload = {
        productionId: production.productionId,
        lineId,
        username: userSettings.username,
        audioinput: userSettings?.audioinput,
        audiooutput: userSettings?.audiooutput,
      };

      const uuid = globalThis.crypto.randomUUID();

      dispatch({
        type: "ADD_CALL",
        payload: {
          id: uuid,
          callState: {
            joinProductionOptions: payload,
            mediaStreamInput: null,
            dominantSpeaker: null,
            audioLevelAboveThreshold: false,
            connectionState: null,
            audioElements: null,
            sessionId: null,
            hotkeys: {
              muteHotkey: "m",
              speakerHotkey: "n",
              pushToTalkHotkey: "t",
              increaseVolumeHotkey: "u",
              decreaseVolumeHotkey: "d",
              globalMuteHotkey: "p",
            },
          },
        },
      });
      dispatch({
        type: "SELECT_PRODUCTION_ID",
        payload: payload.productionId,
      });
      navigate(
        `/production-calls/production/${payload.productionId}/line/${lineId}`
      );
    }
  };

  const onSubmit = (values: { lineName: string }) => {
    if (values.lineName) setLineName(values.lineName);
  };

  return (
    <ProductionItemWrapper>
      <HeaderWrapper onClick={() => setOpen(!open)}>
        <HeaderTexts className={totalParticipants > 0 ? "active" : ""}>
          <ProductionName>{production.name}</ProductionName>
          <UsersIcon />
          <ParticipantCount>{totalParticipants}</ParticipantCount>
        </HeaderTexts>
        <HeaderIcon>
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </HeaderIcon>
      </HeaderWrapper>
      <ProductionLines className={open ? "expanded" : ""}>
        <InnerDiv>
          {production.lines?.map((l) => (
            <Lineblock key={`line-${l.id}-${l.name}`}>
              <LineBlockTexts>
                <LineBlockTitle>{l.name}</LineBlockTitle>
                <LineBlockParticipants>
                  {l.participants.map((participant) => (
                    <LineBlockParticipant
                      key={`participant-${participant.sessionId}`}
                    >
                      <PersonIcon />
                      <PersonText>{participant.name}</PersonText>
                    </LineBlockParticipant>
                  ))}
                </LineBlockParticipants>
              </LineBlockTexts>
              {managementMode ? (
                <DeleteButton
                  type="button"
                  disabled={!!l.participants.length}
                  onClick={() => setLineRemoveId(l.id)}
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
                  onClick={() => goToProduction(l.id)}
                >
                  Join
                </SecondaryButton>
              )}
            </Lineblock>
          ))}
          {productionDeleteError && (
            <StyledWarningMessage className="error-message production-list">
              {productionDeleteError.message}
            </StyledWarningMessage>
          )}
          {lineDeleteError && (
            <StyledWarningMessage className="error-message production-list">
              {lineDeleteError.message}
            </StyledWarningMessage>
          )}
          {managementMode && (
            <>
              <ManageButtons>
                {!addLineOpen && (
                  <SecondaryButton
                    style={{ marginRight: "1rem" }}
                    type="button"
                    onClick={() => setAddLineOpen(!addLineOpen)}
                  >
                    Add Line
                  </SecondaryButton>
                )}
                <DeleteButton
                  type="button"
                  disabled={totalParticipants > 0}
                  onClick={() => setRemoveProductionId(production.productionId)}
                >
                  Remove Production
                  {deleteProductionLoading && (
                    <SpinnerWrapper>
                      <Spinner className="production-list" />
                    </SpinnerWrapper>
                  )}
                </DeleteButton>
              </ManageButtons>
              {addLineOpen && (
                <AddLineSectionForm>
                  <FormLabel>
                    <AddLineHeader>
                      <span>Line Name</span>
                      <RemoveIconWrapper onClick={() => setAddLineOpen(false)}>
                        <RemoveIcon />
                      </RemoveIconWrapper>
                    </AddLineHeader>
                    <ListItemWrapper>
                      <FormInput
                        // eslint-disable-next-line
                        {...register(`lineName`, {
                          required: "Line name is required",
                          minLength: 1,
                        })}
                      />
                    </ListItemWrapper>
                  </FormLabel>
                  <ErrorMessage
                    errors={errors}
                    name="lineName"
                    as={StyledWarningMessage}
                  />
                  {lineCreateError && (
                    <StyledWarningMessage className="error-message">
                      {lineCreateError.message}
                    </StyledWarningMessage>
                  )}
                  <CreateLineButton onClick={handleSubmit(onSubmit)}>
                    Create
                    {createLineLoading && (
                      <SpinnerWrapper>
                        <Spinner className="production-list" />
                      </SpinnerWrapper>
                    )}
                  </CreateLineButton>
                </AddLineSectionForm>
              )}
            </>
          )}
        </InnerDiv>
      </ProductionLines>
    </ProductionItemWrapper>
  );
};
