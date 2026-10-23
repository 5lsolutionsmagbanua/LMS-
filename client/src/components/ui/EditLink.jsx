// client/src/components/ui/EditLink.jsx
export default function EditLink({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      // text-ink follows the theme primary on every theme except White,
      // where it switches to a dark (light mode) or white (dark mode) ink.
      className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-ink transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
    >
      <PencilIcon className="h-3.5 w-3.5" />
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
