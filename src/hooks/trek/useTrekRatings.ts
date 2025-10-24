import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

export interface TrekRating {
  id: number;
  trek_id: number;
  user_id: string;
  difficulty_rating: number;
  enjoyment_rating: number;
  scenic_rating: number;
  created_at: string;
}

export interface RatingSummary {
  difficulty: number;
  enjoyment: number;
  scenic: number;
  totalRatings: number;
}

export interface ParticipantRating {
  id: number;
  trek_id: number;
  rated_user_id: string;
  rated_by_user_id: string;
  teamwork_rating: number;
  punctuality_rating: number;
  contribution_rating: number;
  comments: string | null;
  created_at: string;
}

export function useTrekRatings(trekId: string | undefined) {
  const { user } = useAuth();
  const [myRating, setMyRating] = useState<TrekRating | null>(null);
  const [allRatings, setAllRatings] = useState<TrekRating[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    difficulty: 0,
    enjoyment: 0,
    scenic: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [participants, setParticipants] = useState<
    { id: string; name: string | null }[]
  >([]);
  const [participantRatings, setParticipantRatings] = useState<
    ParticipantRating[]
  >([]);

  useEffect(() => {
    if (trekId) {
      fetchTrekRatings();
      fetchParticipants();
      fetchParticipantRatings();
    }
  }, [
    trekId,
    user,
    fetchTrekRatings,
    fetchParticipants,
    fetchParticipantRatings,
  ]);

  const fetchTrekRatings = useCallback(async () => {
    if (!trekId) return;

    setLoading(true);
    try {
      // Fetch all ratings
      const { datatrek_ratings } = await supabase
        .from('"*"')
        .select($3)
        .eq("trek_id", trekId) as any;

      if (error) throw error;

      setAllRatings(data || []);

      // Calculate rating summary
      if (data && data.length > 0) {
        const summary = data.reduce(
          (acc, rating) => {
            acc.difficulty += rating.difficulty_rating || 0;
            acc.enjoyment += rating.enjoyment_rating || 0;
            acc.scenic += rating.scenic_rating || 0;
            acc.totalRatings++;
            return acc;
          },
          { difficulty: 0, enjoyment: 0, scenic: 0, totalRatings: 0 },
        );

        // Calculate averages
        if (summary.totalRatings > 0) {
          summary.difficulty =
            Math.round((summary.difficulty / summary.totalRatings) * 10) / 10;
          summary.enjoyment =
            Math.round((summary.enjoyment / summary.totalRatings) * 10) / 10;
          summary.scenic =
            Math.round((summary.scenic / summary.totalRatings) * 10) / 10;
        }

        setRatingSummary(summary);
      }

      // Check if user has already rated
      if (user) {
        const userRating = data?.find((rating) => rating.user_id === user.id);
        setMyRating(userRating || null);
        setHasRated(!!userRating);
      }
    } catch (error) {
      console.error("Error fetching trek ratings:", error);
      toast({
        title: "Error loading ratings",
        description: "Unable to load trek ratings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [trekId, user]);

  const fetchParticipants = useCallback(async () => {
    if (!trekId) return;

    try {
      const { data, error } = await supabase
        .from("trek_registrations")
        .select("user_id, users(user_id, full_name)")
        .eq("trek_id", trekId)
        .not("payment_status", "eq", "Cancelled") as any;

      if (error) throw error;

      const participantsList = (data || []).map((registration) => ({
        id: registration.user_id,
        name: registration.users?.full_name || null,
      }));

      setParticipants(participantsList);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  }, [trekId]);

  const fetchParticipantRatings = useCallback(async () => {
    if (!trekId || !user) return;

    try {
      // Fetch ratings given by the current user
      const { datatrek_participant_ratings } = await supabase
        .from('"*"')
        .select($3)
        .eq("trek_id", trekId)
        .eq("rated_by_user_id", user.id) as any;

      if (error) throw error;

      setParticipantRatings(data || []);
    } catch (error) {
      console.error("Error fetching participant ratings:", error);
    }
  }, [trekId, user]);

  const rateTrek = async (
    difficultyRating: number,
    enjoymentRating: number,
    scenicRating: number,
  ): Promise<boolean> => {
    if (!user || !trekId) return false;

    setSubmitting(true);
    try {
      const ratingData = {
        trek_id: parseInt(trekId),
        user_id: user.id,
        difficulty_rating: difficultyRating,
        enjoyment_rating: enjoymentRating,
        scenic_rating: scenicRating,
      };

      if (hasRated && myRating) {
        // Update existing rating
        const { error } = await supabase
        .from("trek_ratings")
        .update(ratingData)
        .eq("id", myRating.id) as any;

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
        .from("trek_ratings")
        .insert(ratingData) as any;

        if (error) throw error;
      }

      toast({
        title: hasRated ? "Rating updated" : "Rating submitted",
        description: hasRated
          ? "Your rating has been updated"
          : "Thank you for rating this trek",
        variant: "default",
      });

      await fetchTrekRatings();
      return true;
    } catch (error) {
      console.error("Error submitting trek rating:", error);
      toast({
        title: "Rating failed",
        description: "Unable to submit your rating",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const rateParticipant = async (
    ratedUserId: string,
    teamworkRating: number,
    punctualityRating: number,
    contributionRating: number,
    comments?: string,
  ): Promise<boolean> => {
    if (!user || !trekId) return false;

    // Don't allow rating yourself
    if (user.id === ratedUserId) {
      toast({
        title: "Cannot rate yourself",
        description: "You cannot rate your own participation",
        variant: "destructive",
      });
      return false;
    }

    setSubmitting(true);
    try {
      // Check if already rated this participant
      const existingRating = participantRatings.find(
        (rating) => rating.rated_user_id === ratedUserId,
      );

      const ratingData = {
        trek_id: parseInt(trekId),
        rated_user_id: ratedUserId,
        rated_by_user_id: user.id,
        teamwork_rating: teamworkRating,
        punctuality_rating: punctualityRating,
        contribution_rating: contributionRating,
        comments: comments || null,
      };

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
        .from("trek_participant_ratings")
        .update(ratingData)
        .eq("id", existingRating.id) as any;

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
        .from("trek_participant_ratings")
        .insert(ratingData) as any;

        if (error) throw error;
      }

      toast({
        title: existingRating ? "Rating updated" : "Rating submitted",
        description: existingRating
          ? "Your rating has been updated"
          : "Thank you for rating this participant",
        variant: "default",
      });

      await fetchParticipantRatings();
      return true;
    } catch (error) {
      console.error("Error submitting participant rating:", error);
      toast({
        title: "Rating failed",
        description: "Unable to submit your rating",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    myRating,
    allRatings,
    ratingSummary,
    hasRated,
    participants,
    participantRatings,
    loading,
    submitting,
    rateTrek,
    rateParticipant,
    refreshRatings: fetchTrekRatings,
    refreshParticipantRatings: fetchParticipantRatings,
  };
}
