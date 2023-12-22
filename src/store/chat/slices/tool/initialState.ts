export interface ChatToolState {
  dalleImageLoading: Record<string, boolean>;
  toolsLoading: Record<string, boolean>;
}

export const initialToolState: ChatToolState = {
  dalleImageLoading: {},
  toolsLoading: {},
};
