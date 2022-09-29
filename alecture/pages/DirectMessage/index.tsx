import Workspace from '@layouts/Workspace';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Header } from './styles';
import gravatar from 'gravatar';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import { IDM } from '@typings/db';
import { DragOver } from '@pages/Channel/style';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const [dragOver, setDragOver] = useState(false);
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);
  const scrollbarRef = useRef<Scrollbars>(null);

  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('/api/users', fetcher);
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IDM[]>(
    (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const onSubmitForm = useCallback(
    (e: any) => {
      e.preventDefault();
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .then(() => {
            localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
            mutateChat();
          })
          .catch((error) => {
            console.dir(error);
            mutateChat();
          });
      }
    },
    [chatData, chat, id, mutateChat, myData, userData, setChat, workspace],
  );

  const onMessage = useCallback(
    (data: IDM) => {
      if (data.SenderId === Number(id) && myData.id !== Number(id)) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 50);
            }
          }
        });
      }
    },
    [id, mutateChat, myData],
  );

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
  }, [workspace, id]);

  const onDrop = useCallback(
    (e: any) => {
      e.preventDefault();
      const formData = new FormData();
      if (e.dataTransfer.items) {
        for (const item of e.dataTransfer.items) {
          if (item.kind === 'file') {
            const file = item.getAsFile();
            formData.append('image', file);
          }
        }
      } else {
        for (const file of e.dataTransfer.files) {
          formData.append('image', file);
        }
      }
      axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(() => {
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
        setDragOver(false);
        mutateChat();
      });
    },
    [id, workspace, mutateChat],
  );

  const onDragOver = useCallback((e: any) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  if (!userData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Workspace>
      <Container onDrop={onDrop} onDragOver={onDragOver}>
        <Header>
          <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
          <span>{userData.nickname}</span>
        </Header>
        <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isReachingEnd={isReachingEnd} />
        <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat} />
        {dragOver && <DragOver>업로드!</DragOver>}
      </Container>
    </Workspace>
  );
};

export default DirectMessage;
