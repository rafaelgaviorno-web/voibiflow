import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Trash2, X } from 'lucide-react'
import { ExecutionLog } from '../types/workflow'

interface ExecutionLogsProps {
  logs: ExecutionLog[]
  onClear: () => void
  onClose: () => void
}

export function ExecutionLogs({ logs, onClear, onClose }: ExecutionLogsProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Histórico de Execuções</h3>
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button onClick={onClear} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className={`p-4 rounded-xl border ${log.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : log.status === 'error' ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${log.status === 'success' ? 'text-emerald-400' : log.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                  {log.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : log.status === 'error' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-pulse" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{log.workflowName}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(log.triggeredAt)}</p>
                  {log.responseTime && <p className="text-xs text-slate-500 mt-1">Tempo de resposta: {log.responseTime}ms</p>}
                  {log.errorMessage && <p className="text-xs text-red-400 mt-2 break-all">{log.errorMessage}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma execução ainda</p>
            <p className="text-xs mt-1">Dispare um fluxo para ver o histórico</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
