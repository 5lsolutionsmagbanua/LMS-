import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
// Change to:
import PermissionTabs from './permissionsForm/PermissionTabs'
import PermissionCatalogPanel from './permissionsForm/PermissionCatalogPanel'
import BulkPermissionsPanel from './permissionsForm/BulkPermissionsPanel'

export const Route = createFileRoute('/_authenticated/admin/permissions/')({
  component: PermissionsRoute,
})

// client/src/routes/_authenticated/admin/permissions/index.jsx
function PermissionsRoute() {
  const [activeTab, setActiveTab] = useState('bulk') // was 'matrix'

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 w-full">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Roles & Permissions
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage security roles, access matrixes, and module permissions.
            </p>
          </div>
        </div>

        <PermissionTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'bulk' && <BulkPermissionsPanel />}
        {activeTab === 'catalog' && <PermissionCatalogPanel />}
      </div>
    </div>
  )
}
