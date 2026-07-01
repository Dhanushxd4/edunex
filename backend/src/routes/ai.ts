import { Router, type Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { aiQueue, didQueue } from '../lib/queue'

const router = Router()

// ── Fallback exam questions ───────────────────────────────────────────────────

const EXAM_FALLBACK: Record<string, Array<{ question: string; type: string; options?: string[]; answer?: string; marks: number }>> = {
  Mathematics: [
    { question: 'Solve for x: 2x + 5 = 15', type: 'short', answer: 'x = 5', marks: 2 },
    { question: 'What is the area of a circle with radius 7 cm?', type: 'short', answer: '154 sq cm', marks: 2 },
    { question: 'Which of the following is a prime number?', type: 'mcq', options: ['4', '6', '7', '9'], answer: '7', marks: 1 },
    { question: 'What is 15% of 200?', type: 'short', answer: '30', marks: 2 },
    { question: 'Find the LCM of 12 and 18.', type: 'short', answer: '36', marks: 2 },
    { question: 'Which of the following is a perfect square?', type: 'mcq', options: ['50', '64', '72', '90'], answer: '64', marks: 1 },
    { question: 'If a triangle has angles 60, 70, and x degrees, find x.', type: 'short', answer: '50 degrees', marks: 2 },
    { question: 'What is the value of pi (approx)?', type: 'mcq', options: ['3.14', '2.71', '1.41', '1.73'], answer: '3.14', marks: 1 },
    { question: 'Simplify: 3(2x - 4) + 5x', type: 'short', answer: '11x - 12', marks: 3 },
    { question: 'Explain the Pythagorean theorem with an example.', type: 'long', marks: 5 },
    { question: 'What is the perimeter of a rectangle with length 8 cm and width 5 cm?', type: 'short', answer: '26 cm', marks: 2 },
    { question: 'Find the HCF of 24 and 36.', type: 'short', answer: '12', marks: 2 },
  ],
  Science: [
    { question: 'What is the chemical formula of water?', type: 'mcq', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 'H2O', marks: 1 },
    { question: 'Name the process by which plants make food.', type: 'short', answer: 'Photosynthesis', marks: 2 },
    { question: 'Explain Newton\'s first law of motion.', type: 'long', marks: 5 },
    { question: 'Which gas is released during photosynthesis?', type: 'mcq', options: ['CO2', 'N2', 'O2', 'H2'], answer: 'O2', marks: 1 },
    { question: 'What is the SI unit of force?', type: 'mcq', options: ['Watt', 'Newton', 'Joule', 'Pascal'], answer: 'Newton', marks: 1 },
    { question: 'Name the largest planet in our solar system.', type: 'short', answer: 'Jupiter', marks: 2 },
    { question: 'What is the function of the mitochondria?', type: 'short', answer: 'Powerhouse of the cell; produces energy (ATP)', marks: 2 },
    { question: 'Describe the water cycle.', type: 'long', marks: 5 },
    { question: 'What is the speed of light?', type: 'mcq', options: ['3x10^8 m/s', '3x10^6 m/s', '3x10^10 m/s', '3x10^4 m/s'], answer: '3x10^8 m/s', marks: 1 },
    { question: 'Name the organ that pumps blood in the human body.', type: 'short', answer: 'Heart', marks: 1 },
    { question: 'What is the chemical symbol for gold?', type: 'mcq', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 'Au', marks: 1 },
    { question: 'Explain the greenhouse effect.', type: 'long', marks: 5 },
  ],
  English: [
    { question: 'Write a sentence using the word "perseverance".', type: 'short', marks: 2 },
    { question: 'Choose the correct form: She (go/goes) to school every day.', type: 'mcq', options: ['go', 'goes', 'gone', 'going'], answer: 'goes', marks: 1 },
    { question: 'Write a paragraph about your favourite season.', type: 'long', marks: 5 },
    { question: 'Identify the noun in: "The dog barked loudly."', type: 'short', answer: 'dog', marks: 1 },
    { question: 'Which of the following is an adjective?', type: 'mcq', options: ['run', 'quickly', 'beautiful', 'sing'], answer: 'beautiful', marks: 1 },
    { question: 'Write the plural of "child".', type: 'short', answer: 'children', marks: 1 },
    { question: 'What is the opposite of "ancient"?', type: 'mcq', options: ['old', 'modern', 'antique', 'historical'], answer: 'modern', marks: 1 },
    { question: 'Write a letter to your principal requesting a day off.', type: 'long', marks: 5 },
    { question: 'Change to passive voice: "She wrote the letter."', type: 'short', answer: 'The letter was written by her.', marks: 2 },
    { question: 'What does the idiom "break the ice" mean?', type: 'short', answer: 'To initiate conversation in an awkward situation', marks: 2 },
    { question: 'Fill in the blank: He has been working here ___ 2010.', type: 'mcq', options: ['for', 'since', 'from', 'at'], answer: 'since', marks: 1 },
    { question: 'Write a short essay on the importance of reading books.', type: 'long', marks: 5 },
  ],
  'Social Studies': [
    { question: 'Who was the first Prime Minister of India?', type: 'mcq', options: ['Mahatma Gandhi', 'Sardar Patel', 'Jawaharlal Nehru', 'B.R. Ambedkar'], answer: 'Jawaharlal Nehru', marks: 1 },
    { question: 'Name the largest continent in the world.', type: 'short', answer: 'Asia', marks: 1 },
    { question: 'What is the capital of India?', type: 'mcq', options: ['Mumbai', 'Kolkata', 'Chennai', 'New Delhi'], answer: 'New Delhi', marks: 1 },
    { question: 'In which year did India gain independence?', type: 'short', answer: '1947', marks: 1 },
    { question: 'Explain the importance of the Constitution of India.', type: 'long', marks: 5 },
    { question: 'Which river is known as the lifeline of North India?', type: 'mcq', options: ['Godavari', 'Krishna', 'Ganga', 'Brahmaputra'], answer: 'Ganga', marks: 1 },
    { question: 'What does GDP stand for?', type: 'short', answer: 'Gross Domestic Product', marks: 2 },
    { question: 'Name the southernmost tip of India.', type: 'short', answer: 'Kanyakumari', marks: 1 },
    { question: 'Describe the causes of World War I.', type: 'long', marks: 5 },
    { question: 'Which is the smallest state in India?', type: 'mcq', options: ['Goa', 'Tripura', 'Sikkim', 'Meghalaya'], answer: 'Goa', marks: 1 },
    { question: 'What is the Preamble to the Indian Constitution?', type: 'short', answer: 'An introductory statement that sets out the guiding principles of the Constitution', marks: 2 },
    { question: 'Name any three fundamental rights of Indian citizens.', type: 'short', answer: 'Right to Equality, Right to Freedom, Right against Exploitation', marks: 3 },
  ],
  Physics: [
    { question: 'What is the SI unit of electric current?', type: 'mcq', options: ['Volt', 'Watt', 'Ampere', 'Ohm'], answer: 'Ampere', marks: 1 },
    { question: 'State Ohm\'s Law.', type: 'short', answer: 'V = IR; voltage equals current times resistance', marks: 2 },
    { question: 'What is the speed of sound in air at room temperature?', type: 'mcq', options: ['343 m/s', '300 m/s', '400 m/s', '250 m/s'], answer: '343 m/s', marks: 1 },
    { question: 'Define acceleration.', type: 'short', answer: 'Rate of change of velocity with respect to time', marks: 2 },
    { question: 'What is the principle of conservation of energy?', type: 'long', marks: 5 },
    { question: 'Which of the following is not a vector quantity?', type: 'mcq', options: ['Velocity', 'Force', 'Speed', 'Displacement'], answer: 'Speed', marks: 1 },
    { question: 'What is the formula for kinetic energy?', type: 'short', answer: 'KE = 1/2 mv^2', marks: 2 },
    { question: 'Explain the working of a simple electric circuit.', type: 'long', marks: 5 },
    { question: 'What is the unit of resistance?', type: 'mcq', options: ['Ampere', 'Volt', 'Ohm', 'Watt'], answer: 'Ohm', marks: 1 },
    { question: 'State Newton\'s second law of motion.', type: 'short', answer: 'F = ma; force equals mass times acceleration', marks: 2 },
    { question: 'What is the difference between mass and weight?', type: 'long', marks: 5 },
    { question: 'What happens to resistance when length of wire doubles?', type: 'short', answer: 'Resistance doubles', marks: 2 },
  ],
  Chemistry: [
    { question: 'What is the atomic number of Carbon?', type: 'mcq', options: ['6', '8', '12', '14'], answer: '6', marks: 1 },
    { question: 'Name the process of separating a solid from a liquid by passing through a filter.', type: 'short', answer: 'Filtration', marks: 1 },
    { question: 'What is the chemical formula of common salt?', type: 'mcq', options: ['NaOH', 'NaCl', 'KCl', 'CaCO3'], answer: 'NaCl', marks: 1 },
    { question: 'Define an exothermic reaction.', type: 'short', answer: 'A reaction that releases heat/energy to the surroundings', marks: 2 },
    { question: 'Explain the periodic table and its significance.', type: 'long', marks: 5 },
    { question: 'What is pH of a neutral solution?', type: 'mcq', options: ['0', '7', '14', '3'], answer: '7', marks: 1 },
    { question: 'Name the gas produced when zinc reacts with dilute hydrochloric acid.', type: 'short', answer: 'Hydrogen gas', marks: 2 },
    { question: 'What are isotopes?', type: 'short', answer: 'Atoms of the same element with same atomic number but different mass numbers', marks: 2 },
    { question: 'Describe the process of electrolysis.', type: 'long', marks: 5 },
    { question: 'Which of the following is an alkali metal?', type: 'mcq', options: ['Magnesium', 'Calcium', 'Sodium', 'Aluminium'], answer: 'Sodium', marks: 1 },
    { question: 'What is Avogadro\'s number?', type: 'short', answer: '6.022 x 10^23', marks: 2 },
    { question: 'Balance the equation: H2 + O2 -> H2O', type: 'short', answer: '2H2 + O2 -> 2H2O', marks: 3 },
  ],
  Biology: [
    { question: 'What is the basic unit of life?', type: 'mcq', options: ['Tissue', 'Organ', 'Cell', 'Organism'], answer: 'Cell', marks: 1 },
    { question: 'Name the process by which cells divide.', type: 'short', answer: 'Mitosis (for growth) and Meiosis (for reproduction)', marks: 2 },
    { question: 'What is DNA?', type: 'short', answer: 'Deoxyribonucleic acid; carries genetic information', marks: 2 },
    { question: 'Which organ produces insulin?', type: 'mcq', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], answer: 'Pancreas', marks: 1 },
    { question: 'Explain the process of digestion in humans.', type: 'long', marks: 5 },
    { question: 'What is osmosis?', type: 'short', answer: 'Movement of water from low solute concentration to high solute concentration through a semi-permeable membrane', marks: 2 },
    { question: 'How many chromosomes are in a human cell?', type: 'mcq', options: ['23', '46', '44', '48'], answer: '46', marks: 1 },
    { question: 'Name the green pigment in plants.', type: 'short', answer: 'Chlorophyll', marks: 1 },
    { question: 'Describe the structure and function of the heart.', type: 'long', marks: 5 },
    { question: 'What is the role of ribosomes in a cell?', type: 'short', answer: 'Protein synthesis', marks: 2 },
    { question: 'Which vitamin is produced by sunlight?', type: 'mcq', options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], answer: 'Vitamin D', marks: 1 },
    { question: 'What is the difference between arteries and veins?', type: 'long', marks: 5 },
  ],
}

