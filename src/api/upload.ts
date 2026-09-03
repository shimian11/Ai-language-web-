import http from './request'

export interface PresignResult {
  uploadUrl: string
  objectUrl: string
}

export function requestPresign(fileName: string): Promise<PresignResult> {
  return http.get<PresignResult>('/upload/presign', { fileName })
}

// 预签名直传 MinIO：不经后端中转文件体
export async function uploadImage(file: File): Promise<{ url: string }> {
  const presign = await requestPresign(file.name)
  await fetch(presign.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  return { url: presign.objectUrl }
}
