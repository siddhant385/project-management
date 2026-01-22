import { redirect } from 'next/navigation'

// Redirect /projects to /search?type=projects
export default function ProjectsPage() {
  redirect('/search?type=projects')
}