// ── POST /api/ai/exams ────────────────────────────────────────────────────────

router.post('/exams', requireAuth, async (req: AuthRequest, res: Response) => {
  const {
    subject    = 'Mathematics',
    cls        = 'Class 10',
    difficulty = 'Medium',
    type       = 'Mixed',
    language   = 'English',
    topic      = '',
    count      = 10,
  } = req.body as {
    subject?: string; cls?: string; difficulty?: string; type?: string
    language?: string; topic?: string; count?: number
  }

  const apiKey = process.env.GEMINI_KEY
  if (!apiKey || apiKey.startsWith('your_')) {
    const pool = EXAM_FALLBACK[subject] ?? EXAM_FALLBACK.Mathematics
    const questions = Array.from({ length: Math.min(count, 10) }, (_, i) => ({
      id: `q${i + 1}`, ...pool[i % pool.length],
    }))
    res.json({ success: true, data: { questions } })
    return
  }

  try {
    const topicClause = topic ? ` focusing on the topic: "${topic}"` : ''
    const prompt = `Generate exactly ${count} exam questions for ${subject}, ${cls}, difficulty: ${difficulty}, question types: ${type}, language: ${language}${topicClause}. Return a JSON array only. Each item: {"id":"q1","question":"...","type":"mcq|short|long","options":["A","B","C","D"],"answer":"...","marks":1}. For mcq include options array with 4 items, for short/long omit options. No explanation, just the JSON array.`

    // Use Gemini REST API with JSON mode for reliable structured output
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    const geminiRes = await aiQueue.run(() =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }).then((r) => r.json())
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: string = (geminiRes as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    if (!raw) throw new Error('Empty Gemini response')

    // Strip markdown fences just in case
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const arrMatch = cleaned.match(/\[[\s\S]*\]/)
    if (!arrMatch) throw new Error('No JSON array found')
    const questions = JSON.parse(arrMatch[0])
    res.json({ success: true, data: { questions } })
  } catch (_err) {
    const pool = EXAM_FALLBACK[req.body?.subject] ?? EXAM_FALLBACK.Mathematics
    const questions = Array.from({ length: 5 }, (_, i) => ({
      id: `q${i + 1}`, ...pool[i % pool.length],
    }))
    res.json({ success: true, data: { questions, fallback: true } })
  }
})

