import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";
import { JoinProduction } from "../landing-page/join-production";
import { ProductionLine } from "../production-line/production-line";
import { SecondaryButton } from "../landing-page/form-elements";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 2rem;
`;

const CallsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 2rem;
`;

const CallContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 40rem;
  min-width: 30rem;
`;

const AddCallContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4rem;
  max-width: 40rem;
  min-width: 30rem;
`;

const ButtonWrapper = styled.div`
  margin: 0 1rem 1rem 0;
  :last-of-type {
    margin: 0 0 4rem;
  }
`;

export const CallsPage = () => {
  const [productionId, setProductionId] = useState<string | null>(null);
  const [addCallActive, setAddCallActive] = useState(false);
  const [{ calls, selectedProductionId }, dispatch] = useGlobalState();
  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const navigate = useNavigate();

  const isEmpty = Object.values(calls).length === 0;
  const isSingleCall = Object.values(calls).length === 1;

  useEffect(() => {
    if (selectedProductionId) {
      setProductionId(selectedProductionId);
    }
  }, [selectedProductionId]);

  useEffect(() => {
    if (isEmpty && !paramProductionId && !paramLineId) {
      navigate("/");
    }
  }, [isEmpty, paramProductionId, paramLineId, navigate]);

  const runExitAllCalls = async () => {
    setProductionId(null);
    Object.entries(calls).forEach(([callId]) => {
      if (callId) {
        dispatch({
          type: "REMOVE_CALL",
          payload: { id: callId },
        });
      }
    });
  };

  return (
    <Container>
      <ButtonWrapper>
        <NavigateToRootButton resetOnExit={runExitAllCalls} />
      </ButtonWrapper>
      <CallsContainer>
        {Object.entries(calls).map(
          ([callId, callState]) =>
            callId &&
            callState.joinProductionOptions && (
              <CallContainer key={callId}>
                <ProductionLine
                  id={callId}
                  callState={callState}
                  isSingleCall={isSingleCall}
                />
              </CallContainer>
            )
        )}
        {!paramProductionId && !paramLineId && (
          <AddCallContainer>
            <ButtonWrapper>
              <SecondaryButton
                type="button"
                onClick={() => setAddCallActive(!addCallActive)}
              >
                Add Call
              </SecondaryButton>
            </ButtonWrapper>
            {addCallActive && productionId && (
              <JoinProduction addAdditionalCallId={productionId} />
            )}
          </AddCallContainer>
        )}
        {isEmpty && paramProductionId && paramLineId && (
          <CallContainer>
            <JoinProduction
              preSelected={{
                preSelectedProductionId: paramProductionId,
                preSelectedLineId: paramLineId,
              }}
            />
          </CallContainer>
        )}
      </CallsContainer>
    </Container>
  );
};
