import React from "react"
import CircularText from "../ui/CircularTextLoader"

interface LoadingOverlayProps {
  isLoading: boolean
}

const Loading: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null

  return (
     <div className="min-h-screen flex items-center justify-center">
                         <CircularText
                    text="CONFERIO*CALLS*"
                    onHover="speedUp"
                    spinDuration={5}
                    className="custom-class"
                  />
                        </div>
  )
}

export default Loading
