/**
 * HeyGen integration — alternative to D-ID for the AI talking-photo video feature.
 * ──────────────────────────────────────────────────────────────────────────────
 * D-ID stays the default (DID_KEY). Set VIDEO_PROVIDER=heygen and HEYGEN_KEY in
 * .env to switch, or D-ID is used automatically as long as DID_KEY is set;
 * HeyGen is used as a fallback if only HEYGEN_KEY is configured.
 *
 * Flow (per HeyGen's v1/v2 API — verify against https://docs.heygen.com if
 * endpoints have moved by the time this runs, HeyGen's API has changed
 * versions before):
 *   1. POST https://upload.heygen.com/v1/asset   — upload the photo, get an image key
 *   2. POST https://api.heygen.com/v2/video/generate — generate a talking_photo video
 *   3. GET  https://api.heygen.com/v1/video_status.get?video_id=... — poll for completion
 *
 * HeyGen bills pay-as-you-go (from $5, no monthly minimum) which suits a
 * low-volume school feature much better than Synthesia's $29+/mo plans.
 */

import axios from 'axios'
import { didQueue as heygenQueue } from './queue' // reuse the same concurrency limiter

export function heygenError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = (err as any).response
    const status: number = resp?.status ?? 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = resp?.data ?? {}
    if (status === 401) return 'HeyGen API key is invalid. Check HEYGEN_KEY in Railway environment variables.'
    if (status === 402 || status === 429) return 'HeyGen credits exhausted or rate-limited. Check your HeyGen account balance.'
    const msg: string = body?.message ?? body?.error?.message ?? ''
    if (msg) return `HeyGen error (${status}): ${msg}`
    return `HeyGen returned status ${status}`
  }
  return err instanceof Error ? err.message : 'Video generation failed'
}

export async function heygenCreateTalkingVideo(opts: {
  photoBase64: string
  script: string
  apiKey: string
}): Promise<{ talkId: string; status: string }> {
  const { photoBase64, script, apiKey } = opts

  // 1. Upload the photo as a raw binary asset
  const imgBuffer = Buffer.from(photoBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
  const uploadRes = await heygenQueue.run(() => axios.post(
    'https://upload.heygen.com/v1/asset',
    imgBuffer,
    { headers: { 'X-Api-Key': apiKey, 'Content-Type': 'image/jpeg' } }
  ))
  const imageKey: string = uploadRes.data?.data?.image_key ?? uploadRes.data?.data?.id
  if (!imageKey) throw new Error('HeyGen photo upload returned no image key')

  // 2. Generate a talking-photo video from that image + script text (HeyGen TTS voice)
  const genRes = await heygenQueue.run(() => axios.post(
    'https://api.heygen.com/v2/video/generate',
    {
      video_inputs: [{
        character: { type: 'talking_photo', talking_photo_id: imageKey },
        voice: { type: 'text', input_text: script, voice_id: process.env.HEYGEN_VOICE_ID || '' },
      }],
      dimension: { width: 720, height: 1280 },
    },
    { headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' } }
  ))
  const videoId: string = genRes.data?.data?.video_id
  if (!videoId) throw new Error('HeyGen video generation returned no video_id')

  return { talkId: videoId, status: 'processing' }
}

export async function heygenCheckStatus(videoId: string, apiKey: string): Promise<{ status: string; videoUrl: string | null }> {
  const res = await axios.get('https://api.heygen.com/v1/video_status.get', {
    params: { video_id: videoId },
    headers: { 'X-Api-Key': apiKey },
  })
  const status: string = res.data?.data?.status ?? 'unknown' // 'pending' | 'processing' | 'completed' | 'failed'
  const videoUrl: string | null = res.data?.data?.video_url || null
  return { status, videoUrl }
}
