import Head from "next/head";
import styled from "styled-components";
import { useMutation } from "urql";

import PageContainer from "../src/component/layout/PageContainer";
import CallToActionButton from "../src/component/shared/CallToActionButton";

const HomeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
`;

const HomeContent = styled.div`
  display: flex;

  padding: 25px;

  background-color: white;
  border-radius: 5px;
`;

const JoinMutation = `
	mutation {
		joinChannel
	}
`;

const LeaveMutation = `
	mutation {
		leaveChannel
	}
`;

const Home = () => {
  const [joinResult, join] = useMutation(JoinMutation);
  const [leaveResult, leave] = useMutation(LeaveMutation);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <PageContainer>
        <HomeContainer>
          <HomeContent>
            <CallToActionButton onClick={() => join()}>
              Join Channel
            </CallToActionButton>
            <CallToActionButton onClick={() => leave()}>
              Leave Channel
            </CallToActionButton>
          </HomeContent>
        </HomeContainer>
      </PageContainer>
    </>
  );
};

export default Home;
