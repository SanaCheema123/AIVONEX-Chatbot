import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const uploadResume = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/upload-resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const generateDocuments = async (payload) => {
  const { data } = await api.post('/generate', payload)
  return data
}

export const refineDocuments = async (payload) => {
  const { data } = await api.post('/refine', payload)
  return data
}

export const downloadUrl = (path) => path   // already absolute /api/download/...
