import { produce } from 'immer';
import pMap from 'p-map';
import { Md5 } from 'ts-md5';
import { StateCreator } from 'zustand/vanilla';

import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { ChatPluginPayload, ChatToolPayload } from '@/types/message';
import {  OpenAIToolCall } from '@/types/openai/functionCall';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors } from '../../selectors';

const n = setNamespace('plugin');

export interface ChatPluginAction {
  fillPluginMessageContent: (id: string, content: string) => Promise<void>;
  invokeBuiltinTool: (id: string, payload: ChatPluginPayload) => Promise<void>;
  invokeDefaultTypePlugin: (id: string, payload: any) => Promise<void>;
  invokeDefaultTypeTool: (id: string, payload: ChatToolPayload) => Promise<void>;
  triggerFunctionCall: (id: string) => Promise<void>;
  triggerToolCalls: (id: string) => Promise<void>;
  updatePluginState: (id: string, key: string, value: any) => Promise<void>;
  updateToolCallData: (messageId: string, callId: string, data: any) => Promise<void>;
  updateToolLoading: (id: string, state: boolean) => void;
}

export const chatPlugin: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPluginAction
> = (set, get) => ({
  fillPluginMessageContent: async (id, content) => {
    const { coreProcessMessage, updateMessageContent } = get();

    await updateMessageContent(id, content);

    const chats = chatSelectors.currentChats(get());
    await coreProcessMessage(chats, id);
  },
  invokeBuiltinTool: async (id, payload) => {
    const { toggleChatLoading, updateMessageContent } = get();
    const params = JSON.parse(payload.arguments);
    toggleChatLoading(true, id, n('invokeBuiltinTool') as string);
    const data = await useToolStore.getState().invokeBuiltinTool(payload.apiName, params);
    toggleChatLoading(false);

    if (data) {
      await updateMessageContent(id, data);
    }

    // postToolCalling
    // @ts-ignore
    const { [payload.apiName]: action } = get();
    if (!action || !data) return;

    await action(id, JSON.parse(data));
  },
  invokeDefaultTypePlugin: async (id, payload) => {
    const { updateMessageContent, refreshMessages, coreProcessMessage, toggleChatLoading } = get();
    let data: string;

    try {
      const abortController = toggleChatLoading(true, id, n('fetchPlugin') as string);
      data = await chatService.runPluginApi(payload, { signal: abortController?.signal });
    } catch (error) {
      const err = error as Error;

      // ignore the aborted request error
      if (!err.message.includes('The user aborted a request.')) {
        await messageService.updateMessageError(id, error as any);
        await refreshMessages();
      }

      data = '';
    }
    toggleChatLoading(false);
    // 如果报错则结束了
    if (!data) return;

    await updateMessageContent(id, data);

    const chats = chatSelectors.currentChats(get());
    await coreProcessMessage(chats, id);
  },
  invokeDefaultTypeTool: async (id, payload) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;
    const { refreshMessages, updateToolLoading, updateToolCallData } = get();

    let data: string;

    try {
      updateToolLoading(id, true);
      data = await chatService.runPluginApi(payload, {
        // signal:abortController?.signal
      });
    } catch (error) {
      const err = error as Error;

      // ignore the aborted request error
      if (!err.message.includes('The user aborted a request.')) {
        // await messageService.updateMessageError(id, error as any);
        await refreshMessages();
      }

      data = '';
    }

    updateToolLoading(id, false);
    // 如果报错则结束了
    if (!data) return;

    await updateToolCallData(id, payload.id, data);
  },
  triggerFunctionCall: async (id) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const { invokeDefaultTypePlugin, invokeBuiltinTool, refreshMessages } = get();

    let payload = { apiName: '', identifier: '' } as ChatPluginPayload;

    // 识别到内容是 function_call 的情况下
    // 将 function_call 转换为 plugin request payload
    if (message.content) {
      const { tool_calls } = JSON.parse(message.content) as {
        tool_calls: OpenAIToolCall[];
      };

      const function_call = tool_calls[0].function;

      const [identifier, apiName, type] = function_call.name.split(PLUGIN_SCHEMA_SEPARATOR);

      payload = {
        apiName,
        arguments: function_call.arguments,
        identifier,
        type: (type ?? 'default') as any,
      };

      // if the apiName is md5, try to find the correct apiName in the plugins
      if (apiName.startsWith(PLUGIN_SCHEMA_API_MD5_PREFIX)) {
        const md5 = apiName.replace(PLUGIN_SCHEMA_API_MD5_PREFIX, '');
        const manifest = pluginSelectors.getPluginManifestById(identifier)(useToolStore.getState());

        const api = manifest?.api.find((api) => Md5.hashStr(api.name).toString() === md5);
        if (!api) return;
        payload.apiName = api.name;
      }
    } else {
      if (message.plugin) payload = message.plugin;
    }

    if (!payload.apiName) return;

    await messageService.updateMessage(id, {
      content: !!message.content ? '' : undefined,
      plugin: payload,
      role: 'function',
    });
    await refreshMessages();

    switch (payload.type) {
      case 'standalone': {
        // TODO: need to auth user's settings
        break;
      }
      case 'builtin': {
        await invokeBuiltinTool(id, payload);
        break;
      }
      default: {
        await invokeDefaultTypePlugin(id, payload);
      }
    }
  },

  triggerToolCalls: async (id) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;
    const { refreshMessages, invokeDefaultTypeTool } = get();

    let payload = [] as ChatToolPayload[];

    if (message.content) {
      const { tool_calls } = JSON.parse(message.content) as {
        tool_calls: OpenAIToolCall[];
      };

      for (const i of tool_calls) {
        const [identifier, apiName, type] = i.function.name.split(PLUGIN_SCHEMA_SEPARATOR);

        const call = {
          apiName,
          arguments: i.function.arguments,
          id: i.id,
          identifier,
          type: (type ?? 'default') as any,
        };

        // if the apiName is md5, try to find the correct apiName in the plugins
        if (apiName.startsWith(PLUGIN_SCHEMA_API_MD5_PREFIX)) {
          const md5 = apiName.replace(PLUGIN_SCHEMA_API_MD5_PREFIX, '');
          const manifest = pluginSelectors.getPluginManifestById(identifier)(
            useToolStore.getState(),
          );

          const api = manifest?.api.find((api) => Md5.hashStr(api.name).toString() === md5);
          if (!api) return;
          call.apiName = api.name;
        }

        payload.push(call);
      }

      payload = payload.filter((p) => p.apiName);
    } else {
      if (message.tools) payload = message.tools;
    }

    await messageService.updateMessage(id, {
      content: !!message.content ? '' : undefined,
      role: 'tool',
      tools: payload,
    });
    await refreshMessages();

    pMap(payload, async (tool) => {
      switch (tool.type) {
        case 'standalone': {
          break;
        }
        case 'default': {
          await invokeDefaultTypeTool(id, tool);
          break;
        }
        case 'builtin': {
          console.log('触发内置工具');
          break;
        }
      }
    });
  },

  updatePluginState: async (id, key, value) => {
    const { refreshMessages } = get();

    await messageService.updateMessagePluginState(id, key, value);
    await refreshMessages();
  },
  updateToolCallData: async (messageId, callId, data) => {
    const { refreshMessages } = get();
    const message = chatSelectors.getMessageById(messageId)(get());
    if (!message) return;

    const { tools } = message;
    if (!tools) return;

    const nextTools = produce(tools, (draft) => {
      const tool = draft.find((i) => i.id === callId);
      if (!tool) return;
      tool.data = data;
    });

    await messageService.updateMessage(messageId, { tools: nextTools });
    await refreshMessages();
  },
  updateToolLoading: (id, state) => {
    set({ toolsLoading: { ...get().toolsLoading, [id]: state } });
  },
});
