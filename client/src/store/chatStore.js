import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      channels: [],
      dms: [],
      activeChannel: null,
      messages: {},
      typingUsers: {},
      onlineUsers: new Set(),

      setChannels: (channels) => set({ channels }),
      setDms: (dms) => set({ dms }),
      setActiveChannel: (channel) => set({ activeChannel: channel }),
      addChannel: (channel) =>
        set((state) => ({ channels: [...state.channels, channel] })),

      setMessages: (channelId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [channelId]: messages },
        })),

      addMessage: (channelId, message) =>
        set((state) => {
          const existing = state.messages[channelId] || [];
          const alreadyExists = existing.some((m) => m.id === message.id);
          if (alreadyExists) return state;
          return {
            messages: {
              ...state.messages,
              [channelId]: [...existing, message],
            },
          };
        }),

      prependMessages: (channelId, olderMessages) =>
        set((state) => {
          const existing = state.messages[channelId] || [];
          return {
            messages: {
              ...state.messages,
              [channelId]: [...olderMessages, ...existing],
            },
          };
        }),

      setTyping: (channelId, userId, userName, isTyping) =>
        set((state) => {
          const channelTyping = { ...(state.typingUsers[channelId] || {}) };
          if (isTyping) {
            channelTyping[userId] = userName;
          } else {
            delete channelTyping[userId];
          }
          return {
            typingUsers: { ...state.typingUsers, [channelId]: channelTyping },
          };
        }),

      setUserOnline: (userId, isOnline) =>
        set((state) => {
          const updated = new Set(state.onlineUsers);
          if (isOnline) updated.add(userId);
          else updated.delete(userId);
          return { onlineUsers: updated };
        }),

      setOnlineUsers: (userIds) =>
        set({ onlineUsers: new Set(userIds) }),

      clearChat: () =>
        set({
          channels: [],
          dms: [],
          activeChannel: null,
          messages: {},
          typingUsers: {},
          onlineUsers: new Set(),
        }),
    }),
    {
      name: 'chat-storage', // localStorage key
      // Set aur onlineUsers persist mat karo — yeh runtime data hai
      partialize: (state) => ({
        channels: state.channels,
        dms: state.dms,
        activeChannel: state.activeChannel,
        messages: state.messages,
        // typingUsers aur onlineUsers intentionally exclude
      }),
    }
  )
);

export default useChatStore;