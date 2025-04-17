import styled from "@emotion/styled";
import { FormContainer } from "./landing-page/form-elements";
import { isMobile } from "../bowser";

// Screen size breakpoints based on width
export const breakpoints = {
  tiny: 480,
  small: 768,
  medium: 1024,
  large: 1440,
};

// Media query helper functions
export const mediaQueries = {
  isTinyScreen: `@media (max-width: ${breakpoints.tiny}px)`,
  isSmallScreen: `@media (max-width: ${breakpoints.small}px)`,
  isMediumScreen: `@media (max-width: ${breakpoints.medium}px)`,
  isLargeScreen: `@media (max-width: ${breakpoints.large}px)`,
};

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
    flex: 0 0 calc(25% - 2rem);
    ${isMobile ? `flex-grow: 1;` : `flex-grow: 0;`}
    min-width: 30rem;

    ${mediaQueries.isLargeScreen} {
      flex: 0 0 calc(33.333% - 2rem);
    }

    ${mediaQueries.isMediumScreen} {
      flex: 0 0 calc(50% - 2rem);
    }

    ${mediaQueries.isSmallScreen} {
      flex: 0 0 calc(100%);
    }
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
