import { useEffect, useRef, useState, useCallback } from 'react'
import { countWords, countFillerWords, calculateWPM, analyzeSpeechPace } from '../utils/speechAnalysis'

/**
 * @typedef {{
 *   score: number,
 *   wpm: number,
 *   transcript: string,
 *   fillerCount: number,
 *   issues: string[],
 *   isSpeaking: boolean,
 *   supported: boolean,
 * }} SpeechMetrics
 */

const DEFAULT_SPEECH_METRICS = {
  score: 100,
  wpm: 0,
  transcript: '',
  fillerCount: 0,
  issues: ['Speak to get speech-pace feedback'],
  isSpeaking: false,
  supported: true,
}

/**
 * Hook that uses the Web Speech API to transcribe the user's speech in real
 * time and compute pace / filler-word metrics.
 *
 * @param {{ active: boolean }} opts
 * @returns {{ speechMetrics: SpeechMetrics }}
 */
export function useSpeechAnalysis({ active }) {
  const [speechMetrics, setSpeechMetrics] = useState(DEFAULT_SPEECH_METRICS)

  const recognitionRef = useRef(null)
  const startTimeRef = useRef(null)
  const wordCountRef = useRef(0)
  const fillerCountRef = useRef(0)
  const fullTranscriptRef = useRef('')
  const isSpeakingRef = useRef(false)

  const supported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {
        // ignore
      }
      recognitionRef.current = null
    }
    startTimeRef.current = null
    wordCountRef.current = 0
    fillerCountRef.current = 0
    fullTranscriptRef.current = ''
    isSpeakingRef.current = false
    setSpeechMetrics(DEFAULT_SPEECH_METRICS)
  }, [])

  useEffect(() => {
    if (!active || !supported) {
      if (!supported) {
        setSpeechMetrics((prev) => ({
          ...prev,
          supported: false,
          issues: ['Speech recognition not supported in this browser (use Chrome)'],
        }))
      }
      stopRecognition()
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onstart = () => {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now()
      }
    }

    recognition.onresult = (event) => {
      isSpeakingRef.current = true
      let interimTranscript = ''
      let finalSegment = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalSegment += result[0].transcript + ' '
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalSegment) {
        fullTranscriptRef.current += finalSegment
        wordCountRef.current += countWords(finalSegment)
        fillerCountRef.current += countFillerWords(finalSegment)
      }

      const elapsedSeconds = startTimeRef.current
        ? (Date.now() - startTimeRef.current) / 1000
        : 0

      const wpm = calculateWPM(wordCountRef.current, elapsedSeconds)
      const { score, issues } = analyzeSpeechPace(
        wpm,
        fillerCountRef.current,
        true,
      )

      setSpeechMetrics({
        score,
        wpm,
        transcript: (fullTranscriptRef.current + interimTranscript).trim(),
        fillerCount: fillerCountRef.current,
        issues,
        isSpeaking: true,
        supported: true,
      })
    }

    recognition.onspeechend = () => {
      isSpeakingRef.current = false
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setSpeechMetrics((prev) => ({
          ...prev,
          issues: ['Microphone permission denied – allow access and reload'],
        }))
      }
    }

    // Auto-restart so it keeps listening through pauses.
    recognition.onend = () => {
      if (recognitionRef.current && active) {
        try {
          recognitionRef.current.start()
        } catch (_) {
          // Recognition might already be starting
        }
      }
    }

    try {
      recognition.start()
    } catch (err) {
      console.warn('SpeechRecognition start error:', err)
    }

    return () => {
      stopRecognition()
    }
  }, [active, supported, stopRecognition])

  return { speechMetrics }
}
