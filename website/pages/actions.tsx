import styled from "styled-components";
import Head from "next/head";
import PageContainer from "../src/component/layout/PageContainer";

import CallToActionButton from "../src/component/shared/CallToActionButton";
import { useMutation } from "urql";

const ActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
`;

const ActionsContent = styled.div`
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

const Actions = () => {
  const [joinResult, join] = useMutation(JoinMutation);
  const [leaveResult, leave] = useMutation(LeaveMutation);

  return (
    <>
      <Head>
        <title>Actions</title>
      </Head>

      <PageContainer>
        <ActionsContainer>
          <ActionsContent>
            <CallToActionButton onClick={() => join()}>
              Join Channel
            </CallToActionButton>
            <CallToActionButton onClick={() => leave()}>
              Leave Channel
            </CallToActionButton>
          </ActionsContent>
        </ActionsContainer>
      </PageContainer>
    </>
  );
};

export default Actions;
