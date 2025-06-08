import CustomBreadcrumb from "@/components/Breadcrumb";
import { SidebarInset } from "@/components/ui/sidebar";


export default function NotFoundPage() {
return (
    <SidebarInset>
      <CustomBreadcrumb 
        items={[
          { label: "Page introuvable..." },
        ]}>
      </CustomBreadcrumb>

        <main className="p-4">
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center text-center">
                <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
                <p className="text-lg text-muted-foreground">
                    Oups ! La page que vous cherchez n'existe pas.
                </p>
            </div>
        </main>
    </SidebarInset>
)
}