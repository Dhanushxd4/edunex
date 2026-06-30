import { Router, type Request, type Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { geminiQueue, didQueue } from '../lib/queue'

const router = Router()

// ── Gemini Exam Generator ─────────────────────────────────────────────────────

const EXAM_FALLBACK: Record<string, Array<{ question: string; type: string; options?: string[]; answer?: string; marks: number }>> = {
  Mathematics: [
    { question: 'Solve for x: 2x + 5 = 15', type: 'short', answer: 'x = 5', marks: 2 },
    { question: 'What is the area of a circle with radius 7 cm?', type: 'short', answer: '154 cm²', marks: 2 },
    { question: 'Which of the following is a prime number?', type: 'mcq', options: ['4', '6', '7', '9'], answer: '7', marks: 1 },
  ],
  Science: [
    { question: 'What is the chemical formula of water?', type: 'mcq', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 'H2O', marks: 1 },
    { question: 'Name the process by which plants make food.', type: 'short', answer: 'Photosynthesis', marks: 2 },
    { question: 'Explain Newton\'s first law of motion.', type: 'long', marks: 5 },
  ],
  English: [
    { question: 'Write a sentence using the word "perseverance".', type: 'short', marks: 2 },
    { question: 'Choose the correct form: She (go/goes) to school every day.', type: 'mcq', options: ['go', 'goes', 'gone', 'going'], answer: 'goes', marks: 1 },
    { question: 'Write a paragraph about your favourite season.', type: 'long', marks: 5 },
  ],
}

// POST /api/ai/exams
router.post('/exams', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      subject = 'Mathematics',
      cls     = 'Class 10',
      difficulty = 'Medium',
      type    = 'Mixed',
      language = 'English',
      topic   = '',
      count   = 10,
    } = req.body as {
      subject?: string
      cls?: string
      difficulty?: string
      type?: string
      language?: string
      topic?: string
      count?: number
    }

    const apiKey = process.env.GEMINI_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key') {
      // Return fallback questions
      const fallback = EXAM_FALLBACK[subject] || EXAM_FALLBACK.Mathematics
      const questions = Array.from({ length: Math.min(count, 10) }, (_, i) => ({
        id: `q${i + 1}`,
        ...fallback[i % fallback.length],
      }))
      res.json({ success: true, data: { questions } })
      return
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const topicClause = topic ? ` focusing on the topic: "${topic}"` : ''
    const prompt = `Generate exactly ${count} exam questions for ${subject}, ${cls}, difficulty: ${difficulty}, question types: ${type}, language: ${language}${topicClause}.

Return ONLY a valid JSON array. Each object must have these fields:
- id: string (q1, q2, ...)
- question: string
- type: "mcq" | "short" | "long"
- options: string[] (only for mcq, exactly 4 options)
- answer: string (for mcq and short)
- marks: number (1 for mcq, 2-3 for short, 5 for long)

Example: [{"id":"q1","question":"...","type":"mcq","options":["A","B","C","D"],"answer":"A","marks":1}]

Return only the JSON array, no other text.`

    const result = await geminiQueue.run(() => model.generateContent(prompt))
    const text = result.response.text().trim()

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid response from Gemini')

    const questions = JSON.parse(jsonMatch[0])
    res.json({ success: true, data: { questions } })
  } catch (err) {
    // Fallback on any error
    const fallback = EXAM_FALLBACK[req.body?.subject] || EXAM_FALLBACK.Mathematics
    const questions = Array.from({ length: 5 }, (_, i) => ({
      id: `q${i + 1}`,
      ...fallback[i % fallback.length],
    }))
    res.json({ success: true, data: { questions, fallback: true } })
  }
})

// ── D-ID Talking Video ────────────────────────────────────────────────────────

// POST /api/ai/video
router.post('/video', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { photoBase64, script, voice = 'te-IN-ShrutiNeural' } = req.body as {
      photoBase64: string
      script: string
      voice?: string
    }

    const didKey = process.env.DID_KEY
    if (!didKey || didKey === 'your_did_api_key_base64') {
      res.status(400).json({ success: false, error: 'D-ID API key not configured. Add DID_KEY to backend .env' })
      return
    }

    // Upload source image to D-ID (queued — D-ID allows only 3 concurrent)
    const uploadRes = await didQueue.run(() => axios.post(
      'https://api.d-id.com/images',
      { data: photoBase64 },
      {
        headers: {
          Authorization: `Basic ${didKey}`,
          'Content-Type': 'application/json',
        },
      }))

    const imageUrl = uploadRes.data.url

    // Create talk
    const talkRes = await axios.post(
      'https://api.d-id.com/talks',
      {
        source_url: imageUrl,
        script: {
          type:        'text',
          input:       script,
          provider:    { type: 'microsoft', voice_id: voice },
        },
        config: { fluent: true, pad_audio: 0 },
      },
      {
        headers: {
          Authorization: `Basic ${didKey}`,
          'Content-Type': 'application/json',
        },
      },
    )

    res.json({ success: true, data: { talkId: talkRes.data.id, status: talkRes.data.status } })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Video generation failed' })
  }
})

