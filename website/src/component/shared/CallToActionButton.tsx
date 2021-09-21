import styled from "styled-components";

const CallToActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 175px;
  height: 50px;

  border: none;
  color: white;
  background-color: lightskyblue;
  text-decoration: none;
  cursor: pointer;
  border-radius: 5px;
  font-family: "Montserrat";
  font-size: 16px;
  font-weight: 700;
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

export default CallToActionButton;
