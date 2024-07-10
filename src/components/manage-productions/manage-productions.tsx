import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import {
  DecorativeLabel,
  PrimaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { useFetchProduction } from "../landing-page/use-fetch-production";
import { darkText, errorColour } from "../../css-helpers/defaults";
import { useDeleteProduction } from "./use-delete-production";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button";
import { FormInputWithLoader } from "../landing-page/form-input-with-loader";
import { RemoveProduction } from "./remove-production";
import { ManageLines } from "./manage-lines";
import { TProduction } from "../production-line/types";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import { isMobile } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { useRefreshAnimation } from "../landing-page/use-refresh-animation";
import { PaginatedList } from "./paginated-list";

type FormValue = {
  productionId: string;
};

type MobileLayout = {
  isMobile: boolean;
};

const ShowListBtn = styled(PrimaryButton)`
  margin-bottom: 2rem;
`;

const FormInputWrapper = styled.div`
  max-width: 45rem;
  padding-bottom: 1rem;
`;

const SubContainers = styled.div<MobileLayout>`
  width: 100%;
  display: flex;
  margin-bottom: 2rem;

  ${() => (isMobile ? `flex-direction: column;` : `flex-direction: row;`)}
`;

const Container = styled.form`
  padding: 1rem 2rem 0 2rem;
`;

const BottomMessagesWrapper = styled.div`
  max-width: 45rem;
  padding-bottom: 2rem;
`;

const RemoveConfirmation = styled.div`
  background: #91fa8c;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #b2ffa1;
  color: #1a1a1a;
`;

const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  padding: 0.5rem;
  margin: 1rem 0;
`;

const StyledBackBtnIcon = styled.div`
  margin: 0 0 3rem 0;
`;

export const ManageProductions = () => {
  const [showDeleteDoneMessage, setShowDeleteDoneMessage] =
    useState<boolean>(false);
  const [verifyRemove, setVerifyRemove] = useState<boolean>(false);
  const [showProductionsList, setShowProductionsList] =
    useState<boolean>(false);
  const [delayOnGuideText, setDelayOnGuideText] = useState<boolean>(false);
  const [removeId, setRemoveId] = useState<null | number>(null);
  const [cachedProduction, setCachedProduction] = useState<null | TProduction>(
    null
  );
  const [productionIdToFetch, setProductionIdToFetch] = useState<null | number>(
    null
  );

  // Pagination
  const [offset, setOffset] = useState("0");
  const limit = "10";

  const [, dispatch] = useGlobalState();

  const {
    reset,
    formState,
    formState: { errors, isSubmitSuccessful },
    register,
    getValues,
    trigger,
  } = useForm<FormValue>();

  const { onChange, onBlur, name, ref } = register("productionId", {
    required: "Production ID is required",
    min: 1,
  });

  const { productions, doInitialLoad, error } = useFetchProductionList({
    limit,
    offset,
  });

  const showRefreshing = useRefreshAnimation({
    doInitialLoad,
  });

  const {
    error: productionFetchError,
    production,
    loading: fetchLoader,
  } = useFetchProduction(productionIdToFetch);

  const {
    loading: deleteLoader,
    error: productionDeleteError,
    successfullDelete,
  } = useDeleteProduction(removeId);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({
        productionId: "",
      });
      setVerifyRemove(false);
    }
  }, [formState.isSubmitSuccessful, isSubmitSuccessful, reset]);

  useEffect(() => {
    if (successfullDelete) {
      setVerifyRemove(false);
      setShowDeleteDoneMessage(true);
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
  }, [dispatch, successfullDelete]);

  useEffect(() => {
    if (production) {
      setCachedProduction(production);
      setProductionIdToFetch(null);
      setShowProductionsList(false);
    }
  }, [production]);

  // added a delay to "enter production id"-text to stop it flashing by
  // when updating the fetch
  useEffect(() => {
    let timeout: number | null = null;

    if (!cachedProduction) {
      timeout = window.setTimeout(() => {
        setDelayOnGuideText(true);
      }, 500);
    } else {
      setDelayOnGuideText(false);
    }

    return () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
    };
  }, [cachedProduction]);

  // Custom submit to stop keypress 'Enter' being active
  const handleCustomSubmit = async () => {
    if (deleteLoader) return;

    const isFormValid = await trigger();
    if (isFormValid) {
      const values = getValues();
      setRemoveId(parseInt(values.productionId, 10));
      setCachedProduction(null);
      reset({
        productionId: "",
      });
    }
  };

  // Prevent default form submission behavior
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Container onSubmit={handleFormSubmit}>
      <StyledBackBtnIcon>
        <NavigateToRootButton />
      </StyledBackBtnIcon>
      <DisplayContainerHeader>Manage Productions</DisplayContainerHeader>
      <FormInputWrapper>
        <FormInputWithLoader
          onChange={(ev) => {
            onChange(ev);
            const pid = parseInt(ev.target.value, 10);
            const confirmedPid = Number.isNaN(pid) ? null : pid;

            setProductionIdToFetch(confirmedPid);
            setShowDeleteDoneMessage(false);
          }}
          label="Production ID"
          placeholder="Production ID"
          name={name}
          inputRef={ref}
          onBlur={onBlur}
          type="number"
          loading={fetchLoader}
        />
        {delayOnGuideText && (
          <StyledWarningMessage>
            Please enter a production id
          </StyledWarningMessage>
        )}
        {productionFetchError && (
          <FetchErrorMessage>
            The production ID could not be fetched. {productionFetchError.name}{" "}
            {productionFetchError.message}.
          </FetchErrorMessage>
        )}
      </FormInputWrapper>
      <ErrorMessage
        errors={errors}
        name="productionId"
        as={StyledWarningMessage}
      />
      {cachedProduction && (
        <ShowListBtn
          type="button"
          onClick={() => {
            setShowProductionsList(!showProductionsList);
          }}
        >
          {showProductionsList ? "Hide" : "Show"} Productions List
        </ShowListBtn>
      )}
      {(!cachedProduction || showProductionsList) && (
        <PaginatedList
          setProductionPage={(input) => setOffset(input)}
          showRefreshing={showRefreshing}
          productions={productions}
          error={error}
          manageProduction={(v: string) => {
            setProductionIdToFetch(parseInt(v, 10));
            reset({
              productionId: `${v}`,
            });
            setShowProductionsList(false);
            setShowDeleteDoneMessage(false);
          }}
        />
      )}
      {cachedProduction && (
        <>
          <DecorativeLabel>
            <strong>Production name: {cachedProduction.name}</strong>
          </DecorativeLabel>
          <SubContainers isMobile={isMobile}>
            <ManageLines
              production={cachedProduction}
              setProductionIdToFetch={setProductionIdToFetch}
            />
            <RemoveProduction
              deleteLoader={deleteLoader}
              handleSubmit={() => handleCustomSubmit()}
              verifyRemove={verifyRemove}
              setVerifyRemove={(input) => setVerifyRemove(input)}
              reset={() => {
                setVerifyRemove(false);
                setRemoveId(null);
                setCachedProduction(null);
                reset({
                  productionId: "",
                });
              }}
            />
          </SubContainers>
        </>
      )}
      <BottomMessagesWrapper>
        {productionDeleteError && (
          <FetchErrorMessage>
            The production ID could not be deleted. {productionDeleteError.name}{" "}
            {productionDeleteError.message}.
          </FetchErrorMessage>
        )}
        {showDeleteDoneMessage && (
          <RemoveConfirmation>
            The production {production?.name} has been removed
          </RemoveConfirmation>
        )}
      </BottomMessagesWrapper>
    </Container>
  );
};
