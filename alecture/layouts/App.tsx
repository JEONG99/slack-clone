import LogIn from '@pages/LogIn';
import SignUp from '@pages/SignUp';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
};

export default App;
