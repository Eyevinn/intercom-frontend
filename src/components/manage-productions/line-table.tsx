import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { TLine } from "../production-line/types";
import { RemoveLineButton } from "../remove-line-button/remove-line-button";
import { ConfirmIcon } from "../../assets/icons/icon";
import { isMobile } from "../../bowser";

const TableContainer = styled.div`
  margin: 1rem 0;
  border: 0.1rem solid #6d6d6d;
  border-radius: 0.5rem;
  overflow-y: scroll;
  width: ${isMobile ? "100%" : "45rem"};
  max-height: 35rem;
  border-bottom: ${({ lines }: { lines: TLine[] | undefined }) =>
    lines && lines.length === 0 ? "0.1rem solid #6d6d6d" : "none"};
  background: #32383b;
  position: relative;
`;

const TableBody = styled.div`
  transition: max-height 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
`;

const TableRow = styled.tr`
  background-color: #32383b;
  cursor: pointer;

  ${isMobile ? `position: relative;` : ""}
`;

const TableCell = styled.td`
  padding: 1.5rem;
  border: 0.1rem solid #6d6d6d;
  border-left: none;
  border-right: none;
  text-align: left;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  horizontal-align: center;
  vertical-align: middle;
`;

const TableHeaderCell = styled.th`
  padding: 1.8rem;
  margin-bottom: 2rem;
  background-color: #32383b;
  color: #d6d3d1;
  text-align: left;
  font-weight: 700;
  font-size: 1.8rem;
`;

const TruncatedTableCell = styled.td`
  padding: 1.8rem;
  border: 0.1rem solid #6d6d6d;
  border-left: none;
  border-right: none;
  text-align: left;
  position: relative;
  cursor: pointer;

  ${({ isOverflowing }: { isOverflowing: boolean }) => `
    white-space: ${isMobile || !isOverflowing ? "normal" : "nowrap"};
    overflow: ${isMobile || !isOverflowing ? "visible" : "hidden"};
    word-wrap: ${isMobile || !isOverflowing ? "break-word" : "normal"};
    text-overflow: ${isOverflowing && !isMobile ? "ellipsis" : "initial"};
    max-width: ${isOverflowing && !isMobile ? "20rem" : "none"};
    position: relative;
  `}
`;

const ConfirmButton = styled.div`
  border-radius: 0.5rem;
  cursor: pointer;
  position: fixed;
  font-size: 1.8rem;
  padding: 1rem;
  z-index: 100;
  margin-left: ${isMobile ? "-1rem" : "1rem"};
  margin-top: ${isMobile ? "3.5rem" : "0"};
  display: flex;
  justify-content: center;
  align-items: center;
  background: #32383b;
  color: white;
  border: 0.1rem solid #6d6d6d;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 3rem;
    margin-left: 1rem;
    cursor: pointer;
    fill: #91fa8c;
  }

  ${isMobile ? `width: fit-content;` : ""}
`;

type TLineTableProps = {
  removeActive: boolean;
  lines?: TLine[];
  verifyRemove: null | string;
  removeLine: React.Dispatch<React.SetStateAction<string | null>>;
  setRemoveId: React.Dispatch<React.SetStateAction<number | null>>;
};

interface ConfirmButtonPosition {
  top: number;
  left: number;
}

export const LineTable = ({
  removeActive,
  lines,
  verifyRemove,
  removeLine,
  setRemoveId,
}: TLineTableProps) => {
  const confirmButtonRef = useRef<HTMLDivElement | null>(null);
  const [confirmButtonPosition, setConfirmButtonPosition] =
    useState<ConfirmButtonPosition | null>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  useEffect(() => {
    if (verifyRemove !== null) {
      const targetRow = rowRefs.current.get(parseInt(verifyRemove, 10));
      if (targetRow) {
        const rect = targetRow.getBoundingClientRect();
        setConfirmButtonPosition({
          top: isMobile ? rect.top : rect.top + 5,
          left: isMobile ? rect.left + 20 : rect.right + 10,
        });
      } else {
        setConfirmButtonPosition(null);
      }
    } else {
      setConfirmButtonPosition(null);
    }
  }, [verifyRemove]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!confirmButtonRef.current?.contains(event.target as Node)) {
        removeLine(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [removeLine]);

  return (
    <TableContainer lines={lines}>
      <TableBody>
        <Table>
          <thead>
            <TableRow>
              <TableHeaderCell>Line Name</TableHeaderCell>
              <TableHeaderCell>ID</TableHeaderCell>
              {removeActive && <TableHeaderCell>Action</TableHeaderCell>}
            </TableRow>
          </thead>
          <tbody>
            {lines?.map((l) => (
              <TableRow
                key={l.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(parseInt(l.id, 10), el);
                }}
              >
                <TruncatedTableCell isOverflowing={l.name.length > 50}>
                  {l.name.length > 50 && !isMobile
                    ? `${l.name.slice(0, 47)}...`
                    : l.name}
                </TruncatedTableCell>
                <TableCell>{l.id}</TableCell>
                {removeActive && (
                  <TableCell>
                    <RemoveLineButton
                      removeLine={() => {
                        if (!verifyRemove) {
                          removeLine(l.id);
                        } else {
                          removeLine(null);
                        }
                      }}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableBody>
      {confirmButtonPosition && verifyRemove && (
        <ConfirmButton
          ref={confirmButtonRef}
          style={{
            position: "fixed",
            top: `${confirmButtonPosition?.top}px`,
            left: `${confirmButtonPosition?.left}px`,
            zIndex: 200,
          }}
          onClick={(event) => {
            event.preventDefault();
            setRemoveId(parseInt(verifyRemove!, 10));
          }}
        >
          Remove {lines?.find((line) => line.id === verifyRemove)?.name}?
          <ConfirmIcon />
        </ConfirmButton>
      )}
    </TableContainer>
  );
};