// ── D-ID Talking Video ────────────────────────────────────────────────────────

// Extract a human-readable error from an axios error (captures D-ID's response body)
function didError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = (err as any).response
    const status: number = resp?.status ?? 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = resp?.data ?? {}
    if (status === 402) return 'D-ID free credits exhausted. Please upgrade your D-ID plan at studio.d-id.com.'
    if (status === 401) return 'D-ID API key is invalid. Check DID_KEY in Railway environment variables.'
    if (status === 413) return 'Photo is too large. Please use a smaller image (under 5 MB).'
    const msg: string = body?.description ?? body?.message ?? body?.error ?? ''
    if (msg) return `D-ID error (${status}): ${msg}`
    return `D-ID returned status ${status}`
  }
  return err instanceof Error ? err.message : 'Video generation failed'
}

router.post('/video', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { photoBase64, script, voice = 'te-IN-ShrutiNeural' } = req.body as {
      photoBase64: string; script: string; voice?: string
    }
    const didKey = process.env.DID_KEY
    if (!didKey || didKey === 'your_did_api_key_base64') {
      res.status(400).json({ success: false, error: 'D-ID API key not configured.' })
      return
    }
    if (!photoBase64) {
      res.status(400).json({ success: false, error: 'photoBase64 is required' })
      return
    }
    if (!script?.trim()) {
      res.status(400).json({ success: false, error: 'script is required' })
      return
    }

    const DID_HEADERS = {
      Authorization: `Basic ${didKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    // 1. Upload photo to D-ID
    const uploadRes = await didQueue.run(() => axios.post(
      'https://api.d-id.com/images',
      { data: photoBase64 },
      { headers: DID_HEADERS }
    ))
    const imageUrl: string = uploadRes.data?.url ?? uploadRes.data?.id
    if (!imageUrl) {
      res.status(502).json({ success: false, error: 'D-ID image upload returned no URL' })
      return
    }

    // 2. Create talking video
    const talkRes = await didQueue.run(() => axios.post(
      'https://api.d-id.com/talks',
      {
        source_url: imageUrl,
        script: { type: 'text', input: script.trim(), provider: { type: 'microsoft', voice_id: voice } },
        config: { fluent: true, pad_audio: 0 },
      },
      { headers: DID_HEADERS }
    ))
    const talkId: string = talkRes.data?.id
    if (!talkId) {
      res.status(502).json({ success: false, error: 'D-ID talks API returned no ID' })
      return
    }

    res.json({ success: true, data: { talkId, status: talkRes.data?.status ?? 'created' } })
  } catch (err) {
    res.status(500).json({ success: false, error: didError(err) })
  }
})

router.get('/video/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const didKey = process.env.DID_KEY
    const response = await axios.get(`https://api.d-id.com/talks/${id}`, {
      headers: {
        Authorization: `Basic ${didKey}`,
        Accept: 'application/json',
      },
    })
    res.json({ success: true, data: { status: response.data?.status ?? 'unknown', videoUrl: response.data?.result_url || null } })
  } catch (err) {
    res.status(500).json({ success: false, error: didError(err) })
  }
})

