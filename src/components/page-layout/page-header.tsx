import styled from "@emotion/styled";
import { FC, PropsWithChildren } from "react";
import { DisplayContainer } from "../generic-components";
import { LoaderDots } from "../loader/loader";
import { NavigateToRootButton } from "../navigate-to-root-button/navigate-to-root-button";
import { DisplayContainerHeader } from "../landing-page/display-container-header";

const HeaderContainer = styled(DisplayContainer)`
  padding: 2rem;
  padding-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  height: 7.5rem;
  justify-content: space-between;
  svg {
    height: 2.5rem;
    width: 2.5rem;
  }
`;

const HeaderLeftSide = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRightSide = styled.div``;

const CustomContainerHeader = styled(DisplayContainerHeader)`
  margin: 0;
  display: inline-flex;
`;

const LoaderWrapper = styled.div`
  width: 1rem;
  height: 3rem;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-right: 1rem;
`;

const RootButtonWrapper = styled.div`
  div {
    height: unset;
    width: unset;
    margin-right: 1rem;
    &:hover {
      cursor: pointer;
    }
  }
`;

interface PageHeaderProps extends PropsWithChildren {
  title: string;
  hasNavigateToRoot?: boolean;
  onNavigateToRoot?: () => void;
  loading?: boolean;
}

export const PageHeader: FC<PageHeaderProps> = (props) => {
  const {
    title,
    hasNavigateToRoot = false,
    onNavigateToRoot,
    loading = false,
    children,
  } = props;

  return (
    <HeaderContainer>
      <HeaderLeftSide>
        {hasNavigateToRoot && (
          <RootButtonWrapper>
            <NavigateToRootButton onNavigate={onNavigateToRoot} />
          </RootButtonWrapper>
        )}
        <CustomContainerHeader>{title}</CustomContainerHeader>
        <LoaderWrapper>
          <LoaderDots className={loading ? "active" : "in-active"} />
        </LoaderWrapper>
      </HeaderLeftSide>
      <HeaderRightSide>{children}</HeaderRightSide>
    </HeaderContainer>
  );
};
