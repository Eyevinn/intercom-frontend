import styled from "@emotion/styled";
import { ProductionsList } from "../productions-list";
import { LoaderDots } from "../loader/loader";
import { TListProductionsResponse } from "../../api/api";
import { StepLeftIcon, StepRightIcon } from "../../assets/icons/icon";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoaderWrapper = styled.div`
  padding-bottom: 1rem;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 1rem 0;
`;

const PageStep = styled.button`
  border: 1px solid #424242;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 0 0 1rem 2rem;
  width: 4rem;
  height: 5rem;

  &.icon {
    height: 4rem;
  }
`;

const PageNumber = styled.div`
  font-size: 1.4rem;
`;

type TPaginatedList = {
  setProductionPage: (input: string) => void;
  showRefreshing: boolean;
  productions: TListProductionsResponse | undefined;
  error: Error | null;
  manageProduction: (v: string) => void;
};

export const PaginatedList = ({
  setProductionPage,
  showRefreshing,
  productions,
  error,
  manageProduction,
}: TPaginatedList) => {
  if (!productions) return undefined;

  const pageIndex = productions.offset / productions.limit;
  const totalPages = Math.ceil(productions.totalItems / productions.limit);
  const currentPage = pageIndex + 1;

  const handleClick = (pageNumber: number) => {
    setProductionPage(
      (pageNumber * productions.limit - productions.limit).toString()
    );
  };

  return (
    <Container>
      <LoaderWrapper>
        <LoaderDots
          className={showRefreshing ? "active" : "in-active"}
          text="loading"
        />
      </LoaderWrapper>
      {productions && (
        <>
          <ListWrapper>
            <ProductionsList
              productions={productions.productions}
              error={error}
              manageProduction={(v: string) => manageProduction(v)}
            />
          </ListWrapper>
          {totalPages > 1 && (
            <PaginationWrapper>
              <PageStep
                type="button"
                className="icon"
                onClick={() => handleClick(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <StepLeftIcon />
              </PageStep>
              {Array.from({ length: totalPages }, (_, index) => (
                <PageStep
                  key={index + 1}
                  type="button"
                  onClick={() => handleClick(index + 1)}
                  disabled={currentPage === index + 1}
                >
                  <PageNumber>{index + 1}</PageNumber>
                </PageStep>
              ))}
              <PageStep
                type="button"
                className="icon"
                onClick={() => handleClick(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <StepRightIcon />
              </PageStep>
            </PaginationWrapper>
          )}
        </>
      )}
    </Container>
  );
};
