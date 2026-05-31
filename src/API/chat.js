import API from './axios'

// GET all conversations, or a single one by id
export const getConversations = (conversationId) => {
  if (conversationId) {
    return API.get('/api/chat/conversations', { params: { id: conversationId } })
  }
  return API.get('/api/chat/conversations')
}

export const createConversation  = ()     => API.post('/api/chat/conversations')
export const deleteConversation  = (id)   => API.delete(`/api/chat/conversations/${id}`)

// Main message endpoint — sends user text and receives Sarah's reply
export const getAIResponse = (data) => API.post('/api/chat/message', data)
// data: { message, quickReplyId?, conversationId? }