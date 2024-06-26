import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import {
  DecorativeLabel,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { useFetchProduction } from "../landing-page/use-fetch-production";
import { darkText, errorColour } from "../../css-helpers/defaults";
import { useDeleteProduction } from "./use-delete-production";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button";
import { FormInputWithLoader } from "../landing-page/form-input-with-loader";
import { RemoveProduction } from "./remove-production";
import { ManageLines } from "./manage-lines";

type FormValue = {
  productionId: string;
};

const SubContainers = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const Container = styled.form`
  max-width: 45rem;
  padding: 1rem 2rem 0 2rem;
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
  const [delayOnGuideText, setDelayOnGuideText] = useState<boolean>(false);
  const [removeId, setRemoveId] = useState<null | number>(null);
  const [productionId, setProductionId] = useState<null | number>(null);
  const [productionIdToFetch, setProductionIdToFetch] = useState<null | number>(
    null
  );

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
      setProductionId(null);
      setProductionIdToFetch(null);
    }
  }, [successfullDelete]);

  useEffect(() => {
    if (!productionIdToFetch && productionId) {
      setProductionIdToFetch(productionId);
    }
  }, [productionId, productionIdToFetch]);

  // added a delay to "enter production id"-text to stop it flashing by
  // when updating the fetch
  useEffect(() => {
    let timeout: number | null = null;

    if (!productionIdToFetch && !productionId) {
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
  }, [productionId, productionIdToFetch]);

  // Custom submit to stop keypress 'Enter' being active
  const handleCustomSubmit = async () => {
    if (deleteLoader) return;

    const isFormValid = await trigger();
    if (isFormValid) {
      const values = getValues();
      setRemoveId(parseInt(values.productionId, 10));
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
      <FormInputWithLoader
        onChange={(ev) => {
          onChange(ev);
          const pid = parseInt(ev.target.value, 10);
          const confirmedPid = Number.isNaN(pid) ? null : pid;

          setProductionId(confirmedPid);
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
      {productionFetchError && (
        <FetchErrorMessage>
          The production ID could not be fetched. {productionFetchError.name}{" "}
          {productionFetchError.message}.
        </FetchErrorMessage>
      )}
      {productionDeleteError && (
        <FetchErrorMessage>
          The production ID could not be deleted. {productionDeleteError.name}{" "}
          {productionDeleteError.message}.
        </FetchErrorMessage>
      )}
      <ErrorMessage
        errors={errors}
        name="productionId"
        as={StyledWarningMessage}
      />
      {production && (
        <>
          <DecorativeLabel>
            <strong>Production name: {production.name}</strong>
          </DecorativeLabel>
          <SubContainers>
            <ManageLines
              production={production}
              updateProduction={() => setProductionIdToFetch(null)}
            />
            <RemoveProduction
              deleteLoader={deleteLoader}
              handleSubmit={() => handleCustomSubmit()}
              verifyRemove={verifyRemove}
              setVerifyRemove={(input) => setVerifyRemove(input)}
              reset={() => {
                setVerifyRemove(false);
                reset({
                  productionId: "",
                });
                setProductionId(null);
                setProductionIdToFetch(null);
                setRemoveId(null);
              }}
            />
          </SubContainers>
        </>
      )}
      {delayOnGuideText && (
        <StyledWarningMessage>
          Please enter a production id
        </StyledWarningMessage>
      )}
      {showDeleteDoneMessage && (
        <RemoveConfirmation>
          The production {production?.name} has been removed
        </RemoveConfirmation>
      )}
    </Container>
  );
};
