import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderApiKeyForm from './ProviderApiKeyForm';

const OpenAIForm = memo(() => {
  return <ProviderApiKeyForm provider={ModelProvider.OpenAI} showEndpoint />;
});

export default OpenAIForm;
