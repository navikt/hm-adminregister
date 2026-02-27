import styled from "styled-components";

export const DocumentList = styled.ol`
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ax-space-4);

  li {
    padding: var(--ax-space-2) var(--ax-space-4);
    display: flex;
    justify-content: space-between;

    background-color: #ffffff;
    box-shadow: var(--a-shadow-xsmall);
    border-radius: var(--a-border-radius-medium);
  }
`;
