'use client'

import { HeroUIProvider } from "@heroui/react"



export function ProviderNextUI({ children }: { children: React.ReactNode }) {
    return <HeroUIProvider>{children}  </HeroUIProvider>

} 