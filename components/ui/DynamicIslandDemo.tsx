// "use client"

// import React, { useState } from "react"

// import DynamicIsland, {
//   DynamicIslandProps,
// } from "@/components/ui/DynamicIsland"

// const DynamicIslandDemo = () => {
//   const [view, setView] = useState<DynamicIslandProps["view"]>()

//   return <DynamicIsland view={view} onViewChange={setView} />
// }

// export default DynamicIslandDemo

"use client"

import React, { useState } from "react"

import DynamicIsland, {
  DynamicIslandProps,
  IslandOption,
} from "@/components/ui/DynamicIsland"

interface DynamicIslandDemoProps {
  /** Which island options to show. Omit/null to show all options. */
  options?: IslandOption[] | null
}

const DynamicIslandDemo = ({ options }: DynamicIslandDemoProps) => {
  const [view, setView] = useState<DynamicIslandProps["view"]>()

  // Convert null to undefined so DynamicIsland gets the correct fallback
  const resolvedOptions = options === null ? undefined : options

  return (
    <DynamicIsland 
      view={view} 
      onViewChange={setView} 
      options={resolvedOptions} 
    />
  )
}

export default DynamicIslandDemo
