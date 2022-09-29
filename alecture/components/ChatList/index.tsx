import Chat from '@components/Chat';
import { IChat, IDM } from '@typings/db';
import React, { forwardRef, MutableRefObject, useCallback } from 'react';
import { ChatZone, Section, StickyHeader } from './styles';
import { Scrollbars } from 'react-custom-scrollbars';

interface Props {
  chatSections: { [key: string]: (IDM | IChat)[] };
  setSize: (f: (size: number) => number) => Promise<(IDM | IChat)[][] | undefined>;
  isReachingEnd: boolean;
}

const ChatList = forwardRef<Scrollbars, Props>(({ chatSections, setSize, isReachingEnd }, scrollRef) => {
  const onScroll = useCallback(
    (values: any) => {
      if (values.scrollTop === 0 && !isReachingEnd) {
        console.log('가장 위');
        setSize((prev) => prev + 1).then(() => {
          const current = (scrollRef as MutableRefObject<Scrollbars>)?.current;
          if (current) {
            console.log(values);
            console.log(current.getScrollHeight());
            console.log(values.scrollHeight);
            current.scrollTop(current.getScrollHeight() - values.scrollHeight);
          }
        });
      }
    },
    [setSize, scrollRef, isReachingEnd],
  );

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats?.map((chat) => {
                return <Chat key={chat.id} data={chat} />;
              })}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
});

export default ChatList;
