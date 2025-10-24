import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Clock, Users, Tent } from "lucide-react";
import { StepProps } from "./types";
import { useCallback } from "react";

interface CampingDetailsStepProps extends StepProps {
  isLoadingExistingData?: boolean;
}

export const CampingDetailsStep: React.FC<CampingDetailsStepProps> = ({
  formData,
  setFormData,
  errors,
  isLoadingExistingData = false,
}) => {
  // Initialize camping-specific data if not present
  const initializeCampingData = useCallback(() => {
    if (!formData.itinerary) {
      setFormData((prev) => ({
        ...prev,
        itinerary: {
          days: [
            {
              day: 1,
              title: "Day 1",
              activities: [],
              meals: [],
              accommodation: "",
            },
          ],
        },
        activity_schedule: {
          activities: [],
        },
        volunteer_roles: {
          roles: [],
        },
      }));
    }
  }, [formData.itinerary, setFormData]);

  React.useEffect(() => {
    initializeCampingData();
  }, [initializeCampingData]);

  const addDay = () => {
    const currentItinerary = formData.itinerary || { days: [] };
    const newDay = {
      day: currentItinerary.days.length + 1,
      title: `Day ${currentItinerary.days.length + 1}`,
      activities: [],
      meals: [],
      accommodation: "",
    };

    setFormData((prev) => ({
      ...prev,
      itinerary: {
        ...currentItinerary,
        days: [...currentItinerary.days, newDay],
      },
    }));
  };

  const removeDay = (dayIndex: number) => {
    const currentItinerary = formData.itinerary || { days: [] };
    const updatedDays = currentItinerary.days.filter(
      (_, index) => index !== dayIndex,
    );

    setFormData((prev) => ({
      ...prev,
      itinerary: {
        ...currentItinerary,
        days: updatedDays.map((day, index) => ({
          ...day,
          day: index + 1,
          title: `Day ${index + 1}`,
        })),
      },
    }));
  };

  const updateDayField = (dayIndex: number, field: string, value: string) => {
    const currentItinerary = formData.itinerary || { days: [] };
    const updatedDays = [...currentItinerary.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };

    setFormData((prev) => ({
      ...prev,
      itinerary: {
        ...currentItinerary,
        days: updatedDays,
      },
    }));
  };

  const addActivity = (dayIndex: number) => {
    const currentItinerary = formData.itinerary || { days: [] };
    const updatedDays = [...currentItinerary.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: [...(updatedDays[dayIndex].activities || []), ""],
    };

    setFormData((prev) => ({
      ...prev,
      itinerary: {
        ...currentItinerary,
        days: updatedDays,
      },
    }));
  };

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    value: string,
  ) => {
    const currentItinerary = formData.itinerary || { days: [] };
    const updatedDays = [...currentItinerary.days];
    const updatedActivities = [...(updatedDays[dayIndex].activities || [])];
    updatedActivities[activityIndex] = value;
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: updatedActivities,
    };

    setFormData((prev) => ({
      ...prev,
      itinerary: {
        ...currentItinerary,
        days: updatedDays,
      },
    }));
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const currentItinerary = formData.itinerary || { days: [] };
    const updatedDays = [...currentItinerary.days];
    const updatedActivities = (updatedDays[dayIndex].activities || []).filter(
      (_, index) => index !== activityIndex,
    );
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      activities: updatedActivities,
    };

    setFormData((prev) => ({
      ...prev,
      itinerary: {
        ...currentItinerary,
        days: updatedDays,
      },
    }));
  };

  const addVolunteerRole = () => {
    const currentRoles = formData.volunteer_roles || { roles: [] };
    const newRole = {
      title: "",
      description: "",
      requirements: "",
      spots_needed: 1,
    };

    setFormData((prev) => ({
      ...prev,
      volunteer_roles: {
        ...currentRoles,
        roles: [...currentRoles.roles, newRole],
      },
    }));
  };

  const updateVolunteerRole = (
    roleIndex: number,
    field: string,
    value: string | number,
  ) => {
    const currentRoles = formData.volunteer_roles || { roles: [] };
    const updatedRoles = [...currentRoles.roles];
    updatedRoles[roleIndex] = { ...updatedRoles[roleIndex], [field]: value };

    setFormData((prev) => ({
      ...prev,
      volunteer_roles: {
        ...currentRoles,
        roles: updatedRoles,
      },
    }));
  };

  const removeVolunteerRole = (roleIndex: number) => {
    const currentRoles = formData.volunteer_roles || { roles: [] };
    const updatedRoles = currentRoles.roles.filter(
      (_, index) => index !== roleIndex,
    );

    setFormData((prev) => ({
      ...prev,
      volunteer_roles: {
        ...currentRoles,
        roles: updatedRoles,
      },
    }));
  };

  const itinerary = formData.itinerary || { days: [] };
  const volunteerRoles = formData.volunteer_roles || { roles: [] };

  if (isLoadingExistingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading existing camping details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Camping Details</h3>
        <p className="text-sm text-muted-foreground">
          Configure the detailed itinerary and volunteer roles for your camping
          event
        </p>
      </div>

      {/* Itinerary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Daily Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {itinerary.days.map((day, dayIndex) => (
            <Card key={dayIndex} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) =>
                      updateDayField(dayIndex, "title", e.target.value)
                    }
                    className="text-base font-medium bg-transparent border-none outline-none"
                    placeholder={`Day ${day.day}`}
                  />
                  {itinerary.days.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDay(dayIndex)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Accommodation</Label>
                  <Input
                    value={day.accommodation || ""}
                    onChange={(e) =>
                      updateDayField(dayIndex, "accommodation", e.target.value)
                    }
                    placeholder="Where will participants stay this day?"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Activities</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addActivity(dayIndex)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Activity
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(day.activities || []).map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex gap-2">
                        <Input
                          value={activity}
                          onChange={(e) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              e.target.value,
                            )
                          }
                          placeholder="Activity description..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeActivity(dayIndex, activityIndex)
                          }
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addDay} variant="outline" className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Day
          </Button>
        </CardContent>
      </Card>

      {/* Volunteer Roles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Volunteer Roles
            </CardTitle>
            <Button onClick={addVolunteerRole} size="sm">
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Role
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {volunteerRoles.roles.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No volunteer roles added yet</p>
            </div>
          ) : (
            volunteerRoles.roles.map((role, roleIndex) => (
              <Card key={roleIndex} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      value={role.title}
                      onChange={(e) =>
                        updateVolunteerRole(roleIndex, "title", e.target.value)
                      }
                      placeholder="Role title (e.g., Food Coordinator)"
                      className="font-medium"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVolunteerRole(roleIndex)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    value={role.description}
                    onChange={(e) =>
                      updateVolunteerRole(
                        roleIndex,
                        "description",
                        e.target.value,
                      )
                    }
                    placeholder="Role description and responsibilities..."
                    rows={2}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={role.requirements}
                      onChange={(e) =>
                        updateVolunteerRole(
                          roleIndex,
                          "requirements",
                          e.target.value,
                        )
                      }
                      placeholder="Requirements (e.g., cooking experience)"
                    />
                    <Input
                      type="number"
                      min="1"
                      value={role.spots_needed}
                      onChange={(e) =>
                        updateVolunteerRole(
                          roleIndex,
                          "spots_needed",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      placeholder="Spots needed"
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
