import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Workflow, ExecutionLog } from '../types/workflow'

export function useWorkflows() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [triggeringWorkflowId, setTriggeringWorkflowId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mapWorkflowFromDb = (dbWorkflow: any): Workflow => ({
    id: dbWorkflow.id,
    name: dbWorkflow.name,
    description: dbWorkflow.description || '',
    webhookUrl: dbWorkflow.webhook_url,
    icon: dbWorkflow.icon,
    color: dbWorkflow.color,
    isActive: dbWorkflow.is_active,
    triggerCount: dbWorkflow.trigger_count,
    lastTriggered: dbWorkflow.last_triggered_at ? new Date(dbWorkflow.last_triggered_at) : undefined,
    createdAt: new Date(dbWorkflow.created_at),
  })

  const mapLogFromDb = (dbLog: any): ExecutionLog => ({
    id: dbLog.id,
    workflowId: dbLog.workflow_id,
    workflowName: dbLog.workflow_name,
    status: dbLog.status,
    responseTime: dbLog.response_time,
    errorMessage: dbLog.error_message,
    triggeredAt: new Date(dbLog.triggered_at),
  })

  const loadData = useCallback(async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (workflowsError) throw workflowsError

      const { data: logsData, error: logsError } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('triggered_at', { ascending: false })
        .limit(100)

      if (logsError) throw logsError

      setWorkflows((workflowsData || []).map(mapWorkflowFromDb))
      setExecutionLogs((logsData || []).map(mapLogFromDb))
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showToast('error', 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    if (!user) {
      setWorkflows([])
      setExecutionLogs([])
      setIsLoading(false)
      return
    }

    loadData()
  }, [user, loadData])

  const addWorkflow = useCallback(async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'triggerCount' | 'isActive'>): Promise<void> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    const payload = {
      user_id: user.id,
      name: workflow.name,
      description: workflow.description,
      webhook_url: workflow.webhookUrl,
      icon: workflow.icon,
      color: workflow.color,
    }

    console.log('Criando workflow:', payload)

    const { error } = await supabase
      .from('workflows')
      .insert(payload)

    if (error) {
      console.error('Erro Supabase ao criar workflow:', error)
      showToast('error', 'Erro ao criar fluxo', error.message)
      throw error
    }

    await loadData()
    showToast('success', 'Fluxo criado com sucesso!')
  }, [user, showToast, loadData])

  const updateWorkflow = useCallback(async (id: string, updates: Partial<Workflow>): Promise<void> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado')
    }

    const dbUpdates: any = {}

    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.webhookUrl !== undefined) dbUpdates.webhook_url = updates.webhookUrl
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon
    if (updates.color !== undefined) dbUpdates.color = updates.color
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    const { error } = await supabase
      .from('workflows')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao atualizar workflow:', error)
      showToast('error', 'Erro ao atualizar fluxo', error.message)
      throw error
    }

    setWorkflows(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)))
    showToast('success', 'Fluxo atualizado!')
  }, [user, showToast])

  const deleteWorkflow = useCallback(async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setWorkflows(prev => prev.filter(w => w.id !== id))
      setExecutionLogs(prev => prev.filter(log => log.workflowId !== id))
      showToast('success', 'Fluxo excluído!')
    } catch (error) {
      console.error('Erro ao excluir fluxo:', error)
      showToast('error', 'Erro ao excluir fluxo')
    }
  }, [user, showToast])

  const triggerWorkflow = useCallback(async (workflow: Workflow) => {
    if (!user) return false

    setTriggeringWorkflowId(workflow.id)
    const startTime = Date.now()

    let log: ExecutionLog = {
      id: '',
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'pending',
      triggeredAt: new Date(),
    }

    const payload = {
      triggeredFrom: 'VoibiFlow App',
      timestamp: new Date().toISOString(),
      workflowId: workflow.id,
      workflowName: workflow.name,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    }

    try {
      let response: Response
      let usedNoCors = false

      try {
        response = await fetch(workflow.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (corsError) {
        response = await fetch(workflow.webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        usedNoCors = true
      }

      const responseTime = Date.now() - startTime

      if (usedNoCors || response.type === 'opaque') {
        log.status = 'success'
        log.responseTime = responseTime
        showToast('success', 'Fluxo disparado!', 'A requisição foi enviada para o n8n')
      } else if (response.ok) {
        log.status = 'success'
        log.responseTime = responseTime
        showToast('success', 'Fluxo disparado com sucesso!', `Resposta em ${responseTime}ms`)
      } else {
        log.status = 'error'
        log.errorMessage = `HTTP ${response.status}: ${response.statusText}`
        showToast('error', 'Erro ao disparar fluxo', log.errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      log.status = 'error'
      log.errorMessage = errorMessage
      showToast('error', 'Erro ao disparar fluxo', errorMessage)
    }

    try {
      const { data, error } = await supabase
        .from('execution_logs')
        .insert({
          user_id: user.id,
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          status: log.status,
          response_time: log.responseTime,
          error_message: log.errorMessage,
        })
        .select()
        .single()

      if (!error && data) {
        log.id = data.id
        setExecutionLogs(prev => [log, ...prev].slice(0, 100))
      }
    } catch (error) {
      console.error('Erro ao salvar log:', error)
    }

    if (log.status === 'success') {
      await supabase
        .from('workflows')
        .update({
          trigger_count: workflow.triggerCount + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', workflow.id)

      setWorkflows(prev =>
        prev.map(w =>
          w.id === workflow.id
            ? { ...w, triggerCount: w.triggerCount + 1, lastTriggered: new Date() }
            : w
        )
      )
    }

    setTriggeringWorkflowId(null)
    return log.status === 'success'
  }, [user, showToast])

  const toggleWorkflowActive = useCallback(async (id: string) => {
    const workflow = workflows.find(w => w.id === id)
    if (!workflow) return
    await updateWorkflow(id, { isActive: !workflow.isActive })
  }, [workflows, updateWorkflow])

  const clearLogs = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('execution_logs')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setExecutionLogs([])
      showToast('success', 'Histórico limpo!')
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
      showToast('error', 'Erro ao limpar histórico')
    }
  }, [user, showToast])

  return {
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
    refreshData: loadData,
  }
}
