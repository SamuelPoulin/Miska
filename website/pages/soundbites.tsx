import styled from "styled-components";
import Head from "next/head";
import PageContainer from "../src/component/layout/PageContainer";
import { useMutation, useQuery } from "urql";
import { ChangeEvent, useRef } from "react";

const SoundbitesSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
`;

const SoundbitesContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-top: 25px;
`;

const SoundbitesContent = styled.div`
  display: flex;
  flex-direction: column;

  margin: 25px 0px;
  width: 100%;

  background-color: #ffffff;
  border-radius: 5px;
`;

const SoundbitesTitleContainer = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
`;

const SoundbitesTitle = styled.div`
  margin-right: 10px;

  font-family: "Montserrat";
  font-size: 24px;
  color: #f5f5f5;
`;

const SoundbiteContainer = styled.div`
  display: flex;

  margin: 0px 25px;
  margin-top: 25px;
  &:last-child {
    margin-bottom: 25px;
  }

  background-color: #f5f5f5;
  border-radius: 5px;
`;

const SoundbiteContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;

  margin: 15px;
`;

const SoundbiteName = styled.div`
  font-family: "Montserrat";
  font-size: 24px;
`;

const SoundbiteCount = styled.div`
  font-family: "Montserrat";
  font-size: 16px;
`;

const SoundbitePlayButton = styled.button`
  width: 50px;
  height: 50px;

  border: none;
  background-color: lightskyblue;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    box-shadow: 0px 0px 3px lightblue;
    transform: translateY(2px);
  }
`;

const SoundbiteAddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 8px;

  font-family: "Montserrat";
  font-size: 16px;
  font-weight: 600;
  color: #f5f5f5;

  border: none;
  background-color: #5dc139;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.1);

  & > span + svg {
    margin-left: 10px;
  }

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    box-shadow: 0px 0px 3px lightblue;
    transform: translateY(2px);
  }
`;

const SoundbiteDeleteButton = styled.button`
  width: 50px;
  height: 50px;

  border: none;
  background-color: #d93a3a;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    box-shadow: 0px 0px 3px lightblue;
    transform: translateY(2px);
  }
`;

const SoundbitePlayIcon = () => {
  return (
    <svg
      height="32"
      width="32"
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69l-8.14-5.17c-.67-.43-1.54.05-1.54.84z" />
    </svg>
  );
};

const SoundbiteAddIcon = () => {
  return (
    <svg
      height="18"
      width="18"
      viewBox="0 0 18 18"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m9 18c-.27857 0-.50893-.0911-.69107-.2732-.18214-.1822-.27322-.4125-.27322-.6911v-7.07141h-7.071424c-.278572 0-.508929-.09108-.691072-.27322-.1821424-.18214-.273214-.4125-.273214-.69107s.0910716-.50893.273214-.69107c.182143-.18214.4125-.27322.691072-.27322h7.071424v-7.071424c0-.278572.09108-.508929.27322-.691072.18214-.1821424.4125-.273214.69107-.273214s.50893.0910716.69107.273214c.18214.182143.27322.4125.27322.691072v7.071424h7.07141c.2786 0 .5089.09108.6911.27322.1821.18214.2732.4125.2732.69107s-.0911.50893-.2732.69107c-.1822.18214-.4125.27322-.6911.27322h-7.07141v7.07141c0 .2786-.09108.5089-.27322.6911-.18214.1821-.4125.2732-.69107.2732z" />
    </svg>
  );
};

const SoundbiteDeleteIcon = () => {
  return (
    <svg
      height="24"
      width="20"
      viewBox="0 0 20 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m3.15625 23.5c-.5 0-.9375-.1917-1.3125-.575s-.5625-.8306-.5625-1.3417v-18.2083h-1.28125v-1.91667h5.875v-.95833h8.25v.95833h5.875v1.91667h-1.2812v18.2083c0 .5111-.1876.9584-.5626 1.3417s-.8124.575-1.3124.575zm13.68755-20.125h-13.68755v18.2083h13.68755zm-10.37505 15.4611h1.875v-12.74582h-1.875zm5.18745 0h1.875v-12.74582h-1.875z" />
    </svg>
  );
};

const RightSideButtonsContainer = styled.div`
  display: flex;

  button {
    margin-left: 10px;
  }
`;

const SoundbitesQuery = `
	query {
		soundbites {
			name
			description
			count
		}
	}
`;

const PlaySountbiteMutation = `
	mutation ($name: String!) {
		playSoundbite(name: $name)
	}
`;

const DeleteSountbiteMutation = `
	mutation ($name: String!) {
		deleteSoundbite(name: $name)
	}
`;

const Soundbites = () => {
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: SoundbitesQuery,
  });

  const [playSoundbiteResult, playSoundbite] = useMutation(
    PlaySountbiteMutation
  );

  const [deleteSoundbiteResult, deleteSoundbite] = useMutation(
    DeleteSountbiteMutation
  );

  const handleDeleteSoundbite = (name: string) => {
    deleteSoundbite({ name }).then(() =>
      reexecuteQuery({ requestPolicy: "network-only" })
    );
  };

  return (
    <>
      <Head>
        <title>Soundbites</title>
      </Head>

      <PageContainer>
        <SoundbitesSection>
          <SoundbitesContainer>
            <SoundbitesTitleContainer>
              <SoundbitesTitle>All Soundbites</SoundbitesTitle>
            </SoundbitesTitleContainer>
            <SoundbitesContent>
              {data?.soundbites
                ?.sort((a: any, b: any) => a.count < b.count)
                ?.map((soundbite: any) => (
                  <SoundbiteContainer key={soundbite.name}>
                    <SoundbiteContent>
                      <SoundbiteName>{soundbite.name}</SoundbiteName>
                      <SoundbiteCount>
                        Played {soundbite.count} times.
                      </SoundbiteCount>
                      <RightSideButtonsContainer>
                        <SoundbiteDeleteButton
                          onClick={() => handleDeleteSoundbite(soundbite.name)}
                        >
                          <SoundbiteDeleteIcon />
                        </SoundbiteDeleteButton>
                        <SoundbitePlayButton
                          onClick={() =>
                            playSoundbite({ name: soundbite.name })
                          }
                        >
                          <SoundbitePlayIcon />
                        </SoundbitePlayButton>
                      </RightSideButtonsContainer>
                    </SoundbiteContent>
                  </SoundbiteContainer>
                ))}
            </SoundbitesContent>
          </SoundbitesContainer>
        </SoundbitesSection>
      </PageContainer>
    </>
  );
};

export default Soundbites;
