import styled from "@emotion/styled";
import { FormContainer } from "./landing-page/form-elements";

export const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const DisplayContainer = styled.div`
  display: flex;
  padding: 2rem;
  max-width: 45rem;
`;

export const ResponsiveFormContainer = styled(FormContainer)`
  padding: 0 2rem;

  &.desktop {
    margin: auto;
    margin-top: 15rem;
    width: 50rem;
  }

  &.calls-page {
    margin: 0;
    padding: 2rem;
  }
`;

export const ButtonWrapper = styled.div`
  margin: 2rem 0 2rem 0;
  display: flex;
  justify-content: flex-end;
`;

export const ListItemWrapper = styled.div`
  position: relative;
`;
