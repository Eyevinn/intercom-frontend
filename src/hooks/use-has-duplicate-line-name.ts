import { useMemo } from "react";

export const normalizeLineName = (name?: string) =>
  name?.trim().toLowerCase() || "";

const defaultGetLineName = <TLine extends { name?: string }>(line: TLine) =>
  line?.name;

type UseHasDuplicateLineNameProps<TLine extends { name?: string }> = {
  candidateName?: string;
  lines?: TLine[];
  getLineName?: (line: TLine) => string | undefined;
};

export const useHasDuplicateLineName = <
  TLine extends { name?: string } = { name?: string },
>({
  candidateName,
  lines,
  getLineName = defaultGetLineName,
}: UseHasDuplicateLineNameProps<TLine>) => {
  return useMemo(() => {
    const normalizedCandidate = normalizeLineName(candidateName);
    if (!normalizedCandidate || !lines?.length) return false;

    return lines.some(
      (line) => normalizeLineName(getLineName(line)) === normalizedCandidate
    );
  }, [candidateName, lines, getLineName]);
};
