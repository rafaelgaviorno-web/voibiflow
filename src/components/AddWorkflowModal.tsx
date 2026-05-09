import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Zap, Send, Mail, MessageSquare, FileText, Database, Globe, Code, Settings,
  Users, ShoppingCart, Calendar, Image, Video, Music, Cloud, Download, Upload,
  Bell, Search, Check, HelpCircle, AlertTriangle
} from 'lucide-react'
import { Workflow, workflowIcons, WorkflowColor, colorClasses } from '../types/workflow'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Send, Mail, MessageSquare, FileText, Database, Globe, Code, Settings, Users,
  ShoppingCart, Calendar, Image, Video, Music, Cloud, Download, Upload, Bell, Search,
}

const colorOptions: WorkflowColor[] = ['cyan', 'purple', 'green', 'orange', 'pink', 'blue', 'red', 'yellow']

interface AddWorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'triggerCount' | 'isActive'>) => Promise<any> | any
  editWorkflow?: Workflow | null
  onUpdate?: (id: string, updates: Partial<Workflow>) => Promise<any> | any
}

export function AddWorkflowModal({ isOpen, onClose, onAdd, editWorkflow, onUpdate }: AddWorkflowModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900">
                <h2 className="text-xl font-semibold text-white">{editWorkflow ? 'Editar Fluxo' : 'Novo Fluxo n8n'}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    abel className="block text-sm font-medium text-slate-300 mb-2">Nome do Fluxo *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Enviar Relatório Diário"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    abel className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Envia relatório por email todo dia 9h"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    abel className="block text-sm font-medium text-slate-300 mb-2">URL do Webhook n8n *</label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://seu-n8n.com/webhook/abc123"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono text-sm"
                      required
                    />
                    <div className="mt-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-400 space-y-2">
                          <p className="font-medium text-slate-300">Como configurar no n8n:</p>
                          <ol className="list-decimal list-inside space-y-1-1">
                            >Adicione um node <span className="text-cyan-400">Webhook</span> ao seu fluxo</l/li>
                            >Em <span className="text-cyan-400">HTTP Method</span>, selecione <span className="text-emerald-400">POST</span></l/li>
                            >Copie a <span className="text-cyan-400">Production URL</span></l/li>
                            >Cole a URL no campo acima</li>
                          </ol>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-400/80">
                            <span className="font-medium">Dica:</span> Se seu n8n estiver em um servidor com HTTPS, o disparo funcionará automaticamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    abel className="block text-sm font-medium text-slate-300 mb-2">Ícone</label>
                    <div className="grid grid-cols-10 gap-2">
                      {workflowIcons.map((iconName) => {
                        const IconComp = iconMap[iconName]
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setIcon(iconName)}
                            className={`p-2.5 rounded-lg border transition-all ${
                              icon === iconName
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    abel className="block text-sm font-medium text-slate-300 mb-2">Cor</label>
                    <div className="flex gap-2">
                      {colorOptions.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            color === c ? `border-white scale-110 ${colorClasses[c].bg}` : `border-transparent ${colorClasses[c].bg} hover:scale-105`
                          }`}
                        >
                          <div className={`w-full h-full rounded-md ${c === 'cyan' ? 'bg-cyan-500' : c === 'purple' ? 'bg-purple-500' : c === 'green' ? 'bg-emerald-500' : c === 'orange' ? 'bg-orange-500' : c === 'pink' ? 'bg-pink-500' : c === 'blue' ? 'bg-blue-500' : c === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={!name.trim() || !webhookUrl.trim() || isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-base transition-all ${
                      showSuccess
                        ? 'bg-emerald-500 text-white'
                        : name.trim() && webhookUrl.trim() && !isSubmitting
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {showSuccess ? (
                      <>
                        <Check className="w-5 h-5" />
                        Salvo!
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        {isSubmitting ? 'Salvando...' : editWorkflow ? 'Salvar Alterações' : 'Criar Fluxo'}
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
