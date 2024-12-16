import styled from "@emotion/styled";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { DisplayContainer } from "../generic-components";
import { DisplayContainerHeader } from "./display-container-header";
import { LoaderDots } from "../loader/loader";
import { isMobile } from "../../bowser";
import { AddIcon, EditIcon } from "../../assets/icons/icon";

const HeaderContainer = styled(DisplayContainer)`
  padding: 2rem;
  padding-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
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

const HeaderButton = styled.div`
  width: 10rem;
  border: 1px solid white;
  border-radius: 1rem;
  margin-left: 1rem;
  padding: 1rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: pointer;
  }
`;

const HeaderButtonText = styled.p`
  display: inline-block;
  margin-right: 0.5rem;
  font-weight: bold;
`;

interface ProductionsListHeaderProps {
  loading?: boolean;
  hasProductions?: boolean;
}

export const ProductionsListHeader: FC<ProductionsListHeaderProps> = (
  props
) => {
  const { loading = false, hasProductions = false } = props;

  const navigate = useNavigate();

  const goToCreate = () => {
    navigate("/create-production");
  };

  const goToManage = () => {
    navigate("/manage-productions");
  };

  return (
    <HeaderContainer>
      <HeaderLeftSide>
        <CustomContainerHeader>Productions</CustomContainerHeader>
        <LoaderWrapper>
          <LoaderDots className={loading ? "active" : "in-active"} />
        </LoaderWrapper>
      </HeaderLeftSide>
      {!isMobile && (
        <div>
          {hasProductions && (
            <HeaderButton onClick={goToManage}>
              <HeaderButtonText>Edit</HeaderButtonText>
              <EditIcon />
            </HeaderButton>
          )}
          <HeaderButton onClick={goToCreate}>
            <HeaderButtonText>Create</HeaderButtonText>
            <AddIcon />
          </HeaderButton>
        </div>
      )}
    </HeaderContainer>
  );
};
