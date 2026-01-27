"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mentorOnboardingSchema, MentorOnboardingValues } from "@/schemas/mentor";
import { completeMentorOnboarding } from "@/actions/mentor/index";
import { toast } from "sonner"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MentorOnboarding() {
  const form = useForm<MentorOnboardingValues>({
    resolver: zodResolver(mentorOnboardingSchema) as any,
    defaultValues: {
      full_name: "",
      department: undefined,
      skills: "",
      bio: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: MentorOnboardingValues) {
    try {
      const result = await completeMentorOnboarding(data);
      
      if (result?.error) {
        toast.error("Error", { description: result.error });
      } else {
        toast.success("Welcome Mentor!", { description: "Dashboard ready hai." });
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Mentor Profile</CardTitle>
          <CardDescription>
            Students ko guide karne ke liye apni expertise share karein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Rahul Verma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                        <SelectItem value="IT">Information Tech (IT)</SelectItem>
                        <SelectItem value="ECE">Electronics Communications (ECE)</SelectItem>
                        <SelectItem value="CE">Civil Engineering (CE)</SelectItem>
                        <SelectItem value="ME">Mechanical Engineering (ME)</SelectItem>
                        <SelectItem value="AIDS">Artificial Intelligence and Data Science (AIDS)</SelectItem>
                        <SelectItem value="EE">Electrical Engineering (EE)</SelectItem>
                        <SelectItem value="MECH">Mechatronics (MECH)</SelectItem>
                        <SelectItem value="IP">Industrial and Production Engineering (IP)</SelectItem>
                        <SelectItem value="MATH">Mathematics Dept (MATH)</SelectItem>
                        <SelectItem value="CHEM">Chemistry Dept (CHEM)</SelectItem>
                        <SelectItem value="PHY">Physics Dept (PHY)</SelectItem>
                        <SelectItem value="T&P">Training and Placement Dept (T&P)</SelectItem>
                        {/* Add more as needed */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Skills Input */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills & Expertise</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. AI, Cloud Computing, React (Comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {/* Bio/Experience */}
               <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience / Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe your teaching experience..." 
                        className="resize-none h-24" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Go to Dashboard"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}