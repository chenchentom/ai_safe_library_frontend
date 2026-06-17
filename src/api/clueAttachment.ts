import service, { del, get } from './index'

export interface ClueAttachment {
  id: string
  fileName: string
  contentType?: string
  size?: number
  uploadTime?: string
}

export interface ReportAttachmentMeta {
  id?: string
  file_name?: string
  fileName?: string
  content_type?: string
  contentType?: string
  size?: number
}

export function listClueAttachments(clueId: string) {
  return get<ClueAttachment[]>(`/business/clue-attachment/clue/${clueId}`)
}

export function uploadClueAttachments(clueId: string, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return service
    .post(`/business/clue-attachment/clue/${clueId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res as unknown as ClueAttachment[])
}

export function deleteClueAttachment(id: string) {
  return del<string>(`/business/clue-attachment/${id}`)
}

function attachmentUrl(id: number | string, action: 'preview' | 'download') {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const token = localStorage.getItem('token') || ''
  const path = `/business/clue-attachment/${id}/${action}`
  return `${base}${path}?token=${encodeURIComponent(token)}`
}

/** 带 Authorization 拉取 blob（预览/下载） */
export async function fetchAttachmentBlob(id: number | string, action: 'preview' | 'download') {
  const response = await service.get(`/business/clue-attachment/${id}/${action}`, {
    responseType: 'blob',
  })
  return response.data as Blob
}

export function attachmentPreviewUrl(id: number | string) {
  return attachmentUrl(id, 'preview')
}

export function attachmentDownloadUrl(id: number | string) {
  return attachmentUrl(id, 'download')
}

export async function downloadClueAttachment(id: number | string, fileName: string) {
  const blob = await fetchAttachmentBlob(id, 'download')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function normalizeAttachmentName(item: ReportAttachmentMeta | ClueAttachment): string {
  if ('fileName' in item && item.fileName) return item.fileName
  if ('file_name' in item && item.file_name) return item.file_name
  return '报告'
}

export function normalizeAttachmentId(item: ReportAttachmentMeta | ClueAttachment): string {
  if ('id' in item && item.id != null && item.id !== '') {
    return String(item.id)
  }
  return ''
}

export function isPdfAttachment(name: string, contentType?: string) {
  return /\.pdf$/i.test(name) || contentType === 'application/pdf'
}

export function isDocxAttachment(name: string, contentType?: string) {
  return /\.docx$/i.test(name) || contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

export function isImageAttachment(name: string, contentType?: string) {
  return /\.(png|jpe?g)$/i.test(name) || (contentType?.startsWith('image/') ?? false)
}
