import styled from "styled-components";
import Head from "next/head";
import PageContainer from "../src/component/layout/PageContainer";
import { useMutation, useQuery } from "urql";

const SoundbitesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
`;

const SoundbitesContent = styled.div`
  display: flex;
  flex-direction: column;

  margin-top: 25px;
  padding: 25px;
  width: 90%;

  background-color: white;
  border-radius: 5px;
`;

const SoundbitesContentTitle = styled.div`
  font-family: "Montserrat";
  font-size: 24px;
`;

const SoundbiteContainer = styled.div`
  display: flex;

  width: 100%;
  margin: 10px 0px;

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

const SoundbitePlayIcon = () => {
  return (
    <svg
      height="32"
      viewBox="0 0 24 24"
      width="32"
      xmlns="http://www.w3.org/2000/svg"
      fill="white"
    >
      <path d="m8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69l-8.14-5.17c-.67-.43-1.54.05-1.54.84z" />
    </svg>
  );
};

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

const Soundbites = () => {
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: SoundbitesQuery,
  });

  const [playSoundbiteResult, playSoundbite] = useMutation(
    PlaySountbiteMutation
  );

  return (
    <>
      <Head>
        <title>Soundbites</title>
      </Head>

      <PageContainer>
        <SoundbitesContainer>
          <SoundbitesContent>
            <SoundbitesContentTitle>All Soundbites</SoundbitesContentTitle>
            {data?.soundbites?.map((soundbite: any) => (
              <SoundbiteContainer key={soundbite.name}>
                <SoundbiteContent>
                  <SoundbiteName>{soundbite.name}</SoundbiteName>
                  <SoundbiteCount>
                    Played {soundbite.count} times.
                  </SoundbiteCount>
                  <SoundbitePlayButton
                    onClick={() => playSoundbite({ name: soundbite.name })}
                  >
                    <SoundbitePlayIcon />
                  </SoundbitePlayButton>
                </SoundbiteContent>
              </SoundbiteContainer>
            ))}
          </SoundbitesContent>
        </SoundbitesContainer>
      </PageContainer>
    </>
  );
};

export default Soundbites;
