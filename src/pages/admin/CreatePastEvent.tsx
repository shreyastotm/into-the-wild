import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

type Difficulty = "Easy" | "Moderate" | "Hard";

export default function CreatePastEvent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [description, setDescription] = useState("");
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [images, setImages] = useState<(File | null)[]>([null, null, null]);

  const canSubmit = useMemo(() => {
    return !!name && !!location && !!date && !!difficulty;
  }, [name, location, date, difficulty]);

  const onSelectImage = useCallback((idx: number, file: File | null) => {
    setImages((prev) => {
      const next = [...prev];
      next[idx] = file;
      return next;
    });
  }, []);

  async function uploadImageAndGetUrl(
    file: File,
    trekId: number,
    position: number,
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const filePath = `treks/${trekId}/${Date.now()}_${position}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("trek-images")
      .upload(filePath, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabase.storage
      .from("trek-images")
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Compose minimal trek data. Do not add new columns; use route_data for distance.
      const startIso = new Date(`${date}T00:00:00`).toISOString();
      const sanitized = {
        name,
        description,
        location,
        difficulty,
        start_datetime: startIso,
        // Required non-null fields with neutral defaults for archives
        base_price: 0,
        max_participants: 0,
        // Store distance in existing JSONB column
        route_data: distanceKm ? { distance_km: Number(distanceKm) } : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "Archived",
      } as const;

      const { data: created, error: insertErr } = await supabase
        .from("trek_events")
        .insert(sanitized)
        .select("trek_id")
        .single();
      if (insertErr) throw insertErr;
      const trekId = created.trek_id as number;

      // Upload up to 3 images; insert into trek_event_images with ordered positions
      const uploads: Array<Promise<void>> = [];
      images.forEach((file, index) => {
        if (!file) return;
        uploads.push(
          (async () => {
            const url = await uploadImageAndGetUrl(file, trekId, index + 1);
            const { error: imgErr } = await supabase
              .from("trek_event_images")
              .insert({
                trek_id: trekId,
                image_url: url,
                position: index + 1,
              });
            if (imgErr) throw imgErr;
          })(),
        );
      });
      await Promise.all(uploads);

      toast({
        title: "Past Event Created",
        description: "Your past trek has been saved.",
      });
      navigate("/admin/events");
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Failed to create past event";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    name,
    description,
    location,
    difficulty,
    date,
    distanceKm,
    images,
    navigate,
  ]);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Past Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Trek Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Rajmachi Night Trek"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Lonavala, Maharashtra"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                className="w-full border-2 border-input bg-background text-foreground rounded-lg h-11 px-3 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 dark:focus:ring-primary/30 hover:border-primary/50 dark:hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="">Select</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste trek info from WhatsApp group"
              />
            </div>
            <div>
              <Label htmlFor="distance">Trek Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                min="0"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <Label>Image {i + 1}</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      onSelectImage(i, e.target.files?.[0] ?? null)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Cancel
            </Button>
            <Button disabled={!canSubmit || submitting} onClick={handleSubmit}>
              {submitting ? "Saving..." : "Create Past Event"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
