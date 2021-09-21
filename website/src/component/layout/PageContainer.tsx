import styled from "styled-components";

import NavBar from "./NavBar";

const StyledPageContainer = styled.div`
  display: flex;

  height: 100vh;
  width: 100%;
  background-color: lightskyblue;
`;

const PageContent = styled.div`
  display: flex;
  width: 100%;
  margin-left: 250px;
`;

const PageContainer = ({ children }: any) => {
  return (
    <StyledPageContainer>
      <NavBar />
      <PageContent>{children}</PageContent>
    </StyledPageContainer>
  );
};

export default PageContainer;
