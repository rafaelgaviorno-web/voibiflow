import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, History, Zap, Menu, X, Workflow as WorkflowIcon, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { WorkflowCard } from './components/WorkflowCard'
import { AddWorkflowModal } from './components/AddWorkflowModal'
import { ExecutionLogs } from './components/ExecutionLogs'
import { EmptyWorkflows } from './components/EmptyWorkflows'
import { LoginPage } from './pages/LoginPage'
import { LoadingScreen } from './components/LoadingScreen'
import { useWorkflows } from './hooks/useWorkflows'
import { Workflow } from './types/workflow'

function AppContent() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  
  if (authLoading) {
    return <LoadingScreen />
  }
  
  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <Dashboard user={user!} onLogout={logout} />
}

interface DashboardProps {
  user: { name: string; email: string }
  onLogout: () => void
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const {
    workflows,
    executionLogs,
    triggeringWorkflowId,
    isLoading,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    triggerWorkflow,
    toggleWorkflowActive,
    clearLogs,
  } = useWorkflows()

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingWorkflow(null)
  }

  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.isActive).length,
    totalTriggers: workflows.reduce((acc, w) => acc + w.triggerCount, 0),
    successRate: executionLogs.length > 0 
      ? Math.round((executionLogs.filter(l => l.status === 'success').length / executionLogs.length) * 100)
      : 0,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative flex flex-col h-screen">
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl z-40">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <WorkflowIcon className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">VoibiFlow</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Dispare seus fluxos n8n com um clique</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4 mr-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">{stats.active} ativos</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">{stats.totalTriggers} execuções</span>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowLogs(!showLogs)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showLogs ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'}`}>
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
              {executionLogs.length > 0 && <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center">{executionLogs.length}</span>}
            </motion.button>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Fluxo</span>
            </motion.button>

            <div className="relative">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden md:inline text-sm text-slate-300">{user.name}</span>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <button onClick={() => { setShowUserMenu(false); onLogout(); }} className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
            </div>
          ) : workflows.length === 0 ? (
            <EmptyWorkflows onAddClick={() => setShowAddModal(true)} />
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Meus Fluxos</h2>
                  <p className="text-sm text-slate-500">{workflows.length} fluxo{workflows.length !== 1 && 's'} configurado{workflows.length !== 1 && 's'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {workflows.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} isTriggering={triggeringWorkflowId === workflow.id} onTrigger={() => triggerWorkflow(workflow)} onEdit={() => handleEdit(workflow)} onDelete={() => deleteWorkflow(workflow.id)} onToggleActive={() => toggleWorkflowActive(workflow.id)} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </main>
      </div>

      <AddWorkflowModal isOpen={showAddModal} onClose={handleCloseModal} onAdd={addWorkflow} editWorkflow={editingWorkflow} onUpdate={updateWorkflow} />
      
      <AnimatePresence>
        {showLogs && <ExecutionLogs logs={executionLogs} onClear={clearLogs} onClose={() => setShowLogs(false)} />}
      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
