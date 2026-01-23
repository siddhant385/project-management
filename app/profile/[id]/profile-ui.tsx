import { UserAvatar } from "@/components/ui/user-avatar";
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
  Calendar,
  ExternalLink,
  Sparkles,
  Code2,
  MessageCircle
} from "lucide-react";
import Link from "next/link";

// Helper Component for Contact Rows
const ContactRow = ({ icon: Icon, label, value, href }: any) => {
  if (!value) return null;
  
  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-primary transition-colors truncate block">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium truncate">{value}</p>
        )}
      </div>
      {href && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
    </div>
  );
};

// Social Link Button
const SocialButton = ({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer"
    className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent bg-gradient-to-br from-muted/50 to-muted/30 hover:border-primary/20 hover:shadow-lg transition-all duration-300`}
  >
    <div className={`p-3 rounded-full ${color} mb-2 group-hover:scale-110 transition-transform`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
  </a>
);

// Skill Badge with hover effect
const SkillBadge = ({ skill, index }: { skill: string; index: number }) => {
  const colors = [
    "from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border-violet-500/20",
    "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-500/20",
    "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-500/20",
    "from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border-orange-500/20",
    "from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border-pink-500/20",
    "from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border-indigo-500/20",
  ];
  
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${colors[index % colors.length]} border transition-all duration-200 cursor-default hover:scale-105`}
    >
      <Code2 className="h-3.5 w-3.5" />
      {skill}
    </span>
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
  
  // Safe access to contact info
  const contact = profile.contact_info || {};
  const hasSocials = contact.github || contact.linkedin || contact.twitter || contact.website;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container max-w-5xl py-8 space-y-8 mx-auto px-4">
      
        {/* 1. HERO SECTION */}
        <div className="relative">
          {/* Banner with animated gradient */}
          <div className="h-52 md:h-56 w-full rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-violet-600/80" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <Sparkles className="h-20 w-20 text-white" />
            </div>
          </div>
          
          {/* Profile Header Content */}
          <div className="px-4 md:px-8">
            <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-20 gap-6">
              
              {/* Avatar with ring */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <UserAvatar 
                  src={profile.avatar_url}
                  name={profile.full_name}
                  className="relative w-36 h-36 md:w-44 md:h-44 border-4 border-background shadow-2xl rounded-2xl"
                />
                {/* Online indicator */}
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-background rounded-full" />
              </div>

              {/* Name & Role */}
              <div className="flex-1 space-y-3 pb-2">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {profile.full_name}
                  </h1>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-1 line-clamp-1 max-w-md">
                      {profile.bio.slice(0, 60)}{profile.bio.length > 60 ? '...' : ''}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    className={`px-4 py-1.5 text-sm font-semibold uppercase tracking-wider ${
                      isStudent 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' 
                        : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600'
                    } border-0 shadow-md`}
                  >
                    {profile.role}
                  </Badge>
                  
                  {profile.department && (
                    <Badge variant="outline" className="px-3 py-1.5 gap-1.5 bg-background/80 backdrop-blur-sm">
                      <Briefcase className="w-3.5 h-3.5" />
                      {profile.department}
                    </Badge>
                  )}
                  
                  {isStudent && profile.admission_year && (
                    <Badge variant="outline" className="px-3 py-1.5 gap-1.5 bg-background/80 backdrop-blur-sm">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Batch {profile.admission_year}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              {isOwnProfile && (
                <div className="pb-2">
                  <Button asChild size="lg" className="shadow-lg rounded-full px-6 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90">
                    <Link href="/profile">
                      <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        {isStudent && profile.roll_number && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-muted/50 to-muted/30">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-12">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Roll Number</p>
                    <p className="font-semibold">{profile.roll_number}</p>
                  </div>
                </div>
                {profile.department && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Department</p>
                      <p className="font-semibold">{profile.department}</p>
                    </div>
                  </div>
                )}
                {profile.admission_year && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Admission Year</p>
                      <p className="font-semibold">{profile.admission_year}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Contact Card */}
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ContactRow icon={Mail} label="Email" value={profile.email} href={`mailto:${profile.email}`} />
                <ContactRow icon={Phone} label="Phone" value={contact.phone_no} href={`tel:${contact.phone_no}`} />
                <ContactRow icon={Phone} label="WhatsApp" value={contact.whatsapp_no} href={`https://wa.me/${contact.whatsapp_no}`} />
                
                {!profile.email && !contact.phone_no && !contact.whatsapp_no && (
                  <p className="text-sm text-muted-foreground text-center py-6">No contact info added.</p>
                )}
              </CardContent>
            </Card>

            {/* Social Links Card */}
            {hasSocials && (
              <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Connect
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {contact.github && (
                      <SocialButton 
                        href={`https://github.com/${contact.github}`} 
                        icon={Github} 
                        label="GitHub"
                        color="bg-gradient-to-br from-gray-700 to-gray-900"
                      />
                    )}
                    {contact.linkedin && (
                      <SocialButton 
                        href={`https://linkedin.com/in/${contact.linkedin}`} 
                        icon={Linkedin} 
                        label="LinkedIn"
                        color="bg-gradient-to-br from-blue-600 to-blue-800"
                      />
                    )}
                    {contact.twitter && (
                      <SocialButton 
                        href={`https://twitter.com/${contact.twitter}`} 
                        icon={Twitter} 
                        label="Twitter"
                        color="bg-gradient-to-br from-sky-400 to-sky-600"
                      />
                    )}
                    {contact.website && (
                      <SocialButton 
                        href={contact.website} 
                        icon={Globe} 
                        label="Website"
                        color="bg-gradient-to-br from-emerald-500 to-teal-600"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Bio Section */}
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {profile.bio ? (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-[15px]">
                    {profile.bio}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                      <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">No bio available yet.</p>
                    {isOwnProfile && (
                      <Button variant="link" asChild className="mt-2">
                        <Link href="/profile">Add your bio →</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  {isStudent ? "Skills & Interests" : "Areas of Expertise"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {profile.skills.map((skill: string, index: number) => (
                      <SkillBadge key={index} skill={skill} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                      <Code2 className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">No skills listed yet.</p>
                    {isOwnProfile && (
                      <Button variant="link" asChild className="mt-2">
                        <Link href="/profile">Add your skills →</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
}