import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Zap,
  Send,
  Mail,
  MessageSquare,
  FileText,
  Database,
  Globe,
  Code,
  Settings,
  Users,
  ShoppingCart,
  Calendar,
  Image,
  Video,
  Music,
  Cloud,
  Download,
  Upload,
  Bell,
  Search,
  Check,
} from 'lucide-react'
import { Workflow, workflowIcons, WorkflowColor, colorClasses } from '../types/workflow'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Send,
  Mail,
  MessageSquare,
  FileText,
  Database,
  Globe,
  Code,
  Settings,
  Users,
  ShoppingCart,
  Calendar,
  Image,
  Video,
  Music,
  Cloud,
  Download,
  Upload,
  Bell,
  Search,
}

const colorOptions: WorkflowColor[] = ['cyan', 'purple', 'green', 'orange', 'pink', 'blue', 'red', 'yellow']

interface AddWorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'triggerCount' | 'isActive'>) => Promise<any> | any
  editWorkflow?: Workflow | null
  onUpdate?: (id: string, updates: Partial<Workflow>) => Promise<any> | any
}

export function AddWorkflowModal({
  isOpen,
  onClose,
  onAdd,
  editWorkflow,
  onUpdate,
}: AddWorkflowModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [icon, setIcon] = useState('Zap')
  const [color, setColor] = useState<WorkflowColor>('cyan')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editWorkflow) {
      setName(editWorkflow.name)
      setDescription(editWorkflow.description)
      setWebhookUrl(editWorkflow.webhookUrl)
      setIcon(editWorkflow.icon)
      setColor(editWorkflow.color as WorkflowColor)
    } else {
      setName('')
      setDescription('')
      setWebhookUrl('')
      setIcon('Zap')
      setColor('cyan')
    }
  }, [editWorkflow, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name.trim() || !webhookUrl.trim()) return

    setIsSubmitting(true)

    try {
      if (editWorkflow && onUpdate) {
        await onUpdate(editWorkflow.id, {
          name: name.trim(),
          description: description.trim(),
          webhookUrl: webhookUrl.trim(),
          icon,
          color,
        })
      } else {
        const result = await onAdd({
          name: name.trim(),
          description: description.trim(),
          webhookUrl: webhookUrl.trim(),
          icon,
          color,
        })

        if (!result) {
          setIsSubmitting(false)
          return
        }
      }

      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 800)
    } catch (error) {
      console.error('Erro ao salvar fluxo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                {editWorkflow ? 'Editar Fluxo' : 'Novo Fluxo n8n'}
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Nome do Fluxo *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Enviar Relatório Diário"
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Envia relatório por email todo dia 9h"
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    URL do Webhook n8n *
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://seu-n8n.com/webhook/abc123"
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />

                  <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-xs text-slate-400">
                    <p className="mb-2 font-medium text-slate-300">Como configurar no n8n:</p>
                    <p>1. Adicione um node Webhook ao seu fluxo.</p>
                    <p>2. Em HTTP Method, selecione POST.</p>
                    <p>3. Copie a Production URL.</p>
                    <p>4. Cole a URL no campo acima.</p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Ícone
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {workflowIcons.map((iconName) => {
                      const IconComp = iconMap[iconName]

                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setIcon(iconName)}
                          className={`rounded-lg border p-2.5 transition-all ${
                            icon === iconName
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Cor
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-8 w-8 rounded-lg border-2 transition-all ${
                          color === c
                            ? `scale-110 border-white ${colorClasses[c].bg}`
                            : `border-transparent ${colorClasses[c].bg} hover:scale-105`
                        }`}
                      >
                        <div
                          className={`h-full w-full rounded-md ${
                            c === 'cyan'
                              ? 'bg-cyan-500'
                              : c === 'purple'
                                ? 'bg-purple-500'
                                : c === 'green'
                                  ? 'bg-emerald-500'
                                  : c === 'orange'
                                    ? 'bg-orange-500'
                                    : c === 'pink'
                                      ? 'bg-pink-500'
                                      : c === 'blue'
                                        ? 'bg-blue-500'
                                        : c === 'red'
                                          ? 'bg-red-500'
                                          : 'bg-yellow-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={!name.trim() || !webhookUrl.trim() || isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-medium transition-all ${
                    showSuccess
                      ? 'bg-emerald-500 text-white'
                      : name.trim() && webhookUrl.trim() && !isSubmitting
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                        : 'cursor-not-allowed bg-slate-700 text-slate-400'
                  }`}
                >
                  {showSuccess ? (
                    <>
                      <Check className="h-5 w-5" />
                      Salvo!
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      {isSubmitting ? 'Salvando...' : editWorkflow ? 'Salvar Alterações' : 'Criar Fluxo'}
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  )
}
