import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import SiteForm from './SiteForm.jsx'
import SitesHeader from './SitesHeader.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

function SiteFormPage() {
  const { siteId } = useParams()
  const navigate = useNavigate()
  const { customers, sites, createSite, updateSite, dataLoadStatus, error } = useDirectoryData()
  const site = sites.find((item) => item.id === siteId)
  const isEditing = Boolean(siteId)

  if (isEditing && !site) {
    return (
      <section className="page-area directory-page">
        <SitesHeader title="Site Not Found" />
        <Link className="secondary-button" to="/sites">Back to sites</Link>
      </section>
    )
  }

  async function saveSite(values) {
    if (isEditing) {
      await updateSite(site.id, values)
      navigate(`/sites/${site.id}`)
      return
    }

    const newSiteId = await createSite(values)
    navigate(`/sites/${newSiteId}`)
  }

  return (
    <section className="page-area directory-page">
      <SitesHeader
        title={isEditing ? `Edit ${site.siteName}` : 'Add Site'}
        description={isEditing ? 'Update service location details.' : 'Add a service location and associate it with a customer.'}
      />
      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Sites" />
      <SiteForm
        customers={customers}
        initialValues={site}
        onSubmit={saveSite}
        submitLabel={isEditing ? 'Save site' : 'Add site'}
        cancelTo={isEditing ? `/sites/${site.id}` : '/sites'}
      />
    </section>
  )
}

export default SiteFormPage
