import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import WorkOrderForm from './WorkOrderForm.jsx'
import WorkOrdersHeader from './WorkOrdersHeader.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

function EditWorkOrderPage() {
  const { workOrderId } = useParams()
  const navigate = useNavigate()
  const { customers, sites, workOrders, technicians, updateWorkOrder, dataLoadStatus, error } = useOutletContext()
  const workOrder = workOrders.find((item) => item.id === workOrderId)

  if (!workOrder) {
    return (
      <section className="page-area work-orders-page">
        <WorkOrdersHeader title="Work Order Not Found" />
        <Link className="secondary-button" to="/work-orders">Back to work orders</Link>
      </section>
    )
  }

  async function handleSave(values) {
    const saved = await updateWorkOrder(workOrder.id, values)
    if (!saved) {
      throw new Error('Unable to save the work order.')
    }
    navigate(`/work-orders/${workOrder.id}`)
  }

  return (
    <section className="page-area work-orders-page">
      <WorkOrdersHeader
        title={`Edit ${workOrder.id}`}
        description="Update work-order details."
      />

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Work orders" />
      <WorkOrderForm
        customers={customers}
        sites={sites}
        technicians={technicians}
        initialValues={workOrder}
        onSubmit={handleSave}
        submitLabel="Save work order"
        cancelTo={`/work-orders/${workOrder.id}`}
      />
    </section>
  )
}

export default EditWorkOrderPage
