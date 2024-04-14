import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const AuthLayout = memo<PropsWithChildren>(({ children }) => {
  return (
    <Flexbox height={'100%'} width={'100%'}>
      {children}
    </Flexbox>
  );
});

export default AuthLayout;
