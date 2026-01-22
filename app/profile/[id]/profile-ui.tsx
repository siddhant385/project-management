import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Briefcase, 
  GraduationCap, 
  Phone, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter, 
  Globe, 
  MapPin,
  Calendar
} from "lucide-react";
import Link from "next/link";

// Helper Component for Contact Rows
const ContactRow = ({ icon: Icon, label, value, href }: any) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-3 text-sm ">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="grid gap-0.5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline hover:text-primary transition-colors">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
};

export default function ProfileUI({
  profile,
  isOwnProfile,
  isStudent,
}: {
  profile: any;
  isOwnProfile: boolean;
  isStudent: boolean;
}) {
  
  // Safe access to contact info (Schema ke hisab se)
  const contact = profile.contact_info || {};

  return (
    <div className="container max-w-5xl py-10 space-y-8 mx-auto">
      
      {/* 1. HERO SECTION */}
      <div className="relative">
        {/* Banner Gradient */}
        <div className="h-48 w-full rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-border/50 shadow-sm"></div>
        
        {/* Profile Header Content */}
        <div className="px-6 md:px-10">
          <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
            
            {/* Avatar */}
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl rounded-2xl">
              <AvatarImage src={profile.avatar_url} className="object-cover" />
              <AvatarFallback className="text-5xl bg-zinc-100 text-zinc-500 rounded-2xl">
                {profile.full_name?.[0]}
              </AvatarFallback>
            </Avatar>

            {/* Name & Role */}
            <div className="flex-1 space-y-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {profile.full_name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={isStudent ? "default" : "secondary"} className="px-3 py-1 text-sm uppercase tracking-wide">
                  {profile.role}
                </Badge>
                
                {profile.department && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{profile.department}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
              <div className="mb-4 md:mb-2">
                <Button asChild className="shadow-lg rounded-full px-6">
                  <Link href="/profile">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-2">
        
        {/* LEFT SIDEBAR (Contact & Socials) - Takes 4 columns */}
        <div className="md:col-span-4 space-y-6">
          
          {/* About / Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Email (Supabase Auth se aata hai usually, pass kar dena) */}
              <ContactRow icon={Mail} label="Email" value={profile.email} href={`mailto:${profile.email}`} />
              
              {/* Phone */}
              <ContactRow icon={Phone} label="Phone" value={contact.phone_no} href={`tel:${contact.phone_no}`} />
              
              {/* WhatsApp */}
              <ContactRow icon={Phone} label="WhatsApp" value={contact.whatsapp_no} href={`https://wa.me/${contact.whatsapp_no}`} />
              
              <Separator />

              {/* Student Specifics */}
              {isStudent && (
                <>
                  <ContactRow icon={GraduationCap} label="Roll Number" value={profile.roll_number || "Not set"} />
                  <ContactRow icon={Calendar} label="Batch" value={profile.admission_year || "Not set"} />
                </>
              )}

            </CardContent>
          </Card>

          {/* Social Links Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Presence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {contact.github && (
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href={`https://github.com/${contact.github}`} target="_blank">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  </Button>
                )}
                
                {contact.linkedin && (
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href={`https://linkedin.com/in/${contact.linkedin}`} target="_blank">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  </Button>
                )}

                {contact.twitter && (
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href={`https://twitter.com/${contact.twitter}`} target="_blank">
                      <Twitter className="w-4 h-4" /> Twitter
                    </a>
                  </Button>
                )}

                {contact.website && (
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href={contact.website} target="_blank">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  </Button>
                )}
              </div>
              
              {!contact.github && !contact.linkedin && !contact.twitter && !contact.website && (
                 <p className="text-sm text-muted-foreground text-center py-2">No social links added.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT CONTENT (Bio & Skills) - Takes 8 columns */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Bio Section */}
          <Card className="min-h-[200px]">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                   <p>No bio available.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle>{isStudent ? "Skills & Interests" : "Areas of Expertise"}</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-4 py-2 text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No skills listed yet.
                </p>
              )}
            </CardContent>
          </Card>
          
        </div>

      </div>
    </div>
  );
}