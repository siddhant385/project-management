"use server";

import { geminiModel } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------
// 1. GENERATE PROJECT DESCRIPTION
// ---------------------------------------------------------
export async function generateProjectDescription(
  title: string,
  skills: string[],
  category: string,
  difficulty: string
): Promise<{ description: string | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { description: null, error: "Unauthorized" };
    }

    const prompt = `You are a project description writer for an academic project management system at an engineering college.

Generate a professional, detailed project description for the following project:

Title: ${title}
Category: ${category}
Difficulty Level: ${difficulty}
Required Skills: ${skills.join(", ")}

Requirements for the description:
1. Start with a brief overview (2-3 sentences)
2. Include the project objectives (3-4 bullet points)
3. Mention the expected outcomes
4. Keep it professional but engaging
5. Total length should be 150-200 words
6. Don't include the title in the description
7. Don't use markdown formatting, just plain text with line breaks

Write the description now:`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const description = response.text();

    return { description, error: null };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { 
      description: null, 
      error: "Failed to generate description. Please try again." 
    };
  }
}

// ---------------------------------------------------------
// 2. GENERATE TASK SUGGESTIONS (Updated with Milestone Support)
// ---------------------------------------------------------
export interface SuggestedTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedDays: number;
}

export async function generateTaskSuggestions(
  projectTitle: string,
  projectDescription: string,
  existingTasks: string[],
  numberOfTasks: number = 5,
  milestoneContext?: { title: string; description: string } | null // 👈 NEW Parameter added
): Promise<{ tasks: SuggestedTask[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { tasks: null, error: "Unauthorized" };
    }

    const existingTasksText = existingTasks.length > 0 
      ? `\nExisting tasks (don't repeat these): ${existingTasks.join(", ")}`
      : "";

    let prompt = "";

    // 👇 LOGIC: Agar Milestone selected hai, to specific prompt, nahi to general prompt
    if (milestoneContext) {
      prompt = `You are a project planning assistant for an engineering college project management system.

Generate ${numberOfTasks} specific tasks to complete the following TARGET MILESTONE:

🎯 TARGET MILESTONE: "${milestoneContext.title}"
Milestone Description: ${milestoneContext.description || "N/A"}

Project Context:
Project Title: ${projectTitle}
Project Description: ${projectDescription}
${existingTasksText}

Requirements:
1. Tasks MUST be directly related to completing the selected milestone.
2. Tasks should be specific, actionable, and technical if needed.
3. Include a mix of priorities (low, medium, high).
4. Estimate realistic days (within the milestone's scope).

Respond ONLY in valid JSON with this structure:
{
  "tasks": [
    {
      "title": "Task title here",
      "description": "Brief task description",
      "priority": "medium",
      "estimatedDays": 3
    }
  ]
}`;
    } else {
      // 🟢 OLD LOGIC (General Project Tasks)
      prompt = `You are a project planning assistant for an engineering college project management system.

Generate ${numberOfTasks} task suggestions for the following project:

Project Title: ${projectTitle}
Project Description: ${projectDescription}
${existingTasksText}

Requirements:
1. Each task should be specific and actionable.
2. Tasks should follow a logical sequence for project completion.
3. Include a mix of priorities (low, medium, high).
4. Estimate realistic days for each task (1-14 days range).

Respond ONLY in valid JSON with this structure:
{
  "tasks": [
    {
      "title": "Task title here",
      "description": "Brief task description",
      "priority": "medium",
      "estimatedDays": 3
    }
  ]
}`;
    }

    // FIX: Using generationConfig to force JSON
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const text = response.text();
    
    let parsed = null;
    
    try {
      // Clean up markdown just in case (e.g. ```json ... ```) 
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error raw text:", text);
      return { tasks: null, error: "Invalid response format from AI" };
    }

    if (!parsed || !parsed.tasks) {
      return { tasks: null, error: "Invalid data structure received" };
    }

    // Validate and sanitize tasks
    const tasks: SuggestedTask[] = parsed.tasks.map((task: any) => ({
      title: String(task.title).slice(0, 100),
      description: String(task.description).slice(0, 500),
      priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium",
      estimatedDays: Math.min(Math.max(Number(task.estimatedDays) || 3, 1), 30),
    }));

    return { tasks, error: null };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { 
      tasks: null, 
      error: "Failed to generate tasks. Please try again." 
    };
  }
}

