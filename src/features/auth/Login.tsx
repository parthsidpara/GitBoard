import { useState, useEffect, useRef } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { signInWithGoogle } from '@/lib/firebase'

function GoogleMark() {
  return (
    <svg className="size-4" viewBox="0 0 18 19" aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.342A8.8 8.8 0 0 1 8.842 18.083Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function InteractiveGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const cellSize = 32
    const hoveredCells: Map<string, { opacity: number }> = new Map()

    const readForeground = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() ||
      '#888888'
    let gridColor = readForeground()

    // Follow the theme: --foreground changes when the dark class toggles.
    const themeObserver = new MutationObserver(() => {
      gridColor = readForeground()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMoveWindow = (e: MouseEvent) => {
      const col = Math.floor(e.clientX / cellSize)
      const row = Math.floor(e.clientY / cellSize)
      const key = `${col},${row}`

      hoveredCells.set(key, { opacity: 0.4 })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMoveWindow)
    handleResize()

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cols = Math.ceil(canvas.width / cellSize)
      const rows = Math.ceil(canvas.height / cellSize)

      // Draw base grid lines using the themed foreground colour.
      ctx.globalAlpha = 0.06
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1

      for (let i = 0; i <= cols; i++) {
        ctx.beginPath()
        ctx.moveTo(i * cellSize, 0)
        ctx.lineTo(i * cellSize, canvas.height)
        ctx.stroke()
      }

      for (let j = 0; j <= rows; j++) {
        ctx.beginPath()
        ctx.moveTo(0, j * cellSize)
        ctx.lineTo(canvas.width, j * cellSize)
        ctx.stroke()
      }

      ctx.globalAlpha = 1

      // Draw active hovered grid cells with theme yellow highlight color
      hoveredCells.forEach((cell, key) => {
        const [col, row] = key.split(',').map(Number)

        ctx.fillStyle = `rgba(234, 179, 8, ${cell.opacity})` // Yellow/Amber theme highlight
        ctx.fillRect(col * cellSize + 1, row * cellSize + 1, cellSize - 1, cellSize - 1)

        cell.opacity -= 0.015
        if (cell.opacity <= 0) {
          hoveredCells.delete(key)
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMoveWindow)
      themeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  )
}

export function Login() {
  const { user, initializing } = useAuth()
  const [params] = useSearchParams()
  const [pending, setPending] = useState(false)

  const requestedNext = params.get('next')
  const next = requestedNext?.startsWith('/') ? requestedNext : '/'

  if (!initializing && user) return <Navigate to={next} replace />

  async function handleSignIn() {
    setPending(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      toast.error('Could not sign you in', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
      setPending(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-6 select-none">
      {/* Interactive Grid Background with Yellow Theme Highlights */}
      <InteractiveGridBackground />

      {/* Main Card Container */}
      <div className="group relative w-full max-w-sm rounded-xl border bg-card/95 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow-500/40 hover:shadow-md">
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-primary font-mono text-xs font-semibold text-primary-foreground transition-transform duration-300 group-hover:scale-105">
              GB
            </span>
            <span className="font-heading text-base font-medium">GitBoard</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Plot your GitHub issues on an Eisenhower matrix so you can see what actually needs doing
            next.
          </p>
        </div>

        <Button
          size="lg"
          className="relative w-full overflow-hidden transition-all duration-200 hover:shadow-sm active:scale-[0.99]"
          onClick={handleSignIn}
          disabled={pending}
          data-icon="inline-start"
        >
          <span
            className={`inline-flex items-center gap-2 transition-transform duration-200 ${pending ? 'animate-pulse' : ''}`}
          >
            <GoogleMark />
            {pending ? 'Signing in...' : 'Continue with Google'}
          </span>
        </Button>
      </div>
    </div>
  )
}
