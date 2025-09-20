"use client"

import { ArrowUp, Heart, Youtube, Globe, Mail } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { EditableText } from "@/components/editable/editable-text"
import { useInlineEditor } from "@/contexts/inline-editor-context"
import { defaultConfig as headerDefaultConfig } from "@/components/header"

type StoredNavItem = {
  name: string
  url: string
  icon?: string
  show?: boolean
}

type FooterInfo = {
  showFooter: boolean
  name: string
  description: string
  showQuickLinks: boolean
  quickLinksTitle: string
  showContactInfo: boolean
  contactTitle: string
  phone: string
  email: string
  location: string
  copyright: string
  showMadeWith: boolean
  madeWithLocation: string
  showTemplateCredit: boolean
  templateCreator: {
    name: string
    youtube: string
    website: string
    email: string
  }
  showScrollTop: boolean
}

const FALLBACK_NAV_ITEMS: Array<{ name: string; url: string }> = [
  { name: "병원소개", url: "#about" },
  { name: "진료과목", url: "#projects" },
  { name: "오시는길", url: "#contact" },
]

const FOOTER_DEFAULT_INFO: FooterInfo = {
  showFooter: true,
  name: "이로동물의료센터",
  description: "반려동물의 치과/심장전문 동물병원",
  showQuickLinks: true,
  quickLinksTitle: "빠른 링크",
  showContactInfo: true,
  contactTitle: "연락처",
  phone: "02)887-1575",
  email: "iroanimal@naver.com",
  location: "서울시 관악구 남부순환로 1678, 1층/2층",
  copyright: "© 2025 IAMC. All rights reserved.",
  showMadeWith: true,
  madeWithLocation: "Mrbaeksang",
  showTemplateCredit: true,
  templateCreator: {
    name: "백상",
    youtube: "https://www.youtube.com/@Mrbaeksang95/videos",
    website: "https://devcom.kr/",
    email: "qortkdgus95@gmail.com",
  },
  showScrollTop: true,
}

const mapVisibleNavItems = (items?: StoredNavItem[]) => {
  if (!items) return []
  return items
    .filter((item) => item.show !== false && Boolean(item.name) && Boolean(item.url))
    .map((item) => ({ name: item.name, url: item.url }))
}

const getHeaderDefaultNavItems = () => {
  const mapped = mapVisibleNavItems(headerDefaultConfig.items as StoredNavItem[])
  return mapped.length > 0 ? mapped : FALLBACK_NAV_ITEMS
}

