import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
  return (
    <div className="container max-w-5xl mx-auto py-6 md:py-10 px-4 space-y-6 md:space-y-8">
      
      {/* Header Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          {/* Title & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 w-[250px] md:w-[400px]" />
            <Skeleton className="h-6 w-[100px] rounded-full" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-[800px]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <div className="space-y-6">
        {/* Tab List */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>

        {/* Tab Content (Overview Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Stats Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="grid grid-cols-4 gap-2">
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Timeline/Progress) */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[120px]" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-full w-0.5" />
                    </div>
                    <div className="space-y-1 pb-4 w-full">
                      <Skeleton className="h-4 w-[80%]" />
                      <Skeleton className="h-3 w-[40%]" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}