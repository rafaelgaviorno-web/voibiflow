import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Send, Mail, MessageSquare, FileText, Database, Globe, Code, Settings, Users, ShoppingCart, Calendar, Image, Video, Music, Cloud, Download, Upload, Bell, Search, Play, Clock, MoreVertical, Edit, Trash2, Power, PowerOff } from 'lucide-react'
import { Workflow, colorClasses, WorkflowColor } from '../types/workflow'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Send, Mail, MessageSquare, FileText, Database, Globe, Code, Settings, Users, ShoppingCart, Calendar, Image, Video, Music, Cloud, Download, Upload, Bell, Search,
}

interface WorkflowCardProps {
  workflow: Workflow
  isTriggering: boolean
  onTrigger: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}

export function WorkflowCard({ workflow, isTriggering, onTrigger, onEdit, onDelete, onToggleActive }: WorkflowCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const IconComponent = iconMap[workflow.icon] || Zap
  const colors = colorClasses[workflow.color as WorkflowColor] || colorClasses.cyan

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false)
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const formatLastTriggered = (date?: Date) => {
    if (!date) return 'Nunca'
    const d = new Date(date), now = new Date(), diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      className={`relative rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl ${colors.glow}`}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2">
          <IconComponent className="w-full h-full" />
        </div>
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{workflow.name}</h3>
              <p className="text-xs text-slate-400 truncate max-w-[180px]">{workflow.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${workflow.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
              {workflow.isActive ? (
                <><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Ativo</>
              ) : (
                <><PowerOff className="w-3 h-3" />Inativo</>
              )}
            </div>

            <div className="relative" ref={menuRef}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <MoreVertical className="w-4 h-4" />
              </motion.button>
              
              {showMenu && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-44 py-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10">
                  <button onClick={() => { setShowMenu(false); onEdit() }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />Editar
                  </button>
                  <button onClick={() => { setShowMenu(false); onToggleActive() }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <Power className="w-4 h-4" />{workflow.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <div className="border-t border-slate-700 my-1" />
                  <button onClick={() => { setShowMenu(false); onDelete() }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />Excluir
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatLastTriggered(workflow.lastTriggered)}</div>
          <div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{workflow.triggerCount} execuções</div>
        </div>

        <motion.button onClick={onTrigger} disabled={isTriggering || !workflow.isActive}
          whileHover={{ scale: workflow.isActive && !isTriggering ? 1.02 : 1 }} whileTap={{ scale: workflow.isActive && !isTriggering ? 0.98 : 1 }}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-base transition-all duration-300 ${workflow.isActive
            ? isTriggering ? 'bg-slate-700 text-slate-400 cursor-wait'
              : `bg-gradient-to-r ${workflow.color === 'cyan' ? 'from-cyan-500 to-cyan-600' : workflow.color === 'purple' ? 'from-purple-500 to-purple-600' : workflow.color === 'green' ? 'from-emerald-500 to-emerald-600' : workflow.color === 'orange' ? 'from-orange-500 to-orange-600' : workflow.color === 'pink' ? 'from-pink-500 to-pink-600' : workflow.color === 'blue' ? 'from-blue-500 to-blue-600' : workflow.color === 'red' ? 'from-red-500 to-red-600' : 'from-yellow-500 to-yellow-600'} text-white shadow-lg hover:shadow-xl`
            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'}`}>
          {isTriggering ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full" />Disparando...</>
          ) : (
            <><Play className="w-5 h-5" fill="currentColor" />Disparar Fluxo</>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
