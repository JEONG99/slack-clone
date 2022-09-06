import fetcher from '@utils/fetcher';
import React, { FC, useCallback, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import { useNavigate } from 'react-router';

const Workspace: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { mutate } = useSWRConfig();
  const { data, error } = useSWR('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 100000,
  });

  const navigate = useNavigate();

  const onLogout = useCallback(() => {
    axios
      .post('http://localhost:3095/api/users/logout', null, {
        withCredentials: true,
      })
      .then(() => {
        mutate('http://localhost:3095/api/users', false, { revalidate: false });
      });
  }, []);

  useEffect(() => {
    if (!data) {
      navigate('/login');
    }
  }, [data, navigate]);

  return (
    <div>
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  );
};

export default Workspace;
