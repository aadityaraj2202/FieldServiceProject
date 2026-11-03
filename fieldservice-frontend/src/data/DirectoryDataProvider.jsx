import { useCallback, useEffect, useState } from 'react'
import { api, clearAuthToken, setAuthToken } from '../services/api.js'
import { DirectoryDataContext } from './directoryDataContext.js'

const STATUS_LABELS = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  CLOSED: 'Closed',
}

const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

function asString(value) {
  return value === null || value === undefined ? '' : String(value)
}

function getStatusLabel(value) {
  if (!value) return 'New'
  const normalized = String(value).trim()
  return STATUS_LABELS[normalized.toUpperCase().replace(/\s+/g, '_')] || normalized
}

function getPriorityLabel(value) {
  if (!value) return 'Medium'
  const normalized = String(value).trim()
  return PRIORITY_LABELS[normalized.toUpperCase().replace(/\s+/g, '_')] || normalized
}

function normalizeCustomer(customer) {
  return {
    ...customer,
    id: asString(customer.id),
    customerId: asString(customer.customerId),
    active: Boolean(customer.active),
  }
}

function normalizeSite(site) {
  return {
    ...site,
    id: asString(site.id),
    customerId: asString(site.customerId),
    active: Boolean(site.active),
  }
}

function normalizeTechnician(technician) {
  return {
    ...technician,
    id: asString(technician.id),
    userId: asString(technician.userId),
    skills: Array.isArray(technician.skills) ? technician.skills : [],
    availability: technician.availability || 'Available',
    active: Boolean(technician.active),
  }
}

function normalizeWorkOrder(workOrder, customers, sites, technicians) {
  const normalizedId = asString(workOrder.id)
  const customerId = asString(workOrder.customerId)
  const siteId = asString(workOrder.siteId)
  const assignedTechnicianId = workOrder.assignedTechnicianId ? asString(workOrder.assignedTechnicianId) : ''
  const status = getStatusLabel(workOrder.status)
  const priority = getPriorityLabel(workOrder.priority)
  const customer = customers.find((item) => item.id === customerId)
  const site = sites.find((item) => item.id === siteId)
  const assignedTechnician = technicians.find((item) => item.id === assignedTechnicianId)

  return {
    ...workOrder,
    id: normalizedId,
    customerId,
    siteId,
    assignedTechnicianId,
    customer: customer?.organization ?? 'Unknown customer',
    site: site?.siteName ?? 'Unknown site',
    assignedTechnician: assignedTechnician?.fullName ?? '',
    status,
    priority,
    scheduledDate: workOrder.scheduledDate || '',
    history: Array.isArray(workOrder.history) && workOrder.history.length > 0
      ? workOrder.history.map((entry) => ({
          ...entry,
          status: getStatusLabel(entry.status),
        }))
      : [{
          status,
          changedAt: workOrder.updatedAt || workOrder.createdAt || new Date().toISOString(),
          note: 'Work order synced from backend',
        }],
    timeLogs: Array.isArray(workOrder.timeLogs) ? workOrder.timeLogs : [],
    partsUsed: Array.isArray(workOrder.partsUsed)
      ? workOrder.partsUsed.map((partUsage) => ({
          ...partUsage,
          name: partUsage.name ?? partUsage.partName ?? '',
        }))
      : [],
    attachments: Array.isArray(workOrder.attachments) ? workOrder.attachments : [],
    completionNote: workOrder.completionNote ?? '',
  }
}

function normalizeWorkOrderPayload(values) {
  const payload = {
    title: values.title,
    description: values.description,
    customerId: Number(values.customerId ?? values.customer),
    siteId: Number(values.siteId ?? values.site),
    serviceType: values.serviceType,
    priority: String(values.priority || 'MEDIUM').toUpperCase().replace(/\s+/g, '_'),
    status: String(values.status || 'NEW').toUpperCase().replace(/\s+/g, '_'),
    scheduledDate: values.scheduledDate || null,
  }

  return payload
}

function getCurrentToken() {
  return localStorage.getItem('keystone-token') || ''
}

