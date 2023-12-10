import { Row } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const WrapperHeader = styled(Row)`
  background-color: var(--primary-color);
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
  width: 1270px;
  padding: 10px 0;
`;

export const WrapperTextHeader = styled(Link)`
  font-size: 20px;
  color: #000;
  font-weight: bold;
  text-align: left;
  &:hover {
    font-size: 20px;
    color: #660033;
  }
`;

export const WrapperHeaderAccout = styled.div`
  display: flex;
  align-items: center;
  color: #000000;
  gap: 10px;
  max-width: 200px;
`;

export const WrapperTextHeaderSmall = styled.span`
  font-size: 12px;
  color: #000000;
  white-space: nowrap;
`;

export const WrapperContentPopup = styled.p`
  cursor: pointer;
  &:hover {
    color: rgb(26, 148, 255);
  }
`;
