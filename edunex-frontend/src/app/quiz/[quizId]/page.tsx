'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Award, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { api, isLoggedIn } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/auth/login'); return; }
    api.quizzes.get(quizId as string).then(setQuiz).catch(() => toast.error('Quiz not found')).finally(() => setLoading(false));
  }, [quizId, router]);

  const handleAnswer = (qId: string, idx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) return toast.error('Answer all questions first');
    setSubmitting(true);
    try {
      const res = await api.quizzes.submit(quizId as string, answers);
      setResult(res);
      setSubmitted(true);
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const reset = () => { setAnswers({}); setSubmitted(false); setResult(null); setCurrent(0); };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center pt-16 text-gray-400">Quiz not found</div>;

  const q = quiz.questions[current];
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Result screen */}
        {submitted && result && (
          <div className="card p-10 text-center">
            <div className={cn('w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6', result.passed ? 'bg-green-500/20' : 'bg-red-500/20')}>
              {result.passed ? <Award className="w-10 h-10 text-green-400" /> : <XCircle className="w-10 h-10 text-red-400" />}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{result.passed ? 'Congratulations!' : 'Try Again'}</h2>
            <p className="text-gray-400 mb-8">{result.passed ? 'You passed the quiz!' : `You need ${quiz.passingScore}% to pass`}</p>
            <div className="text-6xl font-extrabold mb-2">
              <span className={result.passed ? 'text-green-400' : 'text-red-400'}>{Math.round(result.score)}%</span>
            </div>
            <p className="text-gray-400 mb-10">{result.correct} / {result.total} correct</p>

            <div className="space-y-4 text-left mb-8">
              {result.results?.map((r: any, i: number) => (
                <div key={r.questionId} className={cn('p-4 rounded-xl border', r.correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20')}>
                  <div className="flex items-start gap-3">
                    {r.correct ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-white font-medium text-sm">{quiz.questions[i]?.question}</p>
                      {!r.correct && <p className="text-sm text-gray-400 mt-1">Correct: <span className="text-green-400">{quiz.questions[i]?.options[r.correctIndex]}</span></p>}
                      {r.explanation && <p className="text-xs text-gray-500 mt-1">{r.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={reset} className="btn-secondary flex items-center gap-2"><RotateCcw className="w-4 h-4" />Retry</button>
              <button onClick={() => router.back()} className="btn-primary flex items-center gap-2">Back to Course <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {!submitted && (
          <>
            {/* Quiz header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{quiz.questions.length} questions · Pass with {quiz.passingScore}%</span>
                <span>{answered}/{quiz.questions.length} answered</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(answered / quiz.questions.length) * 100}%` }} /></div>
            </div>

            {/* Question */}
            <div className="card p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <span className="badge bg-primary-500/20 text-primary-400">Question {current + 1} of {quiz.questions.length}</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-8">{q.question}</h2>
              <div className="space-y-3">
                {q.options.map((opt: string, idx: number) => (
                  <button key={idx} onClick={() => handleAnswer(q.id, idx)}
                    className={cn('w-full text-left p-4 rounded-xl border-2 transition-all font-medium',
                      answers[q.id] === idx ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800')}>
                    <span className="inline-flex w-7 h-7 rounded-full bg-gray-700 items-center justify-center text-sm mr-3">{String.fromCharCode(65 + idx)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary disabled:opacity-40">← Previous</button>
              <div className="flex gap-1">
                {quiz.questions.map((_: any, i: number) => (
                  <button key={i} onClick={() => setCurrent(i)} className={cn('w-3 h-3 rounded-full transition-all', i === current ? 'bg-primary-500' : answers[quiz.questions[i].id] !== undefined ? 'bg-green-500' : 'bg-gray-700')} />
                ))}
              </div>
              {current < quiz.questions.length - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)} className="btn-primary">Next →</button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting || answered < quiz.questions.length} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : 'Submit Quiz'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
