function PlaceholderPage({ title, icon: Icon, children }) {
  return (
    <section className="page-area">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>{title}</h1>
      </div>

      <article className="placeholder-panel">
        <div className="placeholder-icon"><Icon size={24} aria-hidden="true" /></div>
        {children}
      </article>
    </section>
  )
}

export default PlaceholderPage
