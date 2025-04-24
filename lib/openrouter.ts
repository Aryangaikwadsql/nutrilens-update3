interface FoodAnalysis {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const CACHE = new Map<string, FoodAnalysis>();

export async function analyzeFood(base64Image: string): Promise<FoodAnalysis> {
  let timeout: NodeJS.Timeout | null = null;
  try {
    if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not configured - please add NEXT_PUBLIC_OPENROUTER_API_KEY to your .env.local file");
    }

    // Check cache first
    const cacheKey = base64Image.substring(0, 100); // Use partial image as cache key
    if (CACHE.has(cacheKey)) {
      return CACHE.get(cacheKey)!;
    }

    console.log("Making API request to OpenRouter");
    const controller = new AbortController();
    let timeout: NodeJS.Timeout | null = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      signal: controller.signal,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://nutrilens.vercel.app", // Replace with your actual domain
        "X-Title": "Nutrilens",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku:beta", // Using faster Claude 3 Haiku model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a helpful AI that analyzes images of food.

Your task: Given a food image, identify the exact meal and return detailed nutritional information as a valid JSON object ONLY. 

⚠️ Output ONLY the JSON object. No explanations. No markdown. No extra text.

Use this format exactly:
{
  "name": "Specific Dish Name",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0
}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API request failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    // Validate basic response structure first
    if (!data || typeof data !== 'object') {
      console.error("Invalid API response structure:", data);
      throw new Error("OpenRouter API returned an invalid response - please try again");
    }

    // Handle API errors and rate limiting
    if (data.error) {
      // Safely extract error details without risking crashes
      const errorInfo: {
        message: string;
        code: string | number;
        status: number;
        url: string;
        timestamp: string;
        providerError: null | {[key: string]: any} | {parseError: string};
      } = {
        message: data.error?.message || 'No error message',
        code: data.error?.code || 'No error code',
        status: response?.status || 0,
        url: response?.url || 'Unknown URL',
        timestamp: new Date().toISOString(),
        providerError: null
      };

      try {
        // Attempt to parse nested provider error if it exists
        if (data.error?.metadata?.raw) {
          try {
            errorInfo.providerError = JSON.parse(data.error.metadata.raw)?.error;
          } catch (parseError) {
            errorInfo.providerError = { parseError: 'Failed to parse provider error' };
          }
        }
      } catch (e) {
        console.error("Error processing error details:", e);
      }

      // Log the complete error information safely
      console.error("API Request Failed - Details:", JSON.stringify(errorInfo, null, 2));

      if (errorInfo.code === 402) {
        // Handle insufficient credits error specifically
        alert("API request failed due to insufficient credits. Please check your account and upgrade your plan.");
      }

      // Provide specific guidance based on the error type
      if (errorInfo.providerError && 
          typeof errorInfo.providerError === 'object' &&
          'type' in errorInfo.providerError && 
          'message' in errorInfo.providerError) {
        const providerError = errorInfo.providerError as {type: string, message: string};
        if (providerError.type === 'invalid_request_error' && 
            providerError.message.includes('image')) {
          throw new Error("Invalid image format - please ensure the image is a clear JPEG.");
        }
      }
      
      if (response.status === 429) {
        throw new Error("API rate limit exceeded - please try again later");
      }

      // Parse nested provider error if available
      let providerError = null;
      try {
        if (data.error.metadata?.raw) {
          providerError = JSON.parse(data.error.metadata.raw)?.error;
        }
      } catch (e) {
        console.error("Failed to parse provider error:", e);
      }

      const errorMessage = providerError?.message || data.error.message;
      
      if (providerError?.type === 'invalid_request_error' || 
          errorMessage?.includes('image') || 
          errorMessage?.includes('media type')) {
        throw new Error("Please upload a clear JPEG photo of your food (other formats not supported)");
      } else if (data.error.message?.includes('provider')) {
        throw new Error("Temporary issue with food analysis - please try again in a moment");
      }
      
      throw new Error(`Food analysis failed: ${errorMessage || 'Unknown error'}`);
    }

    if (!data.choices?.[0]?.message?.content) {
      if (data.choices?.[0]?.finish_reason === "length") {
        throw new Error("Response was truncated - please try a simpler request");
      }
      console.error("Malformed API response:", data);
      throw new Error("Received incomplete response from OpenRouter - please try again");
    }

    const content = data.choices[0].message.content;
    console.log("Raw API response content:", content);

    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      if (typeof parsedContent !== 'object' || parsedContent === null) {
        throw new Error("Response was not a JSON object");
      }
    } catch (e) {
      console.error("Invalid JSON from Claude:", content);
      throw new Error("Claude response was not valid JSON.");
    }

    return {
      name: parsedContent.name || "Unknown Food",
      calories: parsedContent.calories || 0,
      protein: parsedContent.protein || 0,
      carbs: parsedContent.carbs || 0,
      fat: parsedContent.fat || 0,
    };
    } catch (error) {
      console.error("Error analyzing food:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Request timed out - please try again");
      }
      throw error;
    } finally {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    }
  }

