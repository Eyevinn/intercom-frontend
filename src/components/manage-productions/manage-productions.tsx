import { ErrorMessage } from "@hookform/error-message";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import {
  ActionButton,
  DecorativeLabel,
  FormInput,
  FormLabel,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { LoaderDots, Spinner } from "../loader/loader";
import { useFetchProduction } from "../landing-page/use-fetch-production";
import { darkText, errorColour } from "../../css-helpers/defaults";
import { useDeleteProduction } from "./use-delete-production";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button";

type FormValue = {
  productionId: string;
};

const Container = styled.form`
  max-width: 45rem;
  padding: 1rem 0 0 2rem;
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

const VerifyBtnWrapper = styled.div`
  padding: 1rem 0 0 2rem;
`;

const VerifyButtons = styled.div`
  display: flex;
  padding: 1rem 0 0 0;
`;

const Button = styled(ActionButton)`
  margin: 0 1rem 0 0;
`;
const StyledBackBtnIcon = styled.div`
  margin: 0 0 3rem 0;
`;

export const ManageProductions = () => {
  const [showDeleteDoneMessage, setShowDeleteDoneMessage] =
    useState<boolean>(false);
  const [verifyRemove, setVerifyRemove] = useState<boolean>(false);
  const [removeId, setRemoveId] = useState<null | number>(null);
  const {
    control,
    reset,
    formState,
    formState: { errors, isSubmitSuccessful },
    register,
    handleSubmit,
  } = useForm<FormValue>();

  const productionId = useWatch({ name: "productionId", control });

  const { onChange, onBlur, name, ref } = register("productionId", {
    required: "Production ID is required",
    min: 1,
  });

  const {
    error: productionFetchError,
    production,
    loading: fetchLoader,
  } = useFetchProduction(parseInt(productionId, 10));

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
    }
  }, [successfullDelete]);

  const onSubmit: SubmitHandler<FormValue> = (value) => {
    if (deleteLoader) return;

    setRemoveId(parseInt(value.productionId, 10));
  };
  // TODO return button

  return (
    <Container>
      <StyledBackBtnIcon>
        <NavigateToRootButton />
      </StyledBackBtnIcon>
      <DisplayContainerHeader>Remove Production</DisplayContainerHeader>
      <FormLabel>
        <DecorativeLabel>Production ID</DecorativeLabel>
        <FormInput
          onChange={(ev) => {
            setShowDeleteDoneMessage(false);
            onChange(ev);
          }}
          name={name}
          ref={ref}
          onBlur={onBlur}
          type="number"
          autoComplete="off"
          placeholder="Production ID"
        />
      </FormLabel>
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
      {production ? (
        <>
          <DecorativeLabel>Production name: {production.name}</DecorativeLabel>
          {!verifyRemove && (
            <ActionButton
              type="submit"
              className={deleteLoader ? "submit" : ""}
              onClick={() => setVerifyRemove(true)}
            >
              Remove
              {deleteLoader && <Spinner className="create-production" />}
            </ActionButton>
          )}
          {verifyRemove && (
            <VerifyBtnWrapper>
              <p>Are you sure?</p>
              <VerifyButtons>
                <Button
                  type="submit"
                  className={deleteLoader ? "submit" : ""}
                  disabled={deleteLoader}
                  onClick={handleSubmit(onSubmit)}
                >
                  Yes
                  {deleteLoader && <Spinner className="create-production" />}
                </Button>
                <Button
                  type="submit"
                  className={deleteLoader ? "submit" : ""}
                  onClick={() => {
                    setVerifyRemove(false);
                    reset({
                      productionId: "",
                    });
                  }}
                >
                  Go back
                  {deleteLoader && <Spinner className="create-production" />}
                </Button>
              </VerifyButtons>
            </VerifyBtnWrapper>
          )}
        </>
      ) : (
        <StyledWarningMessage>
          Please enter a production id
          {fetchLoader && <LoaderDots className="in-active" text="" />}
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
