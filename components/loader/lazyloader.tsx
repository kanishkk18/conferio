import { LineSpinner } from 'ldrs/react'
import 'ldrs/react/LineSpinner.css'

// Default values shown

const LazyLoader = () => {
    return(
<LineSpinner
  size="30"
  stroke="2"
  speed="1"
  color="#5C47CD" 
/>
    )
}

export default LazyLoader
