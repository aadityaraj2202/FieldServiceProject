import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import CustomerForm from './CustomerForm.jsx'
import CustomersHeader from './CustomersHeader.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

function CustomerFormPage() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { customers, createCustomer, updateCustomer, dataLoadStatus, error } = useDirectoryData()
  const customer = customers.find((item) => item.id === customerId)
  const isEditing = Boolean(customerId)

  if (isEditing && !customer) {
    return (
      <section className="page-area directory-page">
        <CustomersHeader title="Customer Not Found" />
        <Link className="secondary-button" to="/customers">Back to customers</Link>
      </section>
    )
  }

  async function saveCustomer(values) {
    if (isEditing) {
      await updateCustomer(customer.id, values)
      navigate(`/customers/${customer.id}`)
      return
    }

    const newCustomerId = await createCustomer(values)
    navigate(`/customers/${newCustomerId}`)
  }

  return (
    <section className="page-area directory-page">
      <CustomersHeader
        title={isEditing ? `Edit ${customer.organization}` : 'Add Customer'}
        description={isEditing ? 'Update customer contact information.' : 'Add a customer organization and primary contact.'}
      />
      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Customers" />
      <CustomerForm
        initialValues={customer}
        onSubmit={saveCustomer}
        submitLabel={isEditing ? 'Save customer' : 'Add customer'}
        cancelTo={isEditing ? `/customers/${customer.id}` : '/customers'}
      />
    </section>
  )
}

export default CustomerFormPage
