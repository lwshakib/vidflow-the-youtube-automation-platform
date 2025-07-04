export const SCRIPT_GENERATE_PROMPT = `Generate two distinct, high-quality scripts on the topic of {{TOPIC}}. Each script should be tailored for a 30-second video and must hook the viewer immediately with a surprising fact, common myth, shocking truth, or bold question. The tone should be concise, engaging, and informative — ideal for short-form video, presentations, or social media content. Focus on storytelling or curiosity gaps to retain attention. Do not include hashtags, markdown, or emojis. Format the response strictly as follows:
{ "scripts": [ { "content": "Script 1 text only." }, { "content": "Script 2 text only." } ] }
Do not include any commentary or explanation outside of the JSON structure. Only include plain, clean text in the content fields.`;
export const IMAGE_PROMPT_SCRIPT = `
Generate detailed image prompts in the {{STYLE}} style for each key scene of a 30-second video.

Script: {{SCRIPT}}

Instructions:
- Focus solely on generating specific image prompts based on the narrative.
- Do NOT include camera angles or cinematographic terminology.
- Ensure each image prompt is vivid, descriptive, and reflects the emotional tone and setting of the scene.
- Return a maximum of 4 to 5 image prompts following the JSON schema below.
- Don't change the script
- Don't use the texts like Opening Scene, Closing Scene etc.

Schema:
[
  {
    "imagePrompt": "<Detailed visual description in the chosen style>",
    "sceneContent": "<The corresponding scene or moment from the script>"
  }
]
`;

export const YOUTUBE_METADATA_GENERATE_SCRIPT = `
I will provide a script or content. Based on that content, generate the following SEO metadata in JSON format:

{
  "title": "",
  "description": "",
  "tags": ["tag1", "tag2", "..."]
}

Instructions:
1. The title should be SEO-friendly, clear, and attention-grabbing (max 60 characters).
2. The description should summarize the main point, be compelling, and include important keywords (between 120–160 characters).
3. Generate 10 to 12 relevant tags that would help in ranking this content for search engines and social media platforms.

Content:
{{SCRIPT}}

`;

export const YOUTUBE_CHANNEL_NAME_DESCRIPTION_SUGGESTION = `
Generate 5 to 7 unique and creative YouTube channel ideas based on the following categories: {{CATEGORIES}}. Each idea must be original and not currently in active use on YouTube. The names should be brandable, memorable, and clearly relevant to the given categories. For each idea, return the result in the following JSON array format:

[
  {
    "channelName": "Name of the Channel",
    "channelDescription": "Description for the channel (2–4 sentences summarizing content style, niche, and value)"
  }
]

Each channel description should be professional, keyword-optimized for SEO, and include what kind of content viewers can expect (e.g., tutorials, reviews, explainers, fintech trends, startup case studies, etc.). Ensure the channel names are easy to pronounce, unique, and suitable for a global audience.


`;

export const YOUTUBE_CHANNEL_LOGO = `
Design a high-quality, modern logo for a youtube channel named '{{N}}'. The logo should visually reflect the channel's theme and core message, which is: '{{D}}'. Use a sleek, minimalistic, and professional style with a strong emphasis on digital branding. Incorporate elements or icons that symbolically represent the description. The design should be eye-catching, versatile across platforms, and optimized for circular display. Include bold colors, clean lines, and ensure high contrast for visibility on YouTube. 

Most Important --->> No text in the logo — only symbolic or abstract elements inspired by the theme.
`;
