/**
 * Centralized image storage utility for trek event images
 * Handles upload, URL conversion, and deletion for trek-assets bucket
 */

import { supabase } from "@/integrations/supabase/client";

// Constants
export const TREK_ASSETS_BUCKET = "trek-assets";
export const TREK_IMAGES_BUCKET = "trek-images"; // Legacy bucket for existing images
export const TREK_IMAGE_PATH_PREFIX = "treks/";

/**
 * Uploads a trek image to storage and returns the full public URL
 * @param file - The image file to upload
 * @param trekId - The trek ID this image belongs to
 * @param position - The position/order of this image (1-5)
 * @returns Promise resolving to the full public URL of the uploaded image
 */
export async function uploadTrekImage(
  file: File,
  trekId: number,
  position: number,
): Promise<string> {
  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const filePath = `${TREK_IMAGE_PATH_PREFIX}${trekId}/${timestamp}_${position}.${fileExt}`;

    // Upload to trek-assets bucket
    const { error: uploadError } = await supabase.storage
      .from(TREK_ASSETS_BUCKET)
      .upload(filePath, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(TREK_ASSETS_BUCKET)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded image");
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadTrekImage:", error);
    throw error;
  }
}

/**
 * Converts an image URL (storage path or public URL) to a valid public URL
 * Handles multiple formats:
 * - Full public URLs (http/https) - returns as-is (uses the bucket the URL points to)
 * - Storage paths (treks/..., trek-assets/..., trek-images/...) - converts to public URL using appropriate bucket
 * @param imageUrl - The image URL or storage path
 * @returns The public URL, or empty string if invalid
 */
export function getTrekImageUrl(imageUrl: string): string {
  if (!imageUrl || imageUrl.trim() === "") {
    return "";
  }

  const trimmedUrl = imageUrl.trim();

  // If it's already a full URL (http/https), return as-is
  // Don't migrate buckets - files may still be in old bucket
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // If it's a storage path, convert to public URL using the appropriate bucket
  if (
    trimmedUrl.startsWith("treks/") ||
    trimmedUrl.startsWith("trek-assets/") ||
    trimmedUrl.startsWith("trek-images/")
  ) {
    let path = trimmedUrl;
    let bucketToUse = TREK_ASSETS_BUCKET; // Default to trek-assets for new uploads

    // Determine which bucket to use based on path prefix
    if (trimmedUrl.startsWith("trek-assets/")) {
      path = trimmedUrl.replace("trek-assets/", "");
      bucketToUse = TREK_ASSETS_BUCKET;
    } else if (trimmedUrl.startsWith("trek-images/")) {
      path = trimmedUrl.replace("trek-images/", "");
      bucketToUse = TREK_IMAGES_BUCKET; // Use old bucket for old paths
    } else if (trimmedUrl.startsWith("treks/")) {
      // treks/ prefix goes to trek-assets bucket (new standard)
      path = trimmedUrl;
      bucketToUse = TREK_ASSETS_BUCKET;
    }

    try {
      const { data } = supabase.storage.from(bucketToUse).getPublicUrl(path);

      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } catch (error) {
      console.warn("Error getting public URL for image:", trimmedUrl, error);
      return "";
    }
  }

  // Return as is (might be a relative path or other format)
  return trimmedUrl;
}

/**
 * Deletes a trek image from storage
 * Extracts the storage path from the public URL and deletes it from the appropriate bucket
 * @param imageUrl - The public URL of the image to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteTrekImage(imageUrl: string): Promise<void> {
  if (!imageUrl || imageUrl.trim() === "") {
    throw new Error("Invalid image URL provided");
  }

  try {
    // Extract path and determine bucket from public URL
    let path = imageUrl;
    let bucketToUse = TREK_ASSETS_BUCKET;

    // If it's a public URL, extract the path and bucket
    if (imageUrl.includes("/storage/v1/object/public/")) {
      // Extract bucket name and path
      const match = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
      if (match && match[1] && match[2]) {
        bucketToUse = match[1]; // Use the bucket from the URL
        path = decodeURIComponent(match[2]);
      } else {
        throw new Error("Could not extract path from public URL");
      }
    } else if (imageUrl.startsWith("trek-assets/")) {
      path = imageUrl.replace("trek-assets/", "");
      bucketToUse = TREK_ASSETS_BUCKET;
    } else if (imageUrl.startsWith("trek-images/")) {
      path = imageUrl.replace("trek-images/", "");
      bucketToUse = TREK_IMAGES_BUCKET;
    } else if (imageUrl.startsWith("treks/")) {
      path = imageUrl;
      bucketToUse = TREK_ASSETS_BUCKET;
    } else {
      // If it doesn't match any pattern, assume it's already a path
      path = imageUrl;
    }

    // Delete from the appropriate bucket
    const { error } = await supabase.storage.from(bucketToUse).remove([path]);

    if (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteTrekImage:", error);
    throw error;
  }
}

