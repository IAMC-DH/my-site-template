"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronUp, MessageCircle, Phone } from "lucide-react"
import { useInlineEditor } from "@/contexts/inline-editor-context"

interface QuickActionConfig {
  hospitalName: string
  phoneDisplay: string
  phoneNumber: string
  kakaoUrl: string
  showScrollTop: boolean
}

const DEFAULT_CONFIG: QuickActionConfig = {
  hospitalName: "이로동물의료센터",
  phoneDisplay: "02) 887-1575",
  phoneNumber: "028871575",
  kakaoUrl: "http://pf.kakao.com/_xnfDCC/chat",
  showScrollTop: true,
}

const STORAGE_KEY = "floating-quick-actions"

const sanitizePhoneNumber = (value: string) => value.replace(/[^0-9+]/g, "")

export function FloatingQuickActions() {
  const { getData, saveData, isEditMode } = useInlineEditor()
  const [config, setConfig] = useState<QuickActionConfig>(DEFAULT_CONFIG)
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
  useEffect(() => {
    const saved = getData(STORAGE_KEY) as Partial<QuickActionConfig> | null
    if (saved) {
      setConfig((prev) => ({ ...prev, ...saved }))
    }
  }, [getData, isEditMode])

  useEffect(() => {
    const handleDataUpdate = (event: Event) => {
      const { detail } = event as CustomEvent<{ key: string; value: unknown }>
      if (!detail) return

      if (detail.key === STORAGE_KEY) {
        const incoming = detail.value as Partial<QuickActionConfig>
        setConfig((prev) => ({ ...prev, ...incoming }))
      }
    }

    window.addEventListener("inline-editor-data-updated", handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener("inline-editor-data-updated", handleDataUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 280)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const effectivePhoneNumber = useMemo(() => {
    const sanitized = sanitizePhoneNumber(config.phoneDisplay)
    return config.phoneNumber || sanitized
  }, [config.phoneDisplay, config.phoneNumber])

  const updateConfig = (key: keyof QuickActionConfig, value: string | boolean) => {
    setConfig((prev) => {
      const next: QuickActionConfig = {
        ...prev,
        [key]: value,
      }

      if (key === "phoneDisplay" && typeof value === "string") {
        const sanitized = sanitizePhoneNumber(value)
        if (!prev.phoneNumber || prev.phoneNumber === sanitizePhoneNumber(prev.phoneDisplay)) {
          next.phoneNumber = sanitized
        }
      }

      if (key === "phoneNumber" && typeof value === "string") {
        next.phoneNumber = sanitizePhoneNumber(value)
      }

      if (typeof next.phoneNumber === "string" && next.phoneNumber.length === 0) {
        next.phoneNumber = sanitizePhoneNumber(next.phoneDisplay)
      }

      saveData(STORAGE_KEY, next)
      return next
    })
  }

  const handleCall = () => {
    if (!effectivePhoneNumber) return
    window.location.href = `tel:${effectivePhoneNumber}`
  }

  const handleKakao = () => {
    if (!config.kakaoUrl) return
    window.open(config.kakaoUrl, "_blank", "noopener,noreferrer")
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {isEditMode && (
        <div className="pointer-events-auto w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
          <p className="mb-3 text-sm font-semibold text-foreground">빠른 액션 설정</p>
          <div className="space-y-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">전화 표시 문구</span>
              <input
                value={config.phoneDisplay}
                onChange={(event) => updateConfig("phoneDisplay", event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="02) 000-0000"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">전화 연결 번호</span>
              <input
                value={config.phoneNumber}
                onChange={(event) => updateConfig("phoneNumber", event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="숫자만 입력"
              />
              <span className="text-xs text-muted-foreground">공백과 하이픈은 자동으로 제거됩니다.</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">카카오톡 채널 URL</span>
              <input
                value={config.kakaoUrl}
                onChange={(event) => updateConfig("kakaoUrl", event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://pf.kakao.com/..."
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={config.showScrollTop}
                onChange={(event) => updateConfig("showScrollTop", event.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              스크롤 상단 버튼 사용
            </label>
          </div>
        </div>
      )}

      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <motion.button
          type="button"
          onClick={handleCall}
          disabled={!effectivePhoneNumber}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:h-14 md:w-14"
          aria-label="전화 연결"
        >
          <Phone className="h-5 w-5 md:h-6 md:w-6" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block">
            {config.phoneDisplay || "전화 연결"}
          </span>
        </motion.button>

        <motion.button
          type="button"
          onClick={handleKakao}
          disabled={!config.kakaoUrl}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE500] text-black shadow-lg transition-colors hover:bg-[#fbd91c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FEE500] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:h-14 md:w-14"
          aria-label="카카오톡 상담"
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block">
            카카오 채널 상담
          </span>
        </motion.button>

        <AnimatePresence>
          {config.showScrollTop && showScrollTopButton && (
            <motion.button
              key="scroll-top"
              type="button"
              onClick={scrollToTop}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 280, damping: 25 }}
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-lg backdrop-blur hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:h-14 md:w-14"
              aria-label="맨 위로"
            >
              <ChevronUp className="h-5 w-5 md:h-6 md:w-6" />
              <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block">
                맨 위로
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