// export interface SuggestedTask {
//   title: string;
//   description: string;
//   priority: "low" | "medium" | "high";
//   estimatedDays: number;
// }

// export async function generateTaskSuggestions(
//   projectTitle: string,
//   projectDescription: string,
//   existingTasks: string[],
//   numberOfTasks: number = 5
// ): Promise<{ tasks: SuggestedTask[] | null; error: string | null }> {
//   try {
//     const supabase = await createClient();
//     const { data: { user } } = await supabase.auth.getUser();
    
//     if (!user) {
//       return { tasks: null, error: "Unauthorized" };
//     }

//     const existingTasksText = existingTasks.length > 0 
//       ? `\nExisting tasks (don't repeat these): ${existingTasks.join(", ")}`
//       : "";

//     const prompt = `You are a project planning assistant for an engineering college project management system.

// Generate ${numberOfTasks} task suggestions for the following project:

// Project Title: ${projectTitle}
// Project Description: ${projectDescription}
// ${existingTasksText}

// Requirements:
// 1. Each task should be specific and actionable
// 2. Tasks should follow a logical sequence for project completion
// 3. Include a mix of priorities (low, medium, high)
// 4. Estimate realistic days for each task (1-14 days range)

// Respond ONLY in valid JSON with this structure:
// {
//   "tasks": [
//     {
//       "title": "Task title here",
//       "description": "Brief task description",
//       "priority": "medium",
//       "estimatedDays": 3
//     }
//   ]
// }`;

//     // FIX: Using generationConfig to force JSON
//     const result = await geminiModel.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       generationConfig: {
//         responseMimeType: "application/json",
//       },
//     });

//     const response = result.response;
//     const text = response.text();
    
//     let parsed = null;
    
//     try {
//       // Clean up markdown just in case (e.g. ```json ... ```) 
//       // although strict JSON mode usually handles it, this is a safety net.
//       const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
//       parsed = JSON.parse(cleanText);
//     } catch (e) {
//       console.error("JSON Parse Error raw text:", text);
//       return { tasks: null, error: "Invalid response format from AI" };
//     }

//     if (!parsed || !parsed.tasks) {
//       return { tasks: null, error: "Invalid data structure received" };
//     }

//     // Validate and sanitize tasks
//     const tasks: SuggestedTask[] = parsed.tasks.map((task: any) => ({
//       title: String(task.title).slice(0, 100),
//       description: String(task.description).slice(0, 500),
//       priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium",
//       estimatedDays: Math.min(Math.max(Number(task.estimatedDays) || 3, 1), 30),
//     }));

//     return { tasks, error: null };
//   } catch (error) {
//     console.error("AI Generation Error:", error);
//     return { 
//       tasks: null, 
//       error: "Failed to generate tasks. Please try again." 
//     };
//   }
// }

// ---------------------------------------------------------
// 3. GENERATE PROJECT RECOMMENDATIONS FOR STUDENTS
// ---------------------------------------------------------


export interface ProjectRecommendation {
  projectId: string;
  matchScore: number;
  reason: string;
}

