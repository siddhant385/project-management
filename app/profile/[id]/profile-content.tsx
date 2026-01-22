import { getProfileById, getProfile } from "@/actions/profile";
import { notFound } from "next/navigation";
import ProfileUI from "./profile-ui";

export default async function ProfileContent({ id }: { id: string }) {
  // Parallel fetching (fast + correct)
  const [profile, currentUser] = await Promise.all([
    getProfileById(id),
    getProfile(),
  ]);

  if (!profile) {
    return notFound();
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const isStudent = profile.role === "student";

  return (
    <ProfileUI
      profile={profile}
      isOwnProfile={isOwnProfile}
      isStudent={isStudent}
    />
  );
}
