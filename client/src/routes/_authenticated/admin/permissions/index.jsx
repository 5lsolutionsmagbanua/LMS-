// client/src/routes/_authenticated/admin/permissions/index.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import PermissionTabs from './permissionsForm/PermissionTabs'
import PermissionCatalogPanel from './permissionsForm/PermissionCatalogPanel'
import BulkPermissionsPanel from './permissionsForm/BulkPermissionsPanel'

export const Route = createFileRoute('/_authenticated/admin/permissions/')({
  component: PermissionsRoute,
})

function PermissionsRoute() {
  const [activeTab, setActiveTab] = useState('bulk')

  return (
    <div className="w-full pb-12">
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-2 border-primary/20 dark:border-primary/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 w-full backdrop-blur-sm transition-colors">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-md text-on-primary">
          <div>
            <h1 className="text-2xl font-bold tracking-tight h1 drop-shadow-2xs">
              Roles & Permissions
            </h1>
            <p className="text-sm opacity-75 mt-0.5">
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
