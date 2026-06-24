import { AppSidebar } from "../app-sidebar"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "../ui/breadcrumb"
// import { Separator } from "../ui/separator"
import {
  // SidebarInset,
  SidebarProvider,
  // SidebarTrigger,
} from "../ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
     
    </SidebarProvider>
  )
}
