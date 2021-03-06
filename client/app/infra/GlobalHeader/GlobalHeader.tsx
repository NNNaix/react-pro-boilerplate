import React, { FC } from 'react';
import { Layout } from 'antd';
import Logo from './Logo';

const { Header } = Layout;

const GlobalHeader: FC = () => (
    <Header className="global-header">
        <Logo />
    </Header>
);

export default GlobalHeader;
