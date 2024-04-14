import { SignIn } from '@clerk/nextjs';
import { Center } from 'react-layout-kit';

const Page = () => {
  return (
    <Center height={'100%'} width={'100%'}>
      <SignIn />
    </Center>
  );
};

export default Page;
