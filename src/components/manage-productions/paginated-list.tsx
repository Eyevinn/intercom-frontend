import styled from "@emotion/styled";
import { useEffect, useState } from "react";
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
  cursor: pointer;
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
  const [pagesArray, setPagesArray] = useState<number[]>();
  const totalPages = productions
    ? Math.ceil(productions.totalItems / productions.limit)
    : 0;

  useEffect(() => {
    const result: number[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= totalPages; i++) {
      result.push(i);
    }
    return setPagesArray(result);
  }, [totalPages]);

  if (!productions) return null;

  const pageIndex = productions.offset / productions.limit;
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
              setProductionId={(v: string) => manageProduction(v)}
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
              {pagesArray &&
                pagesArray.map((item: number, index) => (
                  <PageStep
                    key={item}
                    type="button"
                    onClick={() => handleClick(item)}
                    disabled={currentPage === item}
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
