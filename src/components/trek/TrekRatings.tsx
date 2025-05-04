import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Award, 
  Mountain, 
  Heart, 
  Camera, 
  Star, 
  StarHalf, 
  Clock, 
  Users, 
  Clipboard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTrekRatings } from '@/hooks/trek/useTrekRatings';

// Interface for our props
interface TrekRatingsProps {
  trekId?: string;
  isCompleted?: boolean;
}

export const TrekRatings: React.FC<TrekRatingsProps> = ({ 
  trekId: propTrekId,
  isCompleted = false // Only show ratings for completed treks by default
}) => {
  const { id: routeTrekId } = useParams<{ id: string }>();
  const actualTrekId = propTrekId || routeTrekId;
  const { user } = useAuth();
  
  // Use our hook
  const {
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
    refreshRatings
  } = useTrekRatings(actualTrekId);
  
  // Rating form state
  const [showTrekRatingDialog, setShowTrekRatingDialog] = useState(false);
  const [trekRatingForm, setTrekRatingForm] = useState({
    difficulty: myRating?.difficulty_rating || 3,
    enjoyment: myRating?.enjoyment_rating || 3,
    scenic: myRating?.scenic_rating || 3
  });
  
  // Participant rating form state
  const [showParticipantRatingDialog, setShowParticipantRatingDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [participantRatingForm, setParticipantRatingForm] = useState({
    teamwork: 3,
    punctuality: 3,
    contribution: 3,
    comments: ''
  });
  
  const handleTrekRatingChange = (category: string, value: number) => {
    setTrekRatingForm(prev => ({
      ...prev,
      [category]: value
    }));
  };
  
  const handleParticipantRatingChange = (category: string, value: number | string) => {
    setParticipantRatingForm(prev => ({
      ...prev,
      [category]: value
    }));
  };
  
  const handleSubmitTrekRating = async () => {
    if (!user || !actualTrekId) return;
    
    const success = await rateTrek(
      trekRatingForm.difficulty,
      trekRatingForm.enjoyment,
      trekRatingForm.scenic
    );
    
    if (success) {
      setShowTrekRatingDialog(false);
    }
  };
  
  const handleSubmitParticipantRating = async () => {
    if (!user || !actualTrekId || !selectedParticipant) return;
    
    const success = await rateParticipant(
      selectedParticipant,
      participantRatingForm.teamwork,
      participantRatingForm.punctuality,
      participantRatingForm.contribution,
      participantRatingForm.comments
    );
    
    if (success) {
      setShowParticipantRatingDialog(false);
      setSelectedParticipant(null);
      setParticipantRatingForm({
        teamwork: 3,
        punctuality: 3,
        contribution: 3,
        comments: ''
      });
    }
  };
  
  const openParticipantRatingDialog = (participantId: string) => {
    // Check if we've already rated this participant
    const existingRating = participantRatings.find(
      rating => rating.rated_user_id === participantId
    );
    
    if (existingRating) {
      setParticipantRatingForm({
        teamwork: existingRating.teamwork_rating,
        punctuality: existingRating.punctuality_rating,
        contribution: existingRating.contribution_rating,
        comments: existingRating.comments || ''
      });
    } else {
      setParticipantRatingForm({
        teamwork: 3,
        punctuality: 3,
        contribution: 3,
        comments: ''
      });
    }
    
    setSelectedParticipant(participantId);
    setShowParticipantRatingDialog(true);
  };
  
  const renderStarRating = (rating: number, max: number = 5) => {
    const stars = [];
    
    for (let i = 1; i <= max; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<StarHalf key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Trek Ratings</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!isCompleted) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Trek Ratings
        </h3>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Ratings will be available once the trek is completed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Trek Ratings
        </h3>
        <Button 
          onClick={() => setShowTrekRatingDialog(true)} 
          size="sm"
        >
          {hasRated ? 'Update Rating' : 'Rate Trek'}
        </Button>
      </div>
      
      {/* Trek Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Mountain className="h-4 w-4 mr-1 text-blue-600" />
              <span>Difficulty</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{ratingSummary.difficulty}</div>
              <div>{renderStarRating(ratingSummary.difficulty)}</div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              Based on {ratingSummary.totalRatings} {ratingSummary.totalRatings === 1 ? 'rating' : 'ratings'}
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Heart className="h-4 w-4 mr-1 text-red-600" />
              <span>Enjoyment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{ratingSummary.enjoyment}</div>
              <div>{renderStarRating(ratingSummary.enjoyment)}</div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              Based on {ratingSummary.totalRatings} {ratingSummary.totalRatings === 1 ? 'rating' : 'ratings'}
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Camera className="h-4 w-4 mr-1 text-green-600" />
              <span>Scenic Beauty</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{ratingSummary.scenic}</div>
              <div>{renderStarRating(ratingSummary.scenic)}</div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              Based on {ratingSummary.totalRatings} {ratingSummary.totalRatings === 1 ? 'rating' : 'ratings'}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Participant Ratings */}
      <div className="mt-8">
        <Collapsible>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Rate Participants
            </h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            {participants.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No participants available for rating.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants
                  .filter(p => p.id !== user?.id) // Don't show current user
                  .map(participant => {
                    const isRated = participantRatings.some(
                      rating => rating.rated_user_id === participant.id
                    );
                    
                    return (
                      <Card key={participant.id} className={isRated ? 'border-green-100' : ''}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {participant.name 
                                  ? participant.name.substring(0, 2).toUpperCase() 
                                  : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{participant.name || 'Unknown User'}</CardTitle>
                              {isRated && (
                                <CardDescription className="text-green-600">Rated</CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardFooter>
                          <Button 
                            onClick={() => openParticipantRatingDialog(participant.id)}
                            size="sm" 
                            variant={isRated ? "outline" : "default"}
                            className="w-full"
                          >
                            {isRated ? 'Update Rating' : 'Rate Participant'}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* Trek Rating Dialog */}
      <Dialog open={showTrekRatingDialog} onOpenChange={setShowTrekRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hasRated ? 'Update Your Trek Rating' : 'Rate This Trek'}</DialogTitle>
            <DialogDescription>
              Share your experience to help other trekkers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <Mountain className="h-4 w-4 mr-1 text-blue-600" />
                  Difficulty
                </Label>
                <RadioGroup 
                  value={trekRatingForm.difficulty.toString()} 
                  onValueChange={(value) => handleTrekRatingChange('difficulty', parseInt(value))}
                  className="flex justify-between mt-2"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <div key={rating} className="flex flex-col items-center">
                      <RadioGroupItem 
                        value={rating.toString()} 
                        id={`difficulty-${rating}`} 
                        className="sr-only"
                      />
                      <label 
                        htmlFor={`difficulty-${rating}`}
                        className={`cursor-pointer p-2 rounded-full ${trekRatingForm.difficulty === rating ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      >
                        <Star className={`h-6 w-6 ${trekRatingForm.difficulty >= rating ? 'fill-blue-600 text-blue-600' : 'text-gray-300'}`} />
                      </label>
                      <span className="text-xs mt-1">{rating}</span>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-1">
                  1 = Easy, 5 = Very challenging
                </p>
              </div>
              
              <div>
                <Label className="flex items-center">
                  <Heart className="h-4 w-4 mr-1 text-red-600" />
                  Enjoyment
                </Label>
                <RadioGroup 
                  value={trekRatingForm.enjoyment.toString()} 
                  onValueChange={(value) => handleTrekRatingChange('enjoyment', parseInt(value))}
                  className="flex justify-between mt-2"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <div key={rating} className="flex flex-col items-center">
                      <RadioGroupItem 
                        value={rating.toString()} 
                        id={`enjoyment-${rating}`} 
                        className="sr-only"
                      />
                      <label 
                        htmlFor={`enjoyment-${rating}`}
                        className={`cursor-pointer p-2 rounded-full ${trekRatingForm.enjoyment === rating ? 'bg-red-100' : 'hover:bg-gray-100'}`}
                      >
                        <Star className={`h-6 w-6 ${trekRatingForm.enjoyment >= rating ? 'fill-red-600 text-red-600' : 'text-gray-300'}`} />
                      </label>
                      <span className="text-xs mt-1">{rating}</span>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-1">
                  1 = Not enjoyable, 5 = Extremely fun
                </p>
              </div>
              
              <div>
                <Label className="flex items-center">
                  <Camera className="h-4 w-4 mr-1 text-green-600" />
                  Scenic Beauty
                </Label>
                <RadioGroup 
                  value={trekRatingForm.scenic.toString()} 
                  onValueChange={(value) => handleTrekRatingChange('scenic', parseInt(value))}
                  className="flex justify-between mt-2"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <div key={rating} className="flex flex-col items-center">
                      <RadioGroupItem 
                        value={rating.toString()} 
                        id={`scenic-${rating}`} 
                        className="sr-only"
                      />
                      <label 
                        htmlFor={`scenic-${rating}`}
                        className={`cursor-pointer p-2 rounded-full ${trekRatingForm.scenic === rating ? 'bg-green-100' : 'hover:bg-gray-100'}`}
                      >
                        <Star className={`h-6 w-6 ${trekRatingForm.scenic >= rating ? 'fill-green-600 text-green-600' : 'text-gray-300'}`} />
                      </label>
                      <span className="text-xs mt-1">{rating}</span>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-1">
                  1 = Not scenic, 5 = Breathtaking views
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowTrekRatingDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitTrekRating} 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : (hasRated ? 'Update Rating' : 'Submit Rating')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Participant Rating Dialog */}
      <Dialog open={showParticipantRatingDialog} onOpenChange={setShowParticipantRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Participant</DialogTitle>
            <DialogDescription>
              {participants.find(p => p.id === selectedParticipant)?.name || 'Participant'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-purple-600" />
                  Teamwork
                </Label>
                <RadioGroup 
                  value={participantRatingForm.teamwork.toString()} 
                  onValueChange={(value) => handleParticipantRatingChange('teamwork', parseInt(value))}
                  className="flex justify-between mt-2"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <div key={rating} className="flex flex-col items-center">
                      <RadioGroupItem 
                        value={rating.toString()} 
                        id={`teamwork-${rating}`} 
                        className="sr-only"
                      />
                      <label 
                        htmlFor={`teamwork-${rating}`}
                        className={`cursor-pointer p-2 rounded-full ${participantRatingForm.teamwork === rating ? 'bg-purple-100' : 'hover:bg-gray-100'}`}
                      >
                        <Star className={`h-6 w-6 ${participantRatingForm.teamwork >= rating ? 'fill-purple-600 text-purple-600' : 'text-gray-300'}`} />
                      </label>
                      <span className="text-xs mt-1">{rating}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-amber-600" />
                  Punctuality
                </Label>
                <RadioGroup 
                  value={participantRatingForm.punctuality.toString()} 
                  onValueChange={(value) => handleParticipantRatingChange('punctuality', parseInt(value))}
                  className="flex justify-between mt-2"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <div key={rating} className="flex flex-col items-center">
                      <RadioGroupItem 
                        value={rating.toString()} 
                        id={`punctuality-${rating}`} 
                        className="sr-only"
                      />
                      <label 
                        htmlFor={`punctuality-${rating}`}
                        className={`cursor-pointer p-2 rounded-full ${participantRatingForm.punctuality === rating ? 'bg-amber-100' : 'hover:bg-gray-100'}`}
                      >
                        <Star className={`h-6 w-6 ${participantRatingForm.punctuality >= rating ? 'fill-amber-600 text-amber-600' : 'text-gray-300'}`} />
                      </label>
                      <span className="text-xs mt-1">{rating}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label className="flex items-center">
                  <Clipboard className="h-4 w-4 mr-1 text-teal-600" />
                  Contribution
                </Label>
                <RadioGroup 
                  value={participantRatingForm.contribution.toString()} 
                  onValueChange={(value) => handleParticipantRatingChange('contribution', parseInt(value))}
                  className="flex justify-between mt-2"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <div key={rating} className="flex flex-col items-center">
                      <RadioGroupItem 
                        value={rating.toString()} 
                        id={`contribution-${rating}`} 
                        className="sr-only"
                      />
                      <label 
                        htmlFor={`contribution-${rating}`}
                        className={`cursor-pointer p-2 rounded-full ${participantRatingForm.contribution === rating ? 'bg-teal-100' : 'hover:bg-gray-100'}`}
                      >
                        <Star className={`h-6 w-6 ${participantRatingForm.contribution >= rating ? 'fill-teal-600 text-teal-600' : 'text-gray-300'}`} />
                      </label>
                      <span className="text-xs mt-1">{rating}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  value={participantRatingForm.comments}
                  onChange={(e) => handleParticipantRatingChange('comments', e.target.value)}
                  placeholder="Share your thoughts about this participant..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowParticipantRatingDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitParticipantRating} 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 