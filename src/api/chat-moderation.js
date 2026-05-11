/**
 * @typedef {Object} PaginatedResponse
 * @property {number} total
 * @property {number} limit
 * @property {number} skip
 * @property {Array<any>} data
 */

/**
 * @typedef {Object} ChatMessage
 * @property {number|string} id
 * @property {number|string} chatId
 * @property {number|string} [companyId]
 * @property {number|string} [userId]
 * @property {string} [text]
 * @property {string} [type]
 * @property {boolean} [isRead]
 * @property {string} [moderationStatus]
 * @property {boolean} [isBlocked]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

const services = {
  chats: 'chats',
  chatMessages: 'chats-messages',
  commonMessages: 'common-chat-messages',
  commonCompanies: 'common-chat-companies',
  moderation: 'chat-message-moderation',
  blockedWords: 'chat-blocked-words',
}

function sanitizeQuery(query) {
  const q = { ...(query || {}) }
  Object.keys(q).forEach(key => {
    if (q[key] === undefined || q[key] === null || q[key] === '') {
      delete q[key]
    }
  })
  return q
}

export const chatModerationApi = {
  findChats(client, query) {
    return client.service(services.chats).find({ query: sanitizeQuery(query) })
  },

  getChat(client, id) {
    return client.service(services.chats).get(id)
  },

  findChatMessages(client, query) {
    return client.service(services.chatMessages).find({ query: sanitizeQuery(query) })
  },

  getChatMessage(client, id) {
    return client.service(services.chatMessages).get(id)
  },

  removeChatMessage(client, id) {
    return client.service(services.chatMessages).remove(id)
  },

  findCommonMessages(client, query) {
    return client.service(services.commonMessages).find({ query: sanitizeQuery(query) })
  },

  removeCommonMessage(client, id) {
    return client.service(services.commonMessages).remove(id)
  },

  findCommonCompanies(client, query) {
    return client.service(services.commonCompanies).find({ query: sanitizeQuery(query) })
  },

  findModerationLog(client, query) {
    return client.service(services.moderation).find({ query: sanitizeQuery(query) })
  },

  patchModeration(client, id, payload) {
    return client.service(services.moderation).patch(id, payload)
  },

  findBlockedWords(client, query) {
    return client.service(services.blockedWords).find({ query: sanitizeQuery(query) })
  },

  createBlockedWord(client, payload) {
    return client.service(services.blockedWords).create(payload)
  },

  patchBlockedWord(client, id, payload) {
    return client.service(services.blockedWords).patch(id, payload)
  },

  removeBlockedWord(client, id) {
    return client.service(services.blockedWords).remove(id)
  },
}

export function classifyChatType(chat) {
  const companies = chat.chatCompanies || []
  const users = chat.chatUsers || chat.users || []

  const hasCompanyPair = companies.length >= 2 || (!!chat.company1Id && !!chat.company2Id)
  const hasUserPair = users.length >= 2 || (!!chat.user1Id && !!chat.user2Id)
  const hasCompany = companies.length > 0 || !!chat.companyId || !!chat.company1Id || !!chat.company2Id
  const hasUser = users.length > 0 || !!chat.userId || !!chat.user1Id || !!chat.user2Id

  if (hasCompanyPair && !hasUserPair) return 'B2B'
  if (hasUserPair && !hasCompanyPair) return 'P2P'
  if (hasCompany && hasUser) return 'P2B'

  return chat.type || 'UNKNOWN'
}
