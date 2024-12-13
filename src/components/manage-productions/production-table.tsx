import styled from "@emotion/styled";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "../../assets/icons/icon";
import { TBasicProductionResponse } from "../../api/api";
import { LocalError } from "../error";
import { isMobile } from "../../bowser";
import { TProduction } from "../production-line/types";

const TableContainer = styled.div`
  margin-bottom: 1rem;
  margin-top: 2rem;
  border-radius: 0.5rem;
  overflow: hidden;
  width: ${isMobile ? "100%" : "65rem"};
  position: relative;
  min-width: 30rem;
  margin-left: ${isMobile ? "0" : "2rem"};
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #32383b;
  color: #d6d3d1;
  padding: 1rem;
  font-size: 2rem;
  font-weight: 700;
  cursor: pointer;
  border: 0.1rem solid #6d6d6d;
  border-bottom: ${({ isOpen }: { isOpen: boolean }) =>
    isOpen ? "none" : "0.1rem solid #6d6d6d;"};
  border-radius: 0.5rem;
  border-bottom-left-radius: ${({ isOpen }: { isOpen: boolean }) =>
    isOpen ? "0" : "0.5rem"};
  border-bottom-right-radius: ${({ isOpen }: { isOpen: boolean }) =>
    isOpen ? "0" : "0.5rem"};
`;

const TableIcon = styled.span`
  font-size: 1.4rem;
  transform: ${({ isOpen }: { isOpen: boolean }) => (isOpen ? "50rem" : "0")};
`;

const IconWrapper = styled.div`
  width: 2.4rem;
`;

const TableBody = styled.div<{ isOpen: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? "50rem" : "0")};
  overflow: auto;
  opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
  border: ${({ isOpen }) => (isOpen ? "0.1rem solid #6d6d6d" : "none")};
  border-radius: 0.5rem;
  border-bottom: none;
  border-top: none;
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  cursor: pointer;

  ${({ isSelectedProduction }: { isSelectedProduction?: boolean }) =>
    isSelectedProduction
      ? `background-color: #4B555A`
      : `background-color: #32383b;`}
`;

const TableCell = styled.td`
  padding: 1.8rem;
  border: 0.1rem solid #6d6d6d;
  border-left: none;
  border-right: none;
  text-align: left;
  cursor: pointer;
`;

const TruncatedTableCell = styled.td`
  padding: 1.8rem;
  border: 0.1rem solid #6d6d6d;
  border-left: none;
  border-right: none;
  text-align: left;
  cursor: pointer;
  position: relative;

  ${({ isOverflowing }: { isOverflowing: boolean }) => `
    white-space: ${isMobile || !isOverflowing ? "normal" : "nowrap"};
    overflow: ${isMobile || !isOverflowing ? "visible" : "hidden"};
    word-wrap: ${isMobile || !isOverflowing ? "break-word" : "normal"};
    text-overflow: ${isOverflowing && !isMobile ? "ellipsis" : "initial"};
    max-width: ${isOverflowing && !isMobile ? "20rem" : "none"};
    position: relative;
  `}
`;

const TableHeaderCell = styled.th`
  padding: 0.8rem;
  margin-bottom: 2rem;
  background-color: #32383b;
  color: #d6d3d1;
  text-align: left;
  font-weight: 700;
  cursor: pointer;
  border-top: none;
`;

type TProductionTableProps = {
  productions?: TBasicProductionResponse[];
  setProductionId: (v: string) => void;
  error: Error | null;
  isSelectedProduction: TProduction | null;
  onScroll: (event: React.UIEvent<HTMLTableSectionElement>) => void;
};

export const ProductionTable = ({
  productions,
  setProductionId,
  error,
  isSelectedProduction,
  onScroll,
}: TProductionTableProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {error && <LocalError error={error} />}
      {!error && productions && (
        <TableContainer>
          <TableHeader isOpen={isOpen} onClick={toggleOpen}>
            <span>Production List</span>
            <TableIcon isOpen={isOpen}>
              <IconWrapper>
                {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </IconWrapper>
            </TableIcon>
          </TableHeader>
          <TableBody isOpen={isOpen} onScroll={onScroll}>
            <Table>
              <thead>
                <TableRow isSelectedProduction={false}>
                  <TableHeaderCell>Production Name</TableHeaderCell>
                  <TableHeaderCell>ID</TableHeaderCell>
                </TableRow>
              </thead>
              <tbody>
                {productions?.map((p) => (
                  <TableRow
                    key={p.productionId}
                    isSelectedProduction={
                      isSelectedProduction?.productionId === p.productionId
                    }
                    onClick={() => {
                      setProductionId(p.productionId);
                    }}
                  >
                    <TruncatedTableCell isOverflowing={p.name.length > 50}>
                      {p.name.length > 50 && !isMobile
                        ? `${p.name.slice(0, 47)}...`
                        : p.name}
                    </TruncatedTableCell>
                    <TableCell>{p.productionId}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableBody>
        </TableContainer>
      )}
    </>
  );
};
