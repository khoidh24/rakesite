import { DollarSign, Home, Layers2, ShieldCheck } from 'lucide-react'

export const ROUTES = [
  {
    href: '',
    labelKey: 'home' as const,
    icon: Home,
  },
  {
    href: 'workflows',
    labelKey: 'workflows' as const,
    icon: Layers2,
  },
  {
    href: 'credentials',
    labelKey: 'credentials' as const,
    icon: ShieldCheck,
  },
  {
    href: 'billing',
    labelKey: 'billing' as const,
    icon: DollarSign,
  },
]

export type RouteLabelKey = (typeof ROUTES)[number]['labelKey']
