import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import Workspace from '@layouts/Workspace';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, DragOver, Header } from './style';
import ChatList from '@components/ChatList';
import makeSection from '@utils/makeSection';
import { IChannel, IChat, IUser } from '@typings/db';
import useSWRInfinite from 'swr/infinite';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import useSocket from '@hooks/useSocket';
import { useParams } from 'react-router';
import Scrollbars from 'react-custom-scrollbars';
import axios from 'axios';
import InviteChannelModal from '@components/InviteChannelModal';

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { data: myData } = useSWR('/api/users', fetcher);
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);
  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const scrollbarRef = useRef<Scrollbars>(null);

  const onSubmitForm = useCallback(
    (e: any) => {
      e.preventDefault();
      if (chat?.trim() && chatData && channelData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData.id,
            User: myData,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
            content: chat,
          })
          .then(() => {
            localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
            mutateChat();
          })
          .catch((error) => {
            console.dir(error);
            mutateChat();
          });
      }
    },
    [channel, channelData, mutateChat, chat, chatData, myData, setChat, workspace],
  );

  const onMessage = useCallback(
    (data: IChat) => {
      if (data.Channel.name === channel && (data.content.startsWith('uploads\\') || data.UserId !== myData?.id)) {
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
    [channel, myData, mutateChat],
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
  }, [workspace, channel]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

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
      axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData).then(() => {
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
        setDragOver(false);
        mutateChat();
      });
    },
    [channel, workspace, mutateChat],
  );

  const onDragOver = useCallback((e: any) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  if (!myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Workspace>
      <Container onDrop={onDrop} onDragOver={onDragOver}>
        <Header>
          <span>#{channel}</span>
          <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            <span>{channelMembersData?.length}</span>
            <button
              onClick={onClickInviteChannel}
              className="c-button-unstyled p-ia__view_header__button"
              aria-label="Add people to #react-native"
              data-sk="tooltip_parent"
              type="button"
            >
              <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
            </button>
          </div>
        </Header>
        <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isReachingEnd={isReachingEnd} />
        <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat} />
        <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} />
        {dragOver && <DragOver>업로드!</DragOver>}
      </Container>
    </Workspace>
  );
};

export default Channel;