function DirectoryDataProvider({ children }) {
  const [customers, setCustomers] = useState([])
  const [sites, setSites] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [users, setUsers] = useState([])
  const [workOrders, setWorkOrders] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getCurrentToken()))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dataLoadStatus, setDataLoadStatus] = useState('idle')

  const refreshAllRecords = useCallback(async () => {
    if (!getCurrentToken()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setDataLoadStatus('loading')

    try {
      const [customersResponse, sitesResponse, techniciansResponse, workOrdersResponse] = await Promise.all([
        api.get('/api/customers'),
        api.get('/api/sites'),
        api.get('/api/technicians'),
        api.get('/api/work-orders'),
      ])

      const normalizedCustomers = (customersResponse || []).map(normalizeCustomer)
      const normalizedSites = (sitesResponse || []).map(normalizeSite)
      const normalizedTechnicians = (techniciansResponse || []).map(normalizeTechnician)
      const normalizedWorkOrders = await Promise.all((workOrdersResponse || []).map(async (workOrder) => {
        const [timeLogs, partsUsed] = await Promise.all([
          api.get(`/api/work-orders/${workOrder.id}/time-logs`),
          api.get(`/api/work-orders/${workOrder.id}/part-usages`),
        ])

        return normalizeWorkOrder({ ...workOrder, timeLogs, partsUsed }, normalizedCustomers, normalizedSites, normalizedTechnicians)
      }))

      setCustomers(normalizedCustomers)
      setSites(normalizedSites)
      setTechnicians(normalizedTechnicians)
      setWorkOrders(normalizedWorkOrders)
      setDataLoadStatus('ready')
    } catch (requestError) {
      setError(requestError.message)
      setDataLoadStatus('error')
      if (!getCurrentToken()) {
        setIsAuthenticated(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void refreshAllRecords()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [isAuthenticated, refreshAllRecords])

  async function login(values) {
    const response = await api.post('/api/user_auth/login', {
      userEmail: values.userEmail,
      password: values.password,
    })

    const token = response?.token
    if (!token) {
      throw new Error('Login succeeded but no token was returned.')
    }

    setAuthToken(token)
    setIsAuthenticated(true)
    await refreshAllRecords()
    return response
  }

  async function register(values) {
    return api.post('/api/user_auth/register', {
      userName: values.userName,
      userEmail: values.userEmail,
      password: values.password,
      phone: values.phone,
    }, { requireAuth: false })
  }

  async function logout() {
    try {
      await api.post('/api/user_auth/logout', null)
    } catch (requestError) {
      console.warn('Logout request failed:', requestError.message)
    }

    clearAuthToken()
    setCustomers([])
    setSites([])
    setTechnicians([])
    setUsers([])
    setWorkOrders([])
    setDataLoadStatus('idle')
    setIsAuthenticated(false)
  }

  async function updateCustomer(customerId, values) {
    const nextValues = { ...values }
    try {
      const updatedCustomer = await api.put(`/api/customers/${customerId}`, nextValues)
      await refreshAllRecords()
      return normalizeCustomer(updatedCustomer).id
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  async function createCustomer(values) {
    const payload = {
      organization: values.organization,
      contactName: values.contactName,
      email: values.email,
      phone: values.phone,
      address: values.address,
      active: true,
    }

    try {
      const createdCustomer = await api.post('/api/customers', payload)
      setCustomers((currentCustomers) => [...currentCustomers, normalizeCustomer(createdCustomer)])
      await refreshAllRecords()
      return normalizeCustomer(createdCustomer).id
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  async function createSite(values) {
    const payload = {
      customerId: Number(values.customerId),
      siteName: values.siteName,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || '',
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country || 'India',
      contactName: values.contactName,
      contactPhone: values.contactPhone,
      accessNotes: values.accessNotes || '',
      active: true,
    }

    try {
      const createdSite = await api.post('/api/sites', payload)
      setSites((currentSites) => [...currentSites, normalizeSite(createdSite)])
      await refreshAllRecords()
      return normalizeSite(createdSite).id
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  async function updateSite(siteId, values) {
    const nextValues = {
      customerId: Number(values.customerId),
      siteName: values.siteName,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || '',
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country || 'India',
      contactName: values.contactName,
      contactPhone: values.contactPhone,
      accessNotes: values.accessNotes || '',
      active: true,
    }

    try {
      const updatedSite = await api.put(`/api/sites/${siteId}`, nextValues)
      await refreshAllRecords()
      return normalizeSite(updatedSite).id
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  async function createTechnician(values) {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      skills: Array.isArray(values.skills) ? values.skills : [values.skills].filter(Boolean),
      availability: values.availability || 'Available',
      active: true,
    }

    try {
      const createdTechnician = await api.post('/api/technicians', payload)
      setTechnicians((currentTechnicians) => [...currentTechnicians, normalizeTechnician(createdTechnician)])
      await refreshAllRecords()
      return normalizeTechnician(createdTechnician).id
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  async function updateTechnician(technicianId, values) {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      skills: Array.isArray(values.skills) ? values.skills : [values.skills].filter(Boolean),
      availability: values.availability || 'Available',
      active: true,
    }

    try {
      const updatedTechnician = await api.put(`/api/technicians/${technicianId}`, payload)
      await refreshAllRecords()
      return normalizeTechnician(updatedTechnician).id
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  function createUser(values) {
    const nextId = `USR-${Date.now()}`
    setUsers((currentUsers) => [...currentUsers, { ...values, id: nextId }])
    return nextId
  }

  function updateUser(userId, values) {
    setUsers((currentUsers) => currentUsers.map((user) => (
      user.id === userId ? { ...user, ...values } : user
    )))
  }

  async function createWorkOrder(values) {
    const payload = normalizeWorkOrderPayload(values)

    const technologyId = values.assignedTechnicianId ? Number(values.assignedTechnicianId) : null

    try {
      const createdWorkOrder = await api.post('/api/work-orders', payload)
      if (technologyId) {
        await api.put(`/api/work-orders/${createdWorkOrder.id}/assign-technician`, { technicianId: technologyId })
      }
      await refreshAllRecords()
      return normalizeWorkOrder(createdWorkOrder, customers, sites, technicians).id
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  async function updateWorkOrder(workOrderId, changes) {
    const currentWorkOrder = workOrders.find((item) => item.id === workOrderId)

    if (!currentWorkOrder || !changes) {
      return false
    }

    const assignmentChanged = Object.prototype.hasOwnProperty.call(changes, 'assignedTechnicianId')
      && changes.assignedTechnicianId !== currentWorkOrder?.assignedTechnicianId
    const technician = technicians.find((item) => item.id === asString(changes.assignedTechnicianId))

    if (assignmentChanged && changes.assignedTechnicianId && technician?.availability !== 'Available') {
      return false
    }

    const nextWorkOrders = workOrders.map((item) => {
      if (item.id !== workOrderId) {
        return item
      }

      const nextItem = {
        ...item,
        ...changes,
        customerId: asString(changes.customerId ?? item.customerId),
        siteId: asString(changes.siteId ?? item.siteId),
        assignedTechnicianId: changes.assignedTechnicianId ? asString(changes.assignedTechnicianId) : item.assignedTechnicianId,
        status: changes.status ? getStatusLabel(changes.status) : item.status,
        priority: changes.priority ? getPriorityLabel(changes.priority) : item.priority,
        history: changes.status && changes.status !== item.status
          ? [
              ...item.history,
              { status: getStatusLabel(changes.status), changedAt: new Date().toISOString(), note: 'Status updated via workflow' },
            ]
          : item.history,
      }

      if (changes.assignedTechnicianId) {
        const assigned = technicians.find((entry) => entry.id === asString(changes.assignedTechnicianId))
        nextItem.assignedTechnician = assigned?.fullName ?? ''
      }

      return nextItem
    })

    setWorkOrders(nextWorkOrders)

    const requests = []

    if (Object.prototype.hasOwnProperty.call(changes, 'status') && changes.status !== currentWorkOrder.status) {
      requests.push(api.put(`/api/work-orders/${workOrderId}/status`, { status: String(changes.status).toUpperCase().replace(/\s+/g, '_') }))
    }

    if (assignmentChanged) {
      requests.push(api.put(`/api/work-orders/${workOrderId}/assign-technician`, { technicianId: Number(changes.assignedTechnicianId) }))
    }

    if (changes?.timeLogs) {
      const currentTimeLogs = currentWorkOrder?.timeLogs || []
      const entriesToCreate = changes.timeLogs.filter((log) => !currentTimeLogs.some((currentLog) => currentLog.id === log.id))

      entriesToCreate.forEach((log) => {
        requests.push(api.post(`/api/work-orders/${workOrderId}/time-logs`, {
          startedAt: log.startedAt || null,
          endedAt: log.endedAt || null,
          hours: log.hours === '' || log.hours === null || log.hours === undefined ? null : Number(log.hours),
          note: log.note || '',
          technicianId: Number(currentWorkOrder?.assignedTechnicianId || log.technicianId || 0) || null,
        }))
      })
    }

    if (changes?.partsUsed) {
      const currentParts = currentWorkOrder?.partsUsed || []
      const entriesToCreate = changes.partsUsed.filter((entry) => !currentParts.some((currentEntry) => currentEntry.id === entry.id))

      entriesToCreate.forEach((entry) => {
        requests.push(api.post(`/api/work-orders/${workOrderId}/part-usages`, {
          partName: entry.name || entry.partName,
          quantity: Number(entry.quantity || 0),
          unit: entry.unit || 'ea',
          notes: entry.notes || '',
          technicianId: Number(currentWorkOrder?.assignedTechnicianId || entry.technicianId || 0) || null,
        }))
      })
    }

    if (Object.keys(changes).some((key) => ['title', 'description', 'customerId', 'siteId', 'serviceType', 'priority', 'scheduledDate'].includes(key))) {
      requests.push(api.put(`/api/work-orders/${workOrderId}`, normalizeWorkOrderPayload({
        ...currentWorkOrder,
        ...changes,
        customerId: changes.customerId ?? currentWorkOrder?.customerId,
        siteId: changes.siteId ?? currentWorkOrder?.siteId,
      })))
    }

    if (requests.length === 0) {
      return true
    }

    try {
      await Promise.all(requests)
      await refreshAllRecords()
      return true
    } catch (requestError) {
      setWorkOrders(workOrders)
      setError(requestError.message)
      return false
    }
  }

  return (
    <DirectoryDataContext.Provider value={{
      customers,
      sites,
      createCustomer,
      updateCustomer,
      createSite,
      updateSite,
      technicians,
      users,
      createTechnician,
      updateTechnician,
      createUser,
      updateUser,
      workOrders,
      createWorkOrder,
      updateWorkOrder,
      isAuthenticated,
      isLoading,
      error,
      dataLoadStatus,
      login,
      register,
      logout,
      refreshAllRecords,
    }}>
      {children}
    </DirectoryDataContext.Provider>
  )
}

export default DirectoryDataProvider
