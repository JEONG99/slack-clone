import React, { CSSProperties, FC, useCallback } from 'react';
import { CloseModalButton, CreateMenu } from './style';

interface Props {
  onCloseModal: (e: any) => void;
  style: CSSProperties;
  closeButton?: boolean;
}
const Menu: FC<React.PropsWithChildren<Props>> = ({ children, style, onCloseModal, closeButton }) => {
  const stopPropagation = useCallback((e: any) => {
    e.stopPropagation();
  }, []);

  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
};
Menu.defaultProps = {
  closeButton: true,
};

export default Menu;
