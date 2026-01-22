"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Actions & Schemas
import { profileSchema, ProfileFormValues } from "@/schemas/profile";
import { getProfile, updateProfile } from "@/actions/profile";

// Shadcn UI Form Provider (Bahut Zaroori hai)
import { Form } from "@/components/ui/form";

// Humare New Modular Components
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { PersonalSection } from "@/components/profile/personal-section";
import { ContactSection } from "@/components/profile/contact-section";

export default function ProfilePage() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for non-form data
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [userEmail, setUserEmail] = useState<string>("");

  /* ---------------- FORM SETUP ---------------- */
  const form = useForm<ProfileFormValues>({
  resolver: zodResolver(profileSchema),
  defaultValues: {
    full_name: "",
    bio: "",
    department: "",
    roll_number: "",
    admission_year: undefined,
    skills: "",
    contact_info: {
      phone_no: "",
      whatsapp_no: "",
      telegram: "",
      twitter: "",
      github: "",
      linkedin: "",
      website: "",
    },
  },
});

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    async function loadData() {
      const data = await getProfile();

      if (data) {
        setUserRole(data.role || "student");
        setUserEmail(data.email || "");
        setAvatarUrl(data.avatar_url || null);

        form.reset({
          full_name: data.full_name || "",
          bio: data.bio || "",
          department: data.department || "",
          roll_number: data.roll_number || "",
          admission_year: data.admission_year ?? undefined,
          skills: data.skills ? data.skills.join(", ") : "",
          contact_info: {
            phone_no: data.contact_info?.phone_no || "",
            whatsapp_no: data.contact_info?.whatsapp_no || "",
            telegram: data.contact_info?.telegram || "",
            twitter: data.contact_info?.twitter || "",
            github: data.contact_info?.github || "",
            linkedin: data.contact_info?.linkedin || "",
            website: data.contact_info?.website || "",
          },
        });
      }

      setIsLoading(false);
    }

    loadData();
  }, [form]);

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (values: ProfileFormValues) => {
    const result = await updateProfile(values, avatarUrl);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4 space-y-8">
      
      {/* IMPORTANT: <Form {...form}> wrapper zaroori hai Shadcn ke liye.
         Iske bina 'useFormField' error aayega child components mein.
      */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* 1. Header Section */}
          <ProfileHeader 
            isEditing={isEditing} 
            setIsEditing={setIsEditing} 
            isSubmitting={form.formState.isSubmitting} 
          />

          {/* 2. Avatar Section */}
          <ProfileAvatar 
            avatarUrl={avatarUrl} 
            setAvatarUrl={setAvatarUrl} 
            isEditing={isEditing} 
            fullName={form.watch("full_name")} 
            userEmail={userEmail} 
            userRole={userRole} 
          />

          {/* 3. Details Grid (Personal + Contact) */}
          <div className="grid gap-8 md:grid-cols-2">
            
            <PersonalSection 
              control={form.control as any} 
              isEditing={isEditing} 
              userRole={userRole} 
              userEmail={userEmail} 
            />
            
            <ContactSection 
              control={form.control as any} 
              isEditing={isEditing} 
            />
            
          </div>

        </form>
      </Form>
    </div>
  );
}