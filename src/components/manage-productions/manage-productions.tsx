import { ErrorMessage } from "@hookform/error-message";
import { SubmitHandler, useForm } from "react-hook-form";
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
import { Spinner } from "../loader/loader";
import { API } from "../../api/api";
import { useGlobalState } from "../../global-state/context-provider";
import { useFetchProduction } from "../landing-page/use-fetch-production";
import { darkText, errorColour } from "../../css-helpers/defaults";
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
  padding: 0 0 3rem 0;
  width: 4rem;
`;

export const ManageProductions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteDone, setDeleteDone] = useState<boolean>(false);
  const [verifyRemove, setVerifyRemove] = useState<boolean>(false);
  const [removeProductionId, setRemoveProductionId] = useState<null | number>(
    null
  );
  const [, dispatch] = useGlobalState();
  const {
    reset,
    formState,
    formState: { errors, isSubmitSuccessful },
    register,
    handleSubmit,
  } = useForm<FormValue>();

  const { onChange, onBlur, name, ref } = register("productionId", {
    required: "Production ID is required",
    min: 1,
  });

  const { error: productionFetchError, production } =
    useFetchProduction(removeProductionId);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({
        productionId: "",
      });
      setRemoveProductionId(null);
      setVerifyRemove(false);
    }
  }, [formState.isSubmitSuccessful, isSubmitSuccessful, reset]);

  const onSubmit: SubmitHandler<FormValue> = (value) => {
    if (loading) return;

    setLoading(true);
    API.deleteProduction(parseInt(value.productionId, 10))
      .then(() => {
        setDeleteDone(true);
        setLoading(false);
        setVerifyRemove(false);
      })
      .catch((error) => {
        dispatch({
          type: "ERROR",
          payload:
            error instanceof Error
              ? error
              : new Error("Failed to delete production"),
        });
        setLoading(false);
      });
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
            setDeleteDone(false);
            onChange(ev);

            const pid = parseInt(ev.target.value, 10);

            setRemoveProductionId(Number.isNaN(pid) ? null : pid);
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
              className={loading ? "submit" : ""}
              onClick={() => setVerifyRemove(true)}
            >
              Remove
              {loading && <Spinner className="create-production" />}
            </ActionButton>
          )}
          {verifyRemove && (
            <VerifyBtnWrapper>
              <p>Are you sure?</p>
              <VerifyButtons>
                <Button
                  type="submit"
                  className={loading ? "submit" : ""}
                  disabled={loading}
                  onClick={handleSubmit(onSubmit)}
                >
                  Yes
                  {loading && <Spinner className="create-production" />}
                </Button>
                <Button
                  type="submit"
                  className={loading ? "submit" : ""}
                  onClick={() => {
                    setRemoveProductionId(null);
                    setVerifyRemove(false);
                    reset({
                      productionId: "",
                    });
                  }}
                >
                  Go back
                  {loading && <Spinner className="create-production" />}
                </Button>
              </VerifyButtons>
            </VerifyBtnWrapper>
          )}
        </>
      ) : (
        <StyledWarningMessage>
          Please enter a production id
        </StyledWarningMessage>
      )}
      {deleteDone && (
        <RemoveConfirmation>
          The production {production?.name} has been removed
        </RemoveConfirmation>
      )}
    </Container>
  );
};