export async function getProjectRecommendations(
  studentSkills: string[],
  studentInterests: string[],
  availableProjects: Array<{
    id: string;
    title: string;
    description: string;
    skills_required: string[];
    category: string;
  }>,
  limit: number = 5
): Promise<{ recommendations: ProjectRecommendation[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { recommendations: null, error: "Unauthorized" };
    }

    if (availableProjects.length === 0) {
      return { recommendations: [], error: null };
    }

    const projectsText = availableProjects.map((p, i) => 
      `${i + 1}. ID: ${p.id}\n   Title: ${p.title}\n   Skills: ${p.skills_required.join(", ")}\n   Category: ${p.category}`
    ).join("\n\n");

    const prompt = `You are a project recommendation system for engineering students.

Student Profile:
- Skills: ${studentSkills.join(", ") || "Not specified"}
- Interests: ${studentInterests.join(", ") || "Not specified"}

Available Projects:
${projectsText}

Analyze and recommend the top ${Math.min(limit, availableProjects.length)} most suitable projects for this student.
Consider skill match, learning opportunity, and interest alignment.

Respond ONLY in valid JSON with this structure:
{
  "recommendations": [
    {
      "projectId": "actual-project-id-here",
      "matchScore": 85,
      "reason": "Brief reason why this project is recommended"
    }
  ]
}`;

    // FIX: Using generationConfig to force JSON
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const text = response.text();
    
    let parsed = null;
    
    try {
      // Clean up markdown wrapper if present
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error raw text:", text);
      return { recommendations: null, error: "Failed to parse AI response" };
    }

    if (!parsed || !parsed.recommendations) {
      return { recommendations: null, error: "Invalid AI response structure" };
    }

    // Validate project IDs exist
    const validProjectIds = new Set(availableProjects.map(p => p.id));
    const recommendations: ProjectRecommendation[] = parsed.recommendations
      .filter((rec: any) => validProjectIds.has(rec.projectId))
      .map((rec: any) => ({
        projectId: rec.projectId,
        matchScore: Math.min(Math.max(Number(rec.matchScore) || 50, 0), 100),
        reason: String(rec.reason).slice(0, 200),
      }));

    return { recommendations, error: null };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { 
      recommendations: null, 
      error: "Failed to generate recommendations. Please try again." 
    };
  }
}

// ---------------------------------------------------------
// 4. GENERATE MILESTONE SUGGESTIONS (New Feature)
// ---------------------------------------------------------
export interface SuggestedMilestone {
  title: string;
  description: string;
  estimatedDaysFromNow: number; // AI batayega ki ye milestone start hone ke kitne din baad khatam hona chahiye
}

export async function generateMilestoneSuggestions(
  projectTitle: string,
  projectDescription: string,
  existingMilestones: string[],
  numberOfMilestones: number = 5
): Promise<{ milestones: SuggestedMilestone[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { milestones: null, error: "Unauthorized" };
    }

    const existingText = existingMilestones.length > 0 
      ? `\nExisting milestones (don't repeat these): ${existingMilestones.join(", ")}`
      : "";

    const prompt = `You are a project manager for an engineering college project.

Generate ${numberOfMilestones} major milestones for the following project:

Project Title: ${projectTitle}
Project Description: ${projectDescription}
${existingText}

Requirements:
1. Milestones should represent major phases (e.g., "Requirement Gathering", "Prototype Development", "Final Testing").
2. They should follow a chronological order.
3. Estimate "estimatedDaysFromNow" as a cumulative number (e.g., Milestone 1 ends on day 10, Milestone 2 ends on day 25).

Respond ONLY in valid JSON with this structure:
{
  "milestones": [
    {
      "title": "Milestone Title",
      "description": "Brief description of goals",
      "estimatedDaysFromNow": 14
    }
  ]
}`;

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const text = response.text();
    
    let parsed = null;
    try {
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {
      return { milestones: null, error: "Invalid response format from AI" };
    }

    if (!parsed || !parsed.milestones) {
      return { milestones: null, error: "Invalid data structure received" };
    }

    // Validate data
    const milestones: SuggestedMilestone[] = parsed.milestones.map((m: any) => ({
      title: String(m.title).slice(0, 100),
      description: String(m.description).slice(0, 500),
      estimatedDaysFromNow: Number(m.estimatedDaysFromNow) || 7,
    }));

    return { milestones, error: null };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { 
      milestones: null, 
      error: "Failed to generate milestones. Please try again." 
    };
  }
}