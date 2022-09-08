import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import loadable from '@loadable/component';

const LogIn = loadable(() => import('@pages/LogIn'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/workspace/:workspace/channel/:channel" element={<Channel />} />
      <Route path="/workspace/:workspace/dm/:id" element={<DirectMessage />} />
    </Routes>
  );
};

export default App;
