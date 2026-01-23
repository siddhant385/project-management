import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <FileQuestion className="w-12 h-12 text-muted-foreground" />
        </div>

        {/* Big 404 */}
        <h1 className="text-7xl font-bold text-primary/20 mb-2">404</h1>
        
        {/* Message */}
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-10 pt-6 border-t">
          <p className="text-sm text-muted-foreground mb-3">Looking for something?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/projects" className="text-primary hover:underline">
              Browse Projects
            </Link>
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign In
            </Link>
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
