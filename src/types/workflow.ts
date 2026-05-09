export interface Workflow {
  id: string
  name: string
  description: string
  webhookUrl: string
  icon: string
  color: string
  isActive: boolean
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
}

export interface ExecutionLog {
  id: string
  workflowId: string
  workflowName: string
  status: 'success' | 'error' | 'pending'
  triggeredAt: Date
  responseTime?: number
  errorMessage?: string
}

export type WorkflowColor = 'cyan' | 'purple' | 'green' | 'orange' | 'pink' | 'blue' | 'red' | 'yellow'

export const colorClasses: Record<WorkflowColor, { bg: string; border: string; text: string; glow: string }> = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', glow: 'shadow-pink-500/20' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
}

export const workflowIcons = [
  'Zap', 'Send', 'Mail', 'MessageSquare', 'FileText', 'Database', 'Globe', 'Code',
  'Settings', 'Users', 'ShoppingCart', 'Calendar', 'Image', 'Video', 'Music',
  'Cloud', 'Download', 'Upload', 'Bell', 'Search',
]
