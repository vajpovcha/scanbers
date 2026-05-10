const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY || ''
const MAX_BYTES = 8 * 1024 * 1024

export async function uploadImage(file) {
  if (!IMGBB_KEY) throw new Error('VITE_IMGBB_KEY is not set')
  if (file.size > MAX_BYTES) throw new Error('FILE_TOO_BIG')

  const compressed = await compressImage(file)
  const base64 = await toBase64(compressed)

  const form = new FormData()
  form.append('key', IMGBB_KEY)
  form.append('image', base64.split(',')[1])

  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form })
  const data = await res.json()
  if (!data.success) throw new Error('Image upload failed')
  return data.data.url
}

async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_W = 1920
      const scale = img.width > MAX_W ? MAX_W / img.width : 1
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => resolve(new File([blob], 'evidence.jpg', { type: 'image/jpeg' })),
        'image/jpeg', 0.85
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
