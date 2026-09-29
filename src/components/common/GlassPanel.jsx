export default function GlassPanel({ as: Tag = 'div', raised = false, className = '', children, ...rest }) {
  return (
    <Tag className={`${raised ? 'glass-raised' : 'glass'} rounded-2xl ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
