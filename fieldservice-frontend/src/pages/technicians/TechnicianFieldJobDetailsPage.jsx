import { CalendarDays, CheckCircle2, Clock3, FileImage, MapPin, Paperclip, PlayCircle, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import {
  formatHistoryDate,
  formatWorkOrderDate,
  getAllowedStatusTransitions,
  getAssignedTechnicianName,
  getStatusClassName,
} from '../../data/workOrders.js'
import { PriorityBadge, StatusBadge } from '../work-orders/WorkOrderBadges.jsx'

const initialTimeEntry = {
  startedAt: '',
  endedAt: '',
  hours: '',
  note: '',
}

const initialPartsEntry = {
  name: '',
  quantity: '1',
  unit: 'ea',
  notes: '',
}

function TechnicianFieldJobDetailsPage() {
  const { workOrderId } = useParams()
  const { workOrders, technicians, updateWorkOrder } = useDirectoryData()
  const [timeEntry, setTimeEntry] = useState(initialTimeEntry)
  const [partsEntry, setPartsEntry] = useState(initialPartsEntry)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const workOrder = workOrders.find((item) => item.id === workOrderId)
  const statusTransitions = useMemo(() => getAllowedStatusTransitions(workOrder?.status ?? ''), [workOrder?.status])

  if (!workOrder) {
    return (
      <section className="page-area work-orders-page">
        <div className="page-heading">
          <p className="page-kicker">Project Keystone</p>
          <h1>Job not found</h1>
        </div>
        <Link className="secondary-button" to="/technicians/field-workflow">Back to field workflow</Link>
      </section>
    )
  }

  const timeLogs = Array.isArray(workOrder.timeLogs) ? workOrder.timeLogs : []
  const partsUsed = Array.isArray(workOrder.partsUsed) ? workOrder.partsUsed : []
  const attachments = Array.isArray(workOrder.attachments) ? workOrder.attachments : []

  function handleFileSelection(event) {
    const files = Array.from(event.target.files ?? [])
    const validFiles = files.filter((file) => {
      const isAllowedType = ['image/', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].some((type) => {
        if (type.endsWith('/')) {
          return file.type.startsWith(type)
        }
        return file.type === type
      })
      const isAllowedSize = file.size <= 8 * 1024 * 1024

      if (!isAllowedType) {
        setErrorMessage(`${file.name} is not a supported file type.`)
        return false
      }

      if (!isAllowedSize) {
        setErrorMessage(`${file.name} exceeds the 8MB size limit for temporary attachments.`)
        return false
      }

      return true
    })

    if (validFiles.length > 0) {
      setSelectedFiles((currentFiles) => [...currentFiles, ...validFiles])
      setErrorMessage('')
      event.target.value = ''
    }
  }

  function removeSelectedFile(fileName) {
    setSelectedFiles((currentFiles) => currentFiles.filter((file) => file.name !== fileName))
  }

  function attachSelectedFiles() {
    if (selectedFiles.length === 0) {
      setErrorMessage('Choose at least one photo or document to add to this temporary job attachment list.')
      return
    }

    const nextAttachments = selectedFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
    }))

    updateWorkOrder(workOrder.id, {
      attachments: [...attachments, ...nextAttachments],
    })
    setSelectedFiles([])
    setStatusMessage(`${nextAttachments.length} attachment${nextAttachments.length === 1 ? '' : 's'} added to the job record.`)
  }

  async function addTimeEntry(event) {
    event.preventDefault()

    if (!timeEntry.startedAt && !timeEntry.endedAt && !timeEntry.hours) {
      setErrorMessage('Enter a start time, end time, or total hours before saving this time entry.')
      return
    }

    const normalizedHours = Number(timeEntry.hours || 0)
    const nextTimeLog = {
      id: `${workOrder.id}-time-${Date.now()}`,
      startedAt: timeEntry.startedAt || '',
      endedAt: timeEntry.endedAt || '',
      hours: Number.isFinite(normalizedHours) && normalizedHours > 0 ? normalizedHours : '',
      note: timeEntry.note.trim(),
    }

    const saved = await updateWorkOrder(workOrder.id, {
      timeLogs: [...timeLogs, nextTimeLog],
    })
    if (!saved) {
      setErrorMessage('Unable to save the time entry to the backend.')
      return
    }
    setTimeEntry(initialTimeEntry)
    setStatusMessage('Time entry saved to the job record.')
    setErrorMessage('')
  }

  async function addPartsEntry(event) {
    event.preventDefault()

    if (!partsEntry.name.trim()) {
      setErrorMessage('Enter a material or part name before saving the parts entry.')
      return
    }

    const quantity = Number(partsEntry.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setErrorMessage('Enter a quantity greater than zero for the parts used.')
      return
    }

    const nextEntry = {
      id: `${workOrder.id}-part-${Date.now()}`,
      name: partsEntry.name.trim(),
      quantity,
      unit: partsEntry.unit.trim() || 'ea',
      notes: partsEntry.notes.trim(),
    }

    const saved = await updateWorkOrder(workOrder.id, {
      partsUsed: [...partsUsed, nextEntry],
    })
    if (!saved) {
      setErrorMessage('Unable to save the material entry to the backend.')
      return
    }
    setPartsEntry(initialPartsEntry)
    setStatusMessage('Material entry saved to the job record.')
    setErrorMessage('')
  }

  async function applyStatusAction(nextStatus) {
    if (!statusTransitions.includes(nextStatus)) {
      setErrorMessage(`The ${workOrder.status} status cannot transition directly to ${nextStatus} in the project workflow.`)
      return
    }

    if (nextStatus === 'Completed') {
      const hasCompletionNote = Boolean((workOrder.completionNote ?? '').trim())
      const hasWorkTime = timeLogs.length > 0 || Boolean(workOrder.startedAt) || Boolean(workOrder.endedAt)

      if (!hasCompletionNote || !hasWorkTime) {
        setErrorMessage('Add a completion note and at least one recorded time entry before marking this job complete.')
        return
      }
    }

    const statusUpdate = { status: nextStatus }
    if (nextStatus === 'Completed' && !(workOrder.completionNote ?? '').trim()) {
      statusUpdate.completionNote = 'Completed.'
    }

    const result = await updateWorkOrder(workOrder.id, statusUpdate)
    if (!result) {
      setErrorMessage('This status change is not allowed for the current workflow state.')
      return
    }

    setStatusMessage(`Status updated to ${nextStatus}.`)
    setErrorMessage('')
  }

  return (
    <section className="page-area work-orders-page">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>{workOrder.id}</h1>
      </div>

      {statusMessage && <p className="workflow-success-message">{statusMessage}</p>}
      {errorMessage && <p className="workflow-error-message">{errorMessage}</p>}

      <div className="details-back-link">
        <Link to="/technicians/field-workflow">Back to technician jobs</Link>
      </div>

      <div className="work-order-details-grid">
        <div className="details-main-column">
          <section className="details-panel">
            <div className="details-panel-heading">
              <h2>Job information</h2>
              <div className="details-badges">
                <PriorityBadge priority={workOrder.priority} />
                <StatusBadge status={workOrder.status} />
              </div>
            </div>
            <dl className="details-list">
              <div><dt>Customer</dt><dd>{workOrder.customer}</dd></div>
              <div><dt>Site</dt><dd>{workOrder.site}</dd></div>
              <div><dt>Assigned technician</dt><dd>{getAssignedTechnicianName(workOrder, technicians)}</dd></div>
              <div><dt>Service type</dt><dd>{workOrder.serviceType}</dd></div>
              <div className="details-list-wide"><dt>Service request</dt><dd>{workOrder.description}</dd></div>
              <div><dt>Scheduled date</dt><dd>{formatWorkOrderDate(workOrder.scheduledDate)}</dd></div>
              <div><dt>Current status</dt><dd>{workOrder.status}</dd></div>
            </dl>
          </section>

          <section className="details-panel">
            <h2>Execution notes</h2>
            <div className="job-notes-box">
              <textarea
                value={workOrder.completionNote ?? ''}
                onChange={(event) => updateWorkOrder(workOrder.id, { completionNote: event.target.value })}
                placeholder="Add completion summary, findings, and customer communication notes."
              />
            </div>
          </section>

          <section className="details-panel">
            <h2>Status history</h2>
            <ol className="status-history">
              {workOrder.history.map((entry, index) => (
                <li key={`${entry.changedAt}-${entry.status}`}>
                  <span className={`history-marker status-${getStatusClassName(entry.status)}`} aria-hidden="true" />
                  <div>
                    <strong>{entry.status}</strong>
                    <p>{entry.note}</p>
                    <time dateTime={entry.changedAt}>{formatHistoryDate(entry.changedAt)}</time>
                  </div>
                  {index < workOrder.history.length - 1 && <span className="history-line" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </section>

          <section className="details-panel">
            <h2>Time and materials</h2>
            <div className="workflow-subsection">
              <form className="workflow-form-grid" onSubmit={addTimeEntry}>
                <div className="form-field">
                  <label htmlFor="startedAt">Work start</label>
                  <input id="startedAt" type="datetime-local" value={timeEntry.startedAt} onChange={(event) => setTimeEntry((current) => ({ ...current, startedAt: event.target.value }))} />
                </div>
                <div className="form-field">
                  <label htmlFor="endedAt">Work end</label>
                  <input id="endedAt" type="datetime-local" value={timeEntry.endedAt} onChange={(event) => setTimeEntry((current) => ({ ...current, endedAt: event.target.value }))} />
                </div>
                <div className="form-field">
                  <label htmlFor="hours">Hours logged</label>
                  <input id="hours" type="number" min="0" step="0.25" placeholder="e.g. 2.5" value={timeEntry.hours} onChange={(event) => setTimeEntry((current) => ({ ...current, hours: event.target.value }))} />
                </div>
                <div className="form-field form-field-wide">
                  <label htmlFor="timeNote">Time entry note</label>
                  <input id="timeNote" type="text" value={timeEntry.note} onChange={(event) => setTimeEntry((current) => ({ ...current, note: event.target.value }))} placeholder="What work was completed during this time?" />
                </div>
                <div className="form-actions form-field-wide">
                  <button className="primary-button compact-button" type="submit">Save time entry</button>
                </div>
              </form>
            </div>

            <div className="record-list">
              {timeLogs.length === 0 ? (
                <p className="empty-associated-list">No time entries have been recorded for this job yet.</p>
              ) : (
                timeLogs.map((log) => (
                  <div key={log.id} className="record-item">
                    <div className="record-item-heading">
                      <strong>{log.hours ? `${log.hours} hours` : 'Time recorded'}</strong>
                      <span>{log.startedAt ? formatWorkOrderDate(log.startedAt.slice(0, 10)) : 'No date'}</span>
                    </div>
                    <p>{log.startedAt ? `Start: ${new Date(log.startedAt).toLocaleString()}` : 'No start time'}</p>
                    <p>{log.endedAt ? `End: ${new Date(log.endedAt).toLocaleString()}` : 'No end time'}</p>
                    {log.note && <p>{log.note}</p>}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="details-panel">
            <h2>Materials used</h2>
            <div className="workflow-subsection">
              <form className="workflow-form-grid" onSubmit={addPartsEntry}>
                <div className="form-field">
                  <label htmlFor="partName">Part or material</label>
                  <input id="partName" type="text" value={partsEntry.name} onChange={(event) => setPartsEntry((current) => ({ ...current, name: event.target.value }))} placeholder="Example: Air filter" />
                </div>
                <div className="form-field">
                  <label htmlFor="partQuantity">Quantity</label>
                  <input id="partQuantity" type="number" min="1" step="1" value={partsEntry.quantity} onChange={(event) => setPartsEntry((current) => ({ ...current, quantity: event.target.value }))} />
                </div>
                <div className="form-field">
                  <label htmlFor="partUnit">Unit</label>
                  <input id="partUnit" type="text" value={partsEntry.unit} onChange={(event) => setPartsEntry((current) => ({ ...current, unit: event.target.value }))} placeholder="ea, box, pack" />
                </div>
                <div className="form-field form-field-wide">
                  <label htmlFor="partNotes">Notes</label>
                  <input id="partNotes" type="text" value={partsEntry.notes} onChange={(event) => setPartsEntry((current) => ({ ...current, notes: event.target.value }))} placeholder="Used on site or used as replacement part" />
                </div>
                <div className="form-actions form-field-wide">
                  <button className="primary-button compact-button" type="submit">Save material</button>
                </div>
              </form>
            </div>

            <div className="record-list">
              {partsUsed.length === 0 ? (
                <p className="empty-associated-list">No parts or materials have been logged for this service call.</p>
              ) : (
                partsUsed.map((part) => (
                  <div key={part.id} className="record-item">
                    <div className="record-item-heading">
                      <strong>{part.name}</strong>
                      <span>{part.quantity} {part.unit}</span>
                    </div>
                    {part.notes && <p>{part.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="details-panel">
            <h2>Attachments</h2>
            <div className="attachment-upload-box">
              <label className="upload-input-label">
                <Paperclip size={16} aria-hidden="true" />
                Add photos or documents
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelection} />
              </label>
              <button className="secondary-button compact-button" type="button" onClick={attachSelectedFiles}>Add temporary attachments</button>
            </div>

            {selectedFiles.length > 0 ? (
              <div className="selected-file-list">
                {selectedFiles.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="selected-file-item">
                    <span>{file.name}</span>
                    <button type="button" onClick={() => removeSelectedFile(file.name)}>Remove</button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="record-list">
              {attachments.length === 0 ? (
                <p className="empty-associated-list">No temporary attachments added yet.</p>
              ) : (
                attachments.map((attachment) => (
                  <div key={attachment.id} className="record-item">
                    <div className="record-item-heading">
                      <strong>{attachment.name}</strong>
                    </div>
                    <p>{attachment.type || 'Temporary attachment'} · {attachment.size ? `${Math.max(1, Math.round((attachment.size / 1024) * 10) / 10)} KB` : 'No size available'}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="details-side-column">
          <section className="details-panel">
            <h2>Field status actions</h2>
            <div className="status-action-list">
              {statusTransitions.length > 0 ? (
                statusTransitions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className="secondary-button compact-button status-action-button"
                    onClick={() => applyStatusAction(status)}
                  >
                    {status === 'In Progress' ? <PlayCircle size={15} aria-hidden="true" /> : status === 'Completed' ? <CheckCircle2 size={15} aria-hidden="true" /> : <Clock3 size={15} aria-hidden="true" />}
                    {status === 'In Progress' ? 'Start work' : status === 'Completed' ? 'Complete job' : status === 'On Hold' ? 'Put on hold' : status === 'Closed' ? 'Close job' : status === 'Cancelled' ? 'Cancel job' : 'Resume work'}
                  </button>
                ))
              ) : (
                <p className="empty-associated-list">No further status actions are available for this workflow step.</p>
              )}
            </div>
          </section>

          <section className="details-panel">
            <h2>Job details</h2>
            <div className="detail-stack">
              <div className="detail-stack-item">
                <CalendarDays size={16} aria-hidden="true" />
                <span>{formatWorkOrderDate(workOrder.scheduledDate)}</span>
              </div>
              <div className="detail-stack-item">
                <MapPin size={16} aria-hidden="true" />
                <span>{workOrder.site}</span>
              </div>
              <div className="detail-stack-item">
                <FileImage size={16} aria-hidden="true" />
                <span>{attachments.length} attachment{attachments.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </section>

          <section className="details-panel">
            <label className="status-change-label" htmlFor="tech-job-status">Current status</label>
            <select
              id="tech-job-status"
              className="status-change-select"
              value={workOrder.status}
              onChange={(event) => applyStatusAction(event.target.value)}
            >
              {['New', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Closed'].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <p className="field-workflow-hint">Status actions follow the project workflow rules and keep Closed as a final close-out step.</p>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default TechnicianFieldJobDetailsPage
