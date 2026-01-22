import { Suspense } from "react";
import ProfileContent from "./profile-content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PublicProfilePage({ params }: PageProps) {
  // ❌ Yahan await MAT karo. 
  // Agar yahan await kiya to Skeleton kabhi nahi dikhega.
  
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      {/* ✅ Promise ko neeche pass karo, unwrap wahan hoga */}
      <ProfileIdWrapper params={params} />
    </Suspense>
  );
}

// 🔥 New Wrapper Component
// Ye params ko await karega, lekin kyunki ye Suspense ke andar hai,
// to Skeleton turant dikh jayega jab tak ye processing karega.
async function ProfileIdWrapper({ params }: PageProps) {
  const { id } = await params;
  return <ProfileContent id={id} />;
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <div className="animate-pulse space-y-6">
        <div className="h-40 bg-muted rounded-lg" />
        <div className="h-6 w-1/2 bg-muted rounded" />
        <div className="h-4 w-1/3 bg-muted rounded" />
      </div>
    </div>
  );
}