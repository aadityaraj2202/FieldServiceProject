import { Outlet } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'

function WorkOrdersLayout() {
  const { customers, sites, workOrders, technicians, createWorkOrder, updateWorkOrder, dataLoadStatus, error } = useDirectoryData()

  return <Outlet context={{ customers, sites, workOrders, technicians, createWorkOrder, updateWorkOrder, dataLoadStatus, error }} />
}

export default WorkOrdersLayout
