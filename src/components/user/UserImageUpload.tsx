import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Upload, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserImageUploadProps {
  trekId: number;
  trekName: string;
  onUploadSuccess?: () => void;
}

export function UserImageUpload({ trekId, trekName, onUploadSuccess }: UserImageUploadProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadSuccess(false);
  }, [previewUrl]);

  const handleSubmit = useCallback(async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      // Upload image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `user-contributions/${trekId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trek-images')
        .upload(filePath, selectedFile, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trek-images')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_trek_images')
        .insert({
          trek_id: trekId,
          uploaded_by: user.id,
          image_url: publicUrl,
          caption: caption.trim() || null,
          status: 'pending',
        });

      if (dbError) {
        // Clean up uploaded file if DB insert fails
        await supabase.storage.from('trek-images').remove([filePath]);
        throw dbError;
      }

      setUploadSuccess(true);
      toast({
        title: 'Image Submitted Successfully',
        description: 'Your photo has been submitted and is pending admin review.',
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Close dialog after a delay
      setTimeout(() => {
        setIsOpen(false);
        setUploadSuccess(false);
      }, 2000);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast({
        title: 'Upload Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [selectedFile, caption, user, trekId, onUploadSuccess]);

  const handleClose = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setIsOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setUploadSuccess(false);
  }, [previewUrl]);

  const canSubmit = selectedFile && !uploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Camera className="w-4 h-4 mr-2" />
          Share Photos
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Photos from "{trekName}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Help us showcase this amazing trek! Upload your photos and they will be reviewed by our team before being added to the gallery.
          </div>

          {uploadSuccess ? (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Photo Submitted Successfully!
                </p>
                <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                  Your photo is pending admin review and will appear in the gallery once approved.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* File Upload Area */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Select Photo</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {previewUrl ? (
                      <div className="space-y-3">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to change photo
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Click to upload a photo</p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <label htmlFor="caption" className="block text-sm font-medium">
                  Caption (Optional)
                </label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption or description for your photo..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={uploading}
                  rows={3}
                />
              </div>

              {/* Guidelines */}
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Photo Guidelines:</p>
                      <ul className="text-xs space-y-1">
                        <li>• High quality, well-lit photos work best</li>
                        <li>• Photos should be from this specific trek</li>
                        <li>• No inappropriate or copyrighted content</li>
                        <li>• Photos will be reviewed before appearing in the gallery</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!canSubmit}>
                  {uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {uploading ? 'Uploading...' : 'Submit Photo'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
