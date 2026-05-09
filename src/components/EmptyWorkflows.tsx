import { motion } from 'framer-motion'
import { Workflow, Plus, Zap, Globe, Settings } from 'lucide-react'

interface EmptyWorkflowsProps {
  onAddClick: () => void
}

export function EmptyWorkflows({ onAddClick }: EmptyWorkflowsProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }} className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
          <Workflow className="w-12 h-12 text-white" />
        </div>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 blur-xl -z-10" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-4xl font-bold text-center mb-3">
        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">VoibiFlow</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-slate-400 text-center mb-8 max-w-md">
        Conecte seus fluxos n8n e dispare-os com um clique. Simples, rápido e intuitivo.
      </motion.p>

      <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAddClick}
        className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
        <Plus className="w-5 h-5" />
        Adicionar Primeiro Fluxo
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
            <Globe className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="font-medium text-white mb-1">1. Copie o Webhook</h3>
          <p className="text-xs text-slate-500">Pegue a URL do webhook no seu fluxo n8n</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
            <Settings className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="font-medium text-white mb-1">2. Configure o Fluxo</h3>
          <p className="text-xs text-slate-500">Cole a URL e personalize o nome</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="font-medium text-white mb-1">3. Dispare!</h3>
          <p className="text-xs text-slate-500">Clique no botão e execute seu fluxo</p>
        </div>
      </motion.div>
    </div>
  )
}
