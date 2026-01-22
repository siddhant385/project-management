"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentOnboardingSchema, StudentOnboardingValues } from "@/schemas/student";
import { completeStudentOnboarding } from "@/actions/student/index";
import { toast } from "sonner"; // 👈 Sonner import

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

export default function StudentOnboarding() {
  const form = useForm<StudentOnboardingValues>({
    resolver: zodResolver(studentOnboardingSchema),
    defaultValues: {
      full_name: "",
      department: undefined,
      roll_number: "",
      admission_year: new Date().getFullYear(),
      bio: "",
    },
  });

  // Loading state form ke andar hi hota hai
  const { isSubmitting } = form.formState;

  async function onSubmit(data: StudentOnboardingValues) {
    try {
      const result = await completeStudentOnboarding(data);
      
      if (result?.error) {
        toast.error("Error", {
          description: result.error,
        });
      } else {
        toast.success("Profile Updated!", {
          description: "Redirecting you to Dashboard...",
        });
        // Redirect server action sambhal lega
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Student Setup</CardTitle>
          <CardDescription>
            Please fill your academic details so that we can complete your onboarding journey.
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
                      <Input placeholder="Aditya Kumar" {...field} />
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
                          <SelectValue placeholder="Branch select karo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/*["CSE", "ECE", "ME", "CE", "IT", "AIDS", "EE", "IP", "MATH", "CHEM", "PHY", "T&P"]*/}
                        <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                        <SelectItem value="IT">Information Tech (IT)</SelectItem>
                        <SelectItem value="ECE">Electronics (ECE)</SelectItem>
                        <SelectItem value="ME">Mechanical (ME)</SelectItem>
                        <SelectItem value="CE">Civil (CE)</SelectItem>
                        <SelectItem value="AIDS">Artificial Intelligence and Data Science (AIDS)</SelectItem>
                        <SelectItem value="EE">Electrical (EE)</SelectItem>
                        <SelectItem value="IP">Industrial Production (IP)</SelectItem>
                        <SelectItem value="MECH">Mechatronics (MECH) </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Roll Number */}
                <FormField
                  control={form.control}
                  name="roll_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll No.</FormLabel>
                      <FormControl>
                        <Input placeholder="20XX001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Admission Year */}
                <FormField
                  control={form.control}
                  name="admission_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               {/* Bio */}
               <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Apne coding interests ke baare mein batao..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}