import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Package,
  Tent,
  Users,
} from "lucide-react";
import React, { Component } from "react";

import { StepProps } from "./types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventType } from "@/types/trek";

interface ReviewStepProps extends StepProps {
  costs: Array<{ description: string; amount: number }>;
  selectedPackingItems: Set<number>;
  mandatoryPackingItems: Set<number>;
  packingItems: Array<{ id: number; name: string; category: string | null }>;
  imagePreview: string | null;
  gpxFile: File | null;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  costs,
  selectedPackingItems,
  mandatoryPackingItems,
  packingItems,
  imagePreview,
  gpxFile,
}) => {
  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const selectedItems = packingItems.filter((item) =>
    selectedPackingItems.has(item.id),
  );
  const mandatoryItems = packingItems.filter((item) =>
    mandatoryPackingItems.has(item.id),
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Please review all details before creating your{" "}
          {formData.event_type?.toLowerCase()}
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    formData.event_type === EventType.CAMPING
                      ? "default"
                      : "secondary"
                  }
                >
                  {formData.event_type === EventType.CAMPING
                    ? "🏕️ Camping Event"
                    : "🥾 Trek Event"}
                </Badge>
              </div>
              <h4 className="font-semibold text-lg">{formData.name}</h4>
              {formData.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.description}
                </p>
              )}
            </div>

            {imagePreview && (
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-32 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <hr className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {formData.start_datetime && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-muted-foreground">
                    {formatDateTime(formData.start_datetime)}
                  </p>
                </div>
              </div>
            )}

            {formData.end_datetime && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium">End Date</p>
                  <p className="text-muted-foreground">
                    {formatDateTime(formData.end_datetime)}
                  </p>
                </div>
              </div>
            )}

            {formData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{formData.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-muted-foreground">
                  {formData.max_participants} participants
                </p>
              </div>
            </div>
          </div>

          {(formData.category || formData.difficulty) && (
            <>
              <hr className="my-4" />
              <div className="flex gap-4 text-sm">
                {formData.category && (
                  <div>
                    <p className="font-medium">Category</p>
                    <Badge variant="outline">{formData.category}</Badge>
                  </div>
                )}
                {formData.difficulty && (
                  <div>
                    <p className="font-medium">Difficulty</p>
                    <Badge variant="outline">{formData.difficulty}</Badge>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <IndianRupee className="h-4 w-4 mr-2" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Registration Fee per Person</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (refundable)
                </span>
              </div>
              <span className="text-lg font-semibold text-green-600">
                ₹{formData.base_price?.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              This is an advance payment to secure your place. As per our FAQ,
              cancellations 48 hours prior to the event are 100% refundable.
            </p>

            {totalCosts > 0 && (
              <>
                <hr className="my-4" />
                <div className="space-y-2">
                  <p className="font-medium text-sm">Fixed Costs:</p>
                  {costs.map((cost, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {cost.description}
                      </span>
                      <span>₹{cost.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Fixed Costs</span>
                    <span className="text-orange-600">
                      ₹{totalCosts.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Packing List */}
      {selectedPackingItems.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Packing List ({selectedPackingItems.size} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mandatoryItems.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2 text-red-600">
                    Mandatory Items:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mandatoryItems.map((item) => (
                      <Badge
                        key={item.id}
                        variant="destructive"
                        className="text-xs"
                      >
                        {item.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedItems.length > mandatoryItems.length && (
                <div>
                  <p className="font-medium text-sm mb-2 text-blue-600">
                    Optional Items:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedItems
                      .filter((item) => !mandatoryPackingItems.has(item.id))
                      .map((item) => (
                        <Badge
                          key={item.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {item.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camping-specific details */}
      {formData.event_type === EventType.CAMPING && formData.itinerary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Camping Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.itinerary.days?.map((day, index) => (
                <div key={index} className="border-l-4 border-l-blue-500 pl-3">
                  <p className="font-medium">{day.title}</p>
                  {day.accommodation && (
                    <p className="text-sm text-muted-foreground">
                      Accommodation: {day.accommodation}
                    </p>
                  )}
                  {day.activities && day.activities.length > 0 && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Activities:</p>
                      <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                        {day.activities.map((activity, actIndex) => (
                          <li key={actIndex}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Volunteer Roles */}
      {formData.event_type === EventType.CAMPING &&
        formData.volunteer_roles?.roles &&
        formData.volunteer_roles.roles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Volunteer Roles ({formData.volunteer_roles.roles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.volunteer_roles.roles.map((role, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{role.title}</h5>
                      <Badge variant="outline">
                        {role.spots_needed} spot
                        {role.spots_needed !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {role.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {role.description}
                      </p>
                    )}
                    {role.requirements && (
                      <p className="text-xs text-blue-600">
                        Requirements: {role.requirements}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Files */}
      {gpxFile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">GPX Route</Badge>
              <span className="text-muted-foreground">{gpxFile.name}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
