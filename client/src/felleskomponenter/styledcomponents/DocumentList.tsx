import styled from "styled-components";

export const DocumentList = styled.ol`
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: var(--a-spacing-3);

  li {
    padding: var(--a-spacing-2) var(--a-spacing-4);
    display: flex;
    justify-content: space-between;

    background-color: #ffffff;
    box-shadow: var(--a-shadow-xsmall);
    border-radius: var(--a-border-radius-medium);
  }
`;
