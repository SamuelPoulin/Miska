import { useRouter } from "next/dist/client/router";
import Image from "next/image";
import styled from "styled-components";

const NavBarContainer = styled.div`
  position: fixed;

  display: flex;
  flex-direction: column;

  width: 250px;
  height: 100vh;

  background-color: white;
`;

const NavBarTop = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: 25px 0px;
`;

const NavBarName = styled.div`
  font-family: "Pacifico";
  font-size: 36px;
`;

const NavBarLinks = styled.div`
  display: flex;
  flex-direction: column;
`;

interface NavBarLinkProps {
  selected: boolean;
}

const NavBarLink = styled.a<NavBarLinkProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 50px;

  font-family: "Montserrat";
  font-weight: 700;
  font-size: 16px;
  color: ${({ selected }: any) => (selected ? "white" : "black")};
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  background-color: ${({ selected }: any) =>
    selected ? "lightskyblue" : "white"};

  &:hover {
    height: 60px;

    background-color: ${({ selected }: any) =>
      selected ? "#62BFF8" : "#F5F5F5"};
  }
`;

const NavBar = () => {
  const router = useRouter();

  return (
    <NavBarContainer>
      <NavBarTop>
        <Image
          src="/images/miska.png"
          layout="fixed"
          width="75"
          height="75"
          alt="Miska"
        />
        <NavBarName>Miska</NavBarName>
      </NavBarTop>
      <NavBarLinks>
        <NavBarLink href="/home" selected={router.asPath === "/home"}>
          Home
        </NavBarLink>
        <NavBarLink
          href="/soundbites"
          selected={router.asPath === "/soundbites"}
        >
          Soundbites
        </NavBarLink>
        <NavBarLink
          href="/flashbacks"
          selected={router.asPath === "/flashbacks"}
        >
          Flashbacks
        </NavBarLink>
        <NavBarLink href="/actions" selected={router.asPath === "/actions"}>
          Actions
        </NavBarLink>
        <NavBarLink href="/settings" selected={router.asPath === "/settings"}>
          Settings
        </NavBarLink>
      </NavBarLinks>
    </NavBarContainer>
  );
};

export default NavBar;
