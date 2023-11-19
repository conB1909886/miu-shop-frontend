import { Spin } from 'antd';
import React from 'react';

const Loading = ({ children, isLoading, deday = 200 }) => {
  return (
    <Spin spinning={Boolean(isLoading)} delay={deday}>
      {children}
    </Spin>
  );
};

export default Loading;
