import useInput from '@hooks/useInput';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Error, Form, Header, Input, Label, LinkContainer } from '@pages/SignUp/styles';
import { Link, useNavigate } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import fetcher from '@utils/fetcher';

const LogIn = () => {
  const { mutate } = useSWRConfig();
  const navigate = useNavigate();
  const { data, error } = useSWR('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 100000,
  });
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const onSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          'http://localhost:3095/api/users/login',
          { email, password },
          {
            withCredentials: true,
          },
        )
        .then((response) => {
          mutate('http://localhost:3095/api/users', response.data, { revalidate: false });
        })
        .catch((error) => {
          setLogInError(error.response?.data?.code === 401);
        });
    },
    [email, password],
  );

  useEffect(() => {
    if (data) {
      console.log(data);
      navigate('/workspace/channel');
    }
  }, [navigate, data]);

  // console.log(error, userData);
  // if (!error && userData) {
  //   console.log('로그인됨', userData);
  //   return <Redirect to="/workspace/sleact/channel/일반" />;
  // }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
