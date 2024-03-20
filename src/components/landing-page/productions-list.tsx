import styled from "@emotion/styled";

const ProductionListContainer = styled.div`
  display: flex;
  padding: 2rem 0 2rem 2rem;
  flex-wrap: wrap;
`;

const ProductionItem = styled.div`
  flex: 1 0 calc(25% - 2rem);
  min-width: 20rem;
  border: 1px solid #424242;
  border-radius: 0.5rem;
  padding: 2rem;
  margin: 0 2rem 2rem 0;
`;

const ProductionName = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0 0 1rem;
  word-break: break-word;
`;

const ProductionId = styled.div`
  font-size: 2rem;
  color: #9e9e9e;
`;

export const ProductionsList = () => {
  return (
    <ProductionListContainer>
      <ProductionItem>
        <ProductionName>Mello</ProductionName>
        <ProductionId>123</ProductionId>
      </ProductionItem>
      <ProductionItem>
        <ProductionName>Bolibompa</ProductionName>
        <ProductionId>4</ProductionId>
      </ProductionItem>
      <ProductionItem>
        <ProductionName>Nyheterna</ProductionName>
        <ProductionId>928</ProductionId>
      </ProductionItem>
      <ProductionItem>
        <ProductionName>Sikta mot Stjärnorna</ProductionName>
        <ProductionId>38974</ProductionId>
      </ProductionItem>
      <ProductionItem>
        <ProductionName>Idol</ProductionName>
        <ProductionId>5</ProductionId>
      </ProductionItem>
      <ProductionItem>
        <ProductionName>
          IdolIdol Idol Idol Idol Idol Idol Idol Idol Idol Idol Idol Idol Idol
          Idol Idol Idol Idol Idol Idol Idol Idol Idol Idol
        </ProductionName>
        <ProductionId>5</ProductionId>
      </ProductionItem>
      <ProductionItem>
        <ProductionName>
          IdolIdolIdolIdolIdolIdolIdolIdolIdolIdolIdolIdolIdolIdol
          IdolIdolIdolIdolIdolIdolIdolIdolIdolIdol
        </ProductionName>
        <ProductionId>5</ProductionId>
      </ProductionItem>
    </ProductionListContainer>
  );
};
