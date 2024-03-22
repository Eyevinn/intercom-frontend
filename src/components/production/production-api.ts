import { TProduction } from "./types";

export const fetchProduction = async (
  productionId: number
): Promise<TProduction> => {
  return Promise.resolve({
    name: `sample production`,
    id: productionId,
    lines: [
      {
        name: "editorial",
        id: 1,
        connected: true,
        connectionId: "123",
        participants: [
          {
            name: "Smeagol",
            active: true,
          },
          {
            name: "Deagol",
            active: true,
          },
        ],
      },
      {
        name: "other",
        id: 2,
        connected: true,
        connectionId: "1234",
        participants: [
          {
            name: "Frodo B.",
            active: true,
          },
          {
            name: "Samwise G.",
            active: true,
          },
        ],
      },
    ],
  });
};
