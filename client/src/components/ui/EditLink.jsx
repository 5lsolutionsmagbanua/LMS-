// client/src/components/ui/EditLink.jsx
export default function EditLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      /* 👉 Uses text-primary and hover opacity to dynamically adapt to the active theme color */
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
    >
      <PencilIcon className="w-3.5 h-3.5" />
      Edit
    </button>
  )
}

function PencilIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M13.5 2.5l4 4L6 18H2v-4L13.5 2.5z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
