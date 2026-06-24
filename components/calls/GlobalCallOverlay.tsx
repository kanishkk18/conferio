// 'use client';
// import React from 'react';
// import { useCall } from 'contexts/CallContext';
// import DraggableCallCard from './DraggableCallCard';
// import IncomingCallModal from './IncomingCallModal';

// /**
//  * Drop this inside your root layout once.
//  * It renders on every page automatically so calls persist across navigation.
//  */
// export default function GlobalCallOverlay() {
//   const { currentCall, heldCalls, incomingCall } = useCall();

//   const hasActiveCall = !!currentCall || heldCalls.length > 0;

//   return (
//     <>
//       {/* Incoming call modal */}
//       {incomingCall && <IncomingCallModal />}

//       {/* Active call draggable card */}
//       {hasActiveCall && <DraggableCallCard />}
//     </>
//   );
// }

'use client';
import React from 'react';
import { useCall } from 'contexts/CallContext';
import DraggableCallCard from './DraggableCallCard';
import IncomingCallModal from './IncomingCallModal';

/**
 * GlobalCallOverlay
 *
 * Place this ONCE in _app.tsx, INSIDE <CallProvider> but OUTSIDE the page layout.
 * Because it uses fixed/z-index positioning it renders on top of every page
 * regardless of navigation — calls persist across route changes.
 *
 * Current placement in _app.tsx (already correct):
 *   <CallProvider>
 *     <GlobalCallOverlay />          ← here
 *     {getLayout(<Component />)}
 *   </CallProvider>
 */
export default function GlobalCallOverlay() {
  const { currentCall, heldCalls, incomingCall } = useCall();

  const hasActiveCall = !!currentCall || heldCalls.length > 0;

  return (
    <>
      {/* Incoming call modal — shown to the callee */}
      {incomingCall && <IncomingCallModal />}

      {/* Active call draggable card — shown to both parties once connected */}
      {hasActiveCall && <DraggableCallCard />}

    </>
  );
}