export function Footer() {
  const { getData, saveData, isEditMode, saveToFile } = useInlineEditor()
  const currentYear = new Date().getFullYear()

  const [navItems, setNavItems] = useState<Array<{ name: string; url: string }>>(() => getHeaderDefaultNavItems())
  const [footerInfo, setFooterInfo] = useState<FooterInfo>(() => ({
    ...FOOTER_DEFAULT_INFO,
    templateCreator: { ...FOOTER_DEFAULT_INFO.templateCreator },
  }))

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const applyFooterInfo = useCallback((savedData: Partial<FooterInfo> | null | undefined) => {
    if (savedData) {
      setFooterInfo({
        ...FOOTER_DEFAULT_INFO,
        ...savedData,
        showMadeWith: FOOTER_DEFAULT_INFO.showMadeWith,
        madeWithLocation: FOOTER_DEFAULT_INFO.madeWithLocation,
        showTemplateCredit: FOOTER_DEFAULT_INFO.showTemplateCredit,
        templateCreator: { ...FOOTER_DEFAULT_INFO.templateCreator },
      })
    } else {
      setFooterInfo({
        ...FOOTER_DEFAULT_INFO,
        templateCreator: { ...FOOTER_DEFAULT_INFO.templateCreator },
      })
    }
  }, [])

  const applyNavConfig = useCallback((navConfig?: { items?: StoredNavItem[] } | null) => {
    if (navConfig?.items) {
      const visible = mapVisibleNavItems(navConfig.items)
      setNavItems(visible.length > 0 ? visible : getHeaderDefaultNavItems())
    } else {
      setNavItems(getHeaderDefaultNavItems())
    }
  }, [])

  // localStorage에서 데이터 로드
  useEffect(() => {
    const savedFooter = getData('footer-info') as Partial<FooterInfo> | null
    applyFooterInfo(savedFooter)

    const navConfig = getData('nav-config') as { items?: StoredNavItem[] } | null
    applyNavConfig(navConfig)
  }, [applyFooterInfo, applyNavConfig, getData, isEditMode])

  useEffect(() => {
    const handleDataUpdate = (event: Event) => {
      const { detail } = event as CustomEvent<{ key: string; value: unknown }>
      if (!detail) return

      if (detail.key === 'nav-config') {
        applyNavConfig(detail.value as { items?: StoredNavItem[] })
      }

      if (detail.key === 'footer-info') {
        applyFooterInfo(detail.value as Partial<FooterInfo>)
      }
    }

    window.addEventListener('inline-editor-data-updated', handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener('inline-editor-data-updated', handleDataUpdate as EventListener)
    }
  }, [applyFooterInfo, applyNavConfig])

  const updateFooterInfo = async (key: string, value: string | boolean) => {
    // Made with와 템플릿 크레딧 관련 필드는 수정 불가
    if (key === 'showMadeWith' || key === 'madeWithLocation' || 
        key === 'showTemplateCredit' || key === 'templateCreator') {
      return
    }
    const newInfo = { ...footerInfo, [key]: value }
    setFooterInfo(newInfo)
    saveData('footer-info', newInfo)
    // 파일로도 저장
    await saveToFile('footer', 'Info', newInfo)
  }
  
  // 푸터 전체를 표시하지 않음
  if (!footerInfo.showFooter && !isEditMode) {
    return null
  }

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 상단 섹션 */}
        {(footerInfo.name || footerInfo.showQuickLinks || footerInfo.showContactInfo) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* 브랜드/이름 */}
            {footerInfo.name && (
              <div>
                <h3 className="font-bold text-foreground mb-3">
                  <EditableText
                    value={footerInfo.name}
                    onChange={(value) => updateFooterInfo('name', value)}
                    storageKey="footer-name"
                  />
                </h3>
                {footerInfo.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <EditableText
                      value={footerInfo.description}
                      onChange={(value) => updateFooterInfo('description', value)}
                      storageKey="footer-description"
                      multiline
                    />
                  </p>
                )}
              </div>
            )}

            {/* 빠른 링크 */}
            {footerInfo.showQuickLinks && navItems.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">
                  <EditableText
                    value={footerInfo.quickLinksTitle}
                    onChange={(value) => updateFooterInfo('quickLinksTitle', value)}
                    storageKey="footer-quicklinks-title"
                  />
                </h4>
                <div className="flex flex-col space-y-2">
                  {navItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const element = document.querySelector(item.url)
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" })
                        }
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 연락처 정보 */}
            {footerInfo.showContactInfo && (footerInfo.phone || footerInfo.email || footerInfo.location) && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">
                  <EditableText
                    value={footerInfo.contactTitle}
                    onChange={(value) => updateFooterInfo('contactTitle', value)}
                    storageKey="footer-contact-title"
                  />
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {footerInfo.phone && (
                    <p>
                      <EditableText
                        value={footerInfo.phone}
                        onChange={(value) => updateFooterInfo('phone', value)}
                        storageKey="footer-phone"
                      />
                    </p>
                  )}
                  {footerInfo.email && (
                    <p>
                      <EditableText
                        value={footerInfo.email}
                        onChange={(value) => updateFooterInfo('email', value)}
                        storageKey="footer-email"
                      />
                    </p>
                  )}
                  {footerInfo.location && (
                    <p>
                      <EditableText
                        value={footerInfo.location}
                        onChange={(value) => updateFooterInfo('location', value)}
                        storageKey="footer-location"
                      />
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 하단 카피라이트 */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {isEditMode ? (
              <EditableText
                value={footerInfo.copyright || `© ${currentYear} ${footerInfo.name || 'Portfolio'}. All rights reserved.`}
                onChange={(value) => updateFooterInfo('copyright', value)}
                storageKey="footer-copyright"
              />
            ) : (
              <p>{footerInfo.copyright || `© ${currentYear} ${footerInfo.name || 'Portfolio'}. All rights reserved.`}</p>
            )}
          </div>
          
          {/* Made with 메시지 & 템플릿 크레딧 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {footerInfo.showMadeWith && (
              <span className="flex items-center">
                Made with <Heart className="h-3 w-3 mx-1 text-red-500" />
                {footerInfo.madeWithLocation && `in ${footerInfo.madeWithLocation}`}
              </span>
            )}
            
            {/* 템플릿 제작자 크레딧 (편집 불가) */}
            {footerInfo.showTemplateCredit && footerInfo.templateCreator && (
              <>
                {footerInfo.showMadeWith && <span className="text-muted-foreground/50">•</span>}
                <span className="text-xs text-muted-foreground/70">Template by Mrbaeksang</span>
                <div className="flex items-center gap-1">
                  <a 
                    href={`mailto:${footerInfo.templateCreator.email}`}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground" />
                  </a>
                  <a 
                    href={footerInfo.templateCreator.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground" />
                  </a>
                  <a 
                    href={footerInfo.templateCreator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors"
                    aria-label="DevCom"
                  >
                    <Globe className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground" />
                  </a>
                </div>
              </>
            )}
          </div>

          {/* 맨 위로 버튼 */}
          {footerInfo.showScrollTop && (
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="맨 위로"
            >
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
