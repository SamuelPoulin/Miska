import Head from "next/head";
import Image from "next/image";
import styled from "styled-components";
import CallToActionLink from "../src/component/shared/CallToActionLink";

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;

  width: 100%;
  height: 100vh;
`;

const LandingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LandingTitle = styled.div`
  display: flex;

  margin-bottom: 50px;

  font-family: "Pacifico";
  font-size: 48px;
`;

const Landing = () => {
  return (
    <>
      <Head>
        <title>Miska</title>
      </Head>

      <LandingContainer>
        <LandingContent>
          <Image
            src="/images/miska.png"
            width="150"
            height="150"
            layout="fixed"
            alt="Miska"
          />
          <LandingTitle>Welcome to Miska</LandingTitle>
          <CallToActionLink href="/home">Continue</CallToActionLink>
        </LandingContent>
      </LandingContainer>
    </>
  );
};

export default Landing;