// ── In-app Help Chat ──────────────────────────────────────────────────────────

const EDUNEX_SYSTEM = `You are the in-app assistant for Edunex LMS, a school management platform. Help school staff in a friendly, concise way (2-4 sentences). Reply in Telugu if asked in Telugu, English if asked in English. Redirect off-topic questions politely.`

router.post('/chat', requireAuth, async (req: AuthRequest, res: Response) => {
  const body    = req.body as { message?: string; history?: Array<{ role: 'user' | 'model'; text: string }> }
  const message = (body.message ?? '').trim()
  const history = body.history ?? []

  if (!message) { res.status(400).json({ success: false, error: 'Message required' }); return }

  const apiKey = process.env.GEMINI_KEY
  if (!apiKey || apiKey.startsWith('your_')) {
    res.json({ success: true, data: { reply: 'AI assistant is not configured. Please add a Gemini API key.' } })
    return
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: EDUNEX_SYSTEM })
    const chat  = model.startChat({
      history: history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    })
    const result = await aiQueue.run(() => chat.sendMessage(message))
    const reply  = result.response.text()
    res.json({ success: true, data: { reply } })
  } catch (_err) {
    const msg = message.toLowerCase()
    let reply = 'I am the Edunex AI assistant. How can I help you?'
    if (msg.includes('student'))                              reply = 'To add students, go to Students and click Add Student.'
    else if (msg.includes('teacher'))                         reply = 'To add teachers, go to Teachers and click Add Teacher.'
    else if (msg.includes('fee') || msg.includes('payment'))  reply = 'Manage fees in the Fees section. Track payments and generate reports.'
    else if (msg.includes('attendance'))                      reply = 'Record daily attendance in the Attendance section.'
    else if (msg.includes('exam') || msg.includes('question')) reply = 'Generate AI exam papers in the AI Exams section.'
    else if (msg.includes('video'))                           reply = 'Create AI video announcements in the AI Video section.'
    else if (msg.includes('admission') || msg.includes('apply')) reply = 'Share the admission form link from Admissions.'
    res.json({ success: true, data: { reply } })
  }
})

export default router
