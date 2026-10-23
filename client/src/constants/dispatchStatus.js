// client/src/constants/dispatchStatus.js
// Single source for the delivery flow. The stepper, the action button and the
// labels all read from here, so changing the flow means editing one file.
// Mirrors DRIVER_ACTIONS in server/src/controllers/driverDispatch.controller.js

export const DELIVERY_STEPS = [
  { key: 'assigned', label: 'Assigned', at: 'assignedAt' },
  { key: 'en_route', label: 'On the way', at: 'departedAt' },
  { key: 'arrived', label: 'Arrived', at: 'arrivedAt' },
  { key: 'completed', label: 'Delivered', at: 'completedAt' },
]

// Next driver action per dispatch status.
// `requestStatus` = the pending-request status the server requires for it.
export const NEXT_ACTION = {
  assigned: { next: 'en_route', label: 'Start trip', requestStatus: 'ready_for_dispatch' },
  en_route: { next: 'arrived', label: 'I have arrived', requestStatus: 'dispatched' },
  arrived: {
    next: 'completed',
    label: 'Complete delivery',
    requestStatus: 'dispatched',
    askNotes: true,
  },
}

// Dispatch statuses from which the driver can report a failed delivery
export const CAN_REPORT_FAILED = ['assigned', 'en_route', 'arrived']

export const DISPATCH_STATUS_LABEL = {
  assigned: 'Assigned',
  en_route: 'On the way',
  arrived: 'Arrived',
  completed: 'Delivered',
  cancelled: 'Cancelled',
}
