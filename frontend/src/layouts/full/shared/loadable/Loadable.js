import React, { Suspense } from "react";
import { Box, CircularProgress } from '@mui/material';

const Spinner = () => (
  <Box
    sx={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "150vw",
      height: "150vh",
    }}
  >
    <CircularProgress />
  </Box>
);

const Loadable = (Component) => (props) =>
(
  <Suspense fallback={<Spinner />}>
    <Component {...props} />
  </Suspense>
);

export default Loadable;
