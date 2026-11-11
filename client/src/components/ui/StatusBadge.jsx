const statusConfig = {
  // Repair statuses
  draft:               { label: 'Draft',            cls: 'badge-neutral' },
  submitted:           { label: 'Submitted',         cls: 'badge-info' },
  troubleshooting:     { label: 'Troubleshooting',   cls: 'badge-purple' },
  awaiting_quotations: { label: 'Awaiting Quotes',   cls: 'badge-warning' },
  quotations_received: { label: 'Quotes Received',   cls: 'badge-brand' },
  vendor_selected:     { label: 'Vendor Selected',   cls: 'badge-brand' },
  repair_accepted:     { label: 'Repair Accepted',   cls: 'badge-cyan' },
  device_received:     { label: 'Device Received',   cls: 'badge-teal' },
  repair_in_progress:  { label: 'In Progress',       cls: 'badge-info' },
  repair_completed:    { label: 'Completed',         cls: 'badge-success' },
  delivered:           { label: 'Delivered',         cls: 'badge-success' },
  closed:              { label: 'Closed',            cls: 'badge-neutral' },
  cancelled:           { label: 'Cancelled',         cls: 'badge-error' },

  // Quotation statuses
  pending:             { label: 'Pending',           cls: 'badge-warning' },
  accepted:            { label: 'Accepted',          cls: 'badge-success' },
  rejected:            { label: 'Rejected',          cls: 'badge-error' },
  withdrawn:           { label: 'Withdrawn',         cls: 'badge-neutral' },
  viewed:              { label: 'Viewed',            cls: 'badge-info' },
  expired:             { label: 'Expired',           cls: 'badge-neutral' },

  // Verification
  verified:            { label: 'Verified',          cls: 'badge-success' },
  under_review:        { label: 'Under Review',      cls: 'badge-warning' },
  unverified:          { label: 'Unverified',        cls: 'badge-neutral' },

  // Generic
  active:              { label: 'Active',            cls: 'badge-success' },
  inactive:            { label: 'Inactive',          cls: 'badge-neutral' },
  open:                { label: 'Open',              cls: 'badge-info' },
  resolved:            { label: 'Resolved',          cls: 'badge-success' },
  dismissed:           { label: 'Dismissed',         cls: 'badge-neutral' },
  escalated:           { label: 'Escalated',         cls: 'badge-error' },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status] || { label: status, cls: 'badge-neutral' };
  return (
    <span className={`${config.cls} ${className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
