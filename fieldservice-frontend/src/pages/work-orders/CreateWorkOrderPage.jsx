import { useNavigate, useOutletContext } from 'react-router-dom'
import WorkOrderForm from './WorkOrderForm.jsx'
import WorkOrdersHeader from './WorkOrdersHeader.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

function CreateWorkOrderPage() {
  const navigate = useNavigate()
  const { customers, sites, createWorkOrder, technicians, dataLoadStatus, error } = useOutletContext()

  async function handleCreate(values) {
    const workOrderId = await createWorkOrder(values)
    navigate(`/work-orders/${workOrderId}`)
  }

  return (
    <section className="page-area work-orders-page">
      <WorkOrdersHeader
        title="Create Work Order"
        description="Add the service request details and optionally assign a technician."
      />

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Work orders" />
      <WorkOrderForm customers={customers} sites={sites} technicians={technicians} onSubmit={handleCreate} submitLabel="Create work order" cancelTo="/work-orders" />
    </section>
  )
}

export default CreateWorkOrderPage