// GET /api/ai/video/:id — poll D-ID status
router.get('/video/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const didKey = process.env.DID_KEY!

    const response = await axios.get(`https://api.d-id.com/talks/${id}`, {
      headers: { Authorization: `Basic ${didKey}` },
    })

    res.json({
      success: true,
      data: {
        status:   response.data.status,
        videoUrl: response.data.result_url || null,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to check video status' })
  }
})

// ── In-app Help Chat (Gemini) ─────────────────────────────────────────────────

const EDUNEX_SYSTEM = `మీరు Edunex LMS యొక్క in-app సహాయకుడు — పాఠశాల సిబ్బందికి స్నేహపూర్వకంగా సహాయపడే assistant.

Edunex లో ఈ features ఉన్నాయి: Dashboard, విద్యార్థులు (Students), ఉపాధ్యాయులు (Teachers), హాజరు (Attendance), ఫీజులు (Fees), బస్సు ట్రాకింగ్ (Bus Tracking), పరీక్షలు - AI generated (Exams), మార్కులు (Marks), అలర్ట్స్/బ్రాడ్‌కాస్ట్ (Alerts), AI వాయిస్ కాల్స్, WhatsApp నోటిఫికేషన్లు, D-ID అవతార్, Analytics, Settings, కోర్సులు (Courses), అడ్మిషన్లు (Admissions), Enquiries.

నియమాలు:
- వినియోగదారుడు తెలుగులో అడిగితే తెలుగులో జవాబు ఇవ్వండి (default Telugu)
- వినియోగదారుడు ఇంగ్లీషులో అడిగితే ఇంగ్లీషులో జవాబు ఇవ్వండి
- సంక్షిప్తంగా స్పష్టంగా జవాబు ఇవ్వండి (2-4 వాక్యాలు)
- పాఠశాల నిర్వహణకు సంబంధం లేని అంశాలను మర్యాదపూర్వకంగా దారి మళ్ళించండి`

// POST /api/ai/chat
router.post('/chat', requireAuth, async (req: AuthRequest, res: Response) => {
  // Extract message before try so it is accessible in catch fallback
  const body = req.body as { message?: string; history?: Array<{ role: 'user' | 'model'; text: string }> }
  const message = (body.message ?? '').trim()
  const history = body.history ?? []

  if (!message) { res.status(400).json({ success: false, error: 'Message required' }); return }

  const apiKey = process.env.GEMINI_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    res.json({ success: true, data: { reply: 'AI assistant is not configured yet. Please add your Gemini API key.' } })
    return
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: EDUNEX_SYSTEM })

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    })

    const result = await geminiQueue.run(() => chat.sendMessage(message))
    const response = await result.response
    const reply = response.text()

    res.json({ success: true, data: { reply } })
  } catch (_geminiErr) {
  
    // Fallback: rule-based school assistant when Gemini is unavailable
    const msg = message.toLowerCase()
    let reply = 'I am the Edunex AI assistant. I can help with student management, attendance, fees, and more. How can I assist you?'
    if (msg.includes('student')) reply = 'To add students, go to Students and click Add Student. You can also import students in bulk using the Import Data feature.'
    else if (msg.includes('teacher')) reply = 'To add teachers, go to Teachers and click Add Teacher. Teachers can be assigned to specific classes and subjects.'
    else if (msg.includes('fee') || msg.includes('payment')) reply = 'Manage fees in the Fees section. You can track payments, mark fees as paid, and generate reports.'
    else if (msg.includes('attendance')) reply = 'Record daily attendance in the Attendance section. Select the class and mark each student present or absent.'
    else if (msg.includes('exam') || msg.includes('question')) reply = 'Generate AI exam papers in the AI Exams section. Select subject, class, difficulty and click Generate.'
    else if (msg.includes('video')) reply = 'Create AI video announcements in the AI Video section. Upload a photo and add your script, then click Generate AI Video.'
    else if (msg.includes('admission') || msg.includes('apply')) reply = 'Share the admission form link from Admissions. Applications appear in the Applications tab.'
    res.json({ success: true, data: { reply } })
  }
})

export default router
