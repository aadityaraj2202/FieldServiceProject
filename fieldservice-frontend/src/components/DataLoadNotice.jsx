function DataLoadNotice({ status, error, resourceName = 'Application data' }) {
  if (status === 'loading' || status === 'ready') {
    return null
  }

  if (status === 'error') {
    return <p className="local-data-notice" role="alert">Unable to load {resourceName.toLowerCase()} from the Field Service API: {error || 'Request failed.'}</p>
  }

  return null
}

export default DataLoadNotice
