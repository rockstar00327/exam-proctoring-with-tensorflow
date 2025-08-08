import React, { useState } from 'react';
import { styled, Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Header from './header/Header';




const PageWrapper = styled('div')(() => ({
  // display: 'flex',
  // flexGrow: 1,
  // paddingBottom: '60px',
  // flexDirection: 'column',
  // zIndex: 1,
  // backgroundColor: 'black',
}));

const ExamLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [, setMobileSidebarOpen] = useState(false);
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  return (
    <Box>
      {/* ------------------------------------------- */}
      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <PageWrapper>
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          toggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        {/* ------------------------------------------- */}
        {/* PageContent */}
        {/* ------------------------------------------- */}
        <Outlet />
      </PageWrapper>
    </Box>
  );
};

export default ExamLayout;
