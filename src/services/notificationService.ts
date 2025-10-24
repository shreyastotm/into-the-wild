/**
 * Automated Notification Service for Into The Wild
 *
 * This service handles automated trek lifecycle communications including:
 * - T-7, T-3, T-1 day reminders
 * - Registration confirmations
 * - Payment verification notifications
 * - Weather alerts
 * - Post-trek follow-ups
 * - WhatsApp integration
 *
 * @author Into The Wild Development Team
 * @version 1.0.0
 */

import { supabase } from "@/integrations/supabase/client";
import { formatIndianDate, formatCurrency } from "@/utils/indianStandards";
import { logError, createAppError, ErrorCodes } from "@/lib/errorHandling";

export interface TrekEvent {
  trek_id: number;
  name: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
  cost: number;
  difficulty: string;
  max_participants: number;
  current_participants: number;
  status: string;
  pickup_location?: string;
  pickup_time?: string;
  whatsapp_group_link?: string;
  weather_forecast?: string;
}

export interface TrekRegistration {
  registration_id: number;
  user_id: string;
  trek_id: number;
  payment_status: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
    phone_number?: string;
  };
}

export interface NotificationTemplate {
  id: string;
  type:
    | "trek_reminder"
    | "registration_confirmation"
    | "payment_verification"
    | "weather_alert"
    | "post_trek";
  title: string;
  message: string;
  channels: ("in_app" | "email" | "whatsapp" | "sms")[];
  timing: "immediate" | "scheduled";
  priority: "low" | "medium" | "high" | "critical";
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send T-7 day reminder to all registered participants
   */
  async sendT7DayReminder(trek: TrekEvent): Promise<void> {
    try {
      const registrations = await this.getTrekRegistrations(trek.trek_id);

      for (const registration of registrations) {
        if (registration.status !== "confirmed") continue;

        await this.sendNotification({
          user_id: registration.user_id,
          title: `🏔️ ${trek.name} starts in 7 days!`,
          message: this.generateT7DayMessage(trek, registration),
          type: "trek_reminder",
          channels: ["in_app", "whatsapp", "email"],
          priority: "medium",
          trek_id: trek.trek_id,
          scheduled_for: this.getScheduledTime(7), // Send at 9 AM, 7 days before
        });
      }
    } catch (error) {
      logError(error, `T-7 reminder for trek ${trek.trek_id}`);
    }
  }

  /**
   * Send T-3 day reminder with weather update
   */
  async sendT3DayReminder(trek: TrekEvent): Promise<void> {
    try {
      const registrations = await this.getTrekRegistrations(trek.trek_id);

      for (const registration of registrations) {
        if (registration.status !== "confirmed") continue;

        await this.sendNotification({
          user_id: registration.user_id,
          title: `🎒 ${trek.name} starts in 3 days!`,
          message: this.generateT3DayMessage(trek, registration),
          type: "trek_reminder",
          channels: ["in_app", "whatsapp", "email"],
          priority: "high",
          trek_id: trek.trek_id,
          scheduled_for: this.getScheduledTime(3),
        });
      }
    } catch (error) {
      logError(error, `T-3 reminder for trek ${trek.trek_id}`);
    }
  }

  /**
   * Send T-1 day final reminder
   */
  async sendT1DayReminder(trek: TrekEvent): Promise<void> {
    try {
      const registrations = await this.getTrekRegistrations(trek.trek_id);

      for (const registration of registrations) {
        if (registration.status !== "confirmed") continue;

        await this.sendNotification({
          user_id: registration.user_id,
          title: `🌟 ${trek.name} - TOMORROW!`,
          message: this.generateT1DayMessage(trek, registration),
          type: "trek_reminder",
          channels: ["in_app", "whatsapp", "sms"], // Include SMS for critical reminder
          priority: "critical",
          trek_id: trek.trek_id,
          scheduled_for: this.getScheduledTime(1),
        });
      }
    } catch (error) {
      logError(error, `T-1 reminder for trek ${trek.trek_id}`);
    }
  }

  /**
   * Send registration confirmation
   */
  async sendRegistrationConfirmation(
    registration: TrekRegistration,
    trek: TrekEvent,
  ): Promise<void> {
    try {
      await this.sendNotification({
        user_id: registration.user_id,
        title: "Registration Confirmed! 🎒",
        message: this.generateRegistrationConfirmationMessage(
          trek,
          registration,
        ),
        type: "registration_confirmation",
        channels: ["in_app", "whatsapp", "email"],
        priority: "high",
        trek_id: trek.trek_id,
        scheduled_for: new Date(), // Immediate
      });
    } catch (error) {
      logError(
        error,
        `Registration confirmation for user ${registration.user_id}`,
      );
    }
  }

  /**
   * Send payment verification notification
   */
  async sendPaymentVerification(
    registration: TrekRegistration,
    trek: TrekEvent,
  ): Promise<void> {
    try {
      await this.sendNotification({
        user_id: registration.user_id,
        title: "Payment Verified! ✅",
        message: this.generatePaymentVerificationMessage(trek, registration),
        type: "payment_verification",
        channels: ["in_app", "whatsapp", "email"],
        priority: "high",
        trek_id: trek.trek_id,
        scheduled_for: new Date(), // Immediate
      });
    } catch (error) {
      logError(error, `Payment verification for user ${registration.user_id}`);
    }
  }

  /**
   * Send post-trek feedback request (T+1)
   */
  async sendPostTrekFeedback(trek: TrekEvent): Promise<void> {
    try {
      const registrations = await this.getTrekRegistrations(trek.trek_id);

      for (const registration of registrations) {
        if (registration.status !== "completed") continue;

        await this.sendNotification({
          user_id: registration.user_id,
          title: "How was your trek? ⭐",
          message: this.generatePostTrekMessage(trek, registration),
          type: "post_trek",
          channels: ["in_app", "email"],
          priority: "medium",
          trek_id: trek.trek_id,
          scheduled_for: this.getScheduledTime(-1), // 1 day after trek
        });
      }
    } catch (error) {
      logError(error, `Post-trek feedback for trek ${trek.trek_id}`);
    }
  }

  /**
   * Send WhatsApp group invitation
   */
  async sendWhatsAppInvitation(
    registration: TrekRegistration,
    trek: TrekEvent,
  ): Promise<void> {
    try {
      if (!trek.whatsapp_group_link) {
        // Generate WhatsApp group link if not exists
        trek.whatsapp_group_link = await this.generateWhatsAppGroupLink(trek);
      }

      await this.sendNotification({
        user_id: registration.user_id,
        title: "Join Your Trek Group! 📱",
        message: `Connect with fellow trekkers for ${trek.name}.\n\nWhatsApp Group: ${trek.whatsapp_group_link}`,
        type: "trek_reminder",
        channels: ["in_app", "whatsapp"],
        priority: "medium",
        trek_id: trek.trek_id,
        scheduled_for: new Date(),
      });
    } catch (error) {
      logError(error, `WhatsApp invitation for user ${registration.user_id}`);
    }
  }

  /**
   * Core notification sending method
   */
  private async sendNotification(notification: {
    user_id: string;
    title: string;
    message: string;
    type: string;
    channels: string[];
    priority: string;
    trek_id?: number;
    scheduled_for: Date;
  }): Promise<void> {
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: notification.user_id,
        message: notification.message,
        link: notification.trek_id
          ? `/trek/${notification.trek_id}`
          : undefined,
        status: "unread",
        type: notification.type,
        trek_id: notification.trek_id,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw createAppError(error.message, ErrorCodes.SERVER_ERROR);
      }

      // TODO: Implement email and WhatsApp sending
      // await this.sendEmailNotification(notification);
      // await this.sendWhatsAppNotification(notification);
    } catch (error) {
      logError(error, `Sending notification to user ${notification.user_id}`);
      throw error;
    }
  }

  /**
   * Get all confirmed registrations for a trek
   */
  private async getTrekRegistrations(
    trekId: number,
  ): Promise<TrekRegistration[]> {
    try {
      const { data, error } = await supabase
        .from("trek_registrations")
        .select(
          `
          registration_id,
          user_id,
          trek_id,
          payment_status,
          created_at,
          user:users(full_name, email, phone_number)
        `,
        )
        .eq("trek_id", trekId)
        .eq("payment_status", "Verified");

      if (error) {
        throw createAppError(error.message, ErrorCodes.DATABASE_ERROR);
      }

      return data || [];
    } catch (error) {
      logError(error, `Getting registrations for trek ${trekId}`);
      return [];
    }
  }

  /**
   * Generate T-7 day reminder message
   */
  private generateT7DayMessage(
    trek: TrekEvent,
    registration: TrekRegistration,
  ): string {
    return `Hi ${registration.user.full_name}! 👋

Your trek *${trek.name}* starts in *7 days*! 🏔️

📅 ${formatIndianDate(trek.start_datetime)}
⏰ Pickup: ${trek.pickup_time || "To be announced"}
📍 ${trek.pickup_location || trek.location}

*Action Items:*
✅ Upload ID proof (if not done)
✅ Review packing list
✅ Join trek WhatsApp group${trek.whatsapp_group_link ? `\n🔗 ${trek.whatsapp_group_link}` : ""}
✅ Check weather forecast

View full details: [Trek Details]

Questions? Reply to this message!

- Into The Wild Team`;
  }

  /**
   * Generate T-3 day reminder message
   */
  private generateT3DayMessage(
    trek: TrekEvent,
    registration: TrekRegistration,
  ): string {
    return `Hi ${registration.user.full_name}! 🎒

Just *3 days* until your ${trek.name} adventure!

*Weather Update:* ${trek.weather_forecast || "To be updated closer to date"}
*Temperature:* Expected ${this.getTemperatureRange(trek.difficulty)}

*Final Checklist:*
□ Comfortable trekking shoes
□ Warm layers (${this.getLayerRecommendation(trek.difficulty)})
□ Water bottle (2L minimum)
□ Snacks and energy bars
□ First aid kit
□ Fully charged power bank
□ Valid ID proof

*WhatsApp Group:*
${trek.whatsapp_group_link || "Will be shared soon"}

See you soon! 🏔️

- Into The Wild Team`;
  }

  /**
   * Generate T-1 day final reminder message
   */
  private generateT1DayMessage(
    trek: TrekEvent,
    registration: TrekRegistration,
  ): string {
    return `Hi ${registration.user.full_name}! 🌟

*TOMORROW IS THE DAY!* 🎉

Your ${trek.name} trek starts tomorrow!

📍 *Pickup Details:*
⏰ Time: ${trek.pickup_time || "6:00 AM"}
📍 Location: ${trek.pickup_location || trek.location}
🗺️ Map: ${this.generateMapLink(trek.pickup_location || trek.location)}

⚠️ *Important:*
• Arrive 15 minutes early
• Carry valid ID proof
• Emergency contact: ${this.getEmergencyContact()}
• Weather: ${trek.weather_forecast || "Check WhatsApp group for latest updates"}

*Cost Reminder:* ${formatCurrency(trek.cost, "INR")} (Payment verified ✅)

Have an amazing trek! 🏔️

- Into The Wild Team`;
  }

  /**
   * Generate registration confirmation message
   */
  private generateRegistrationConfirmationMessage(
    trek: TrekEvent,
    registration: TrekRegistration,
  ): string {
    return `🎉 Registration Confirmed!

Hi ${registration.user.full_name},

Your spot on *${trek.name}* is secured!

📋 *Registration Details:*
• Registration ID: ${registration.registration_id}
• Trek: ${trek.name}
• Date: ${formatIndianDate(trek.start_datetime)}
• Cost: ${formatCurrency(trek.cost, "INR")}
• Status: Confirmed

📝 *Next Steps:*
1. Complete payment (if pending)
2. Upload ID proof
3. Join WhatsApp group for updates
4. Review packing list

View details: [Trek Details]

Welcome to the Into The Wild family! 🏔️

- Into The Wild Team`;
  }

  /**
   * Generate payment verification message
   */
  private generatePaymentVerificationMessage(
    trek: TrekEvent,
    registration: TrekRegistration,
  ): string {
    return `✅ Payment Verified!

Hi ${registration.user.full_name},

Your payment for *${trek.name}* has been verified!

🎒 *You're all set for:*
• ${trek.name}
• ${formatIndianDate(trek.start_datetime)}
• ${trek.location}

📱 *Join the conversation:*
WhatsApp Group: ${trek.whatsapp_group_link || "Will be shared closer to trek date"}

📋 *Pre-trek checklist:*
• ID proof uploaded ✅
• Payment verified ✅
• Review packing list
• Check weather updates

See you on the trail! 🏔️

- Into The Wild Team`;
  }

  /**
   * Generate post-trek feedback message
   */
  private generatePostTrekMessage(
    trek: TrekEvent,
    registration: TrekRegistration,
  ): string {
    return `Hi ${registration.user.full_name}! 🌟

Hope you had an amazing time on ${trek.name}!

We'd love to hear about your experience:
⭐ Rate the trek: [Rate Trek]
📝 Share detailed feedback: [Write Review]
📸 Share your photos in the group!

Your feedback helps us improve and helps other trekkers choose the right adventures.

Looking forward to seeing you on the next adventure! 🏔️

- Into The Wild Team`;
  }

  /**
   * Generate WhatsApp group link for trek
   */
  private async generateWhatsAppGroupLink(trek: TrekEvent): Promise<string> {
    // In a real implementation, this would create actual WhatsApp groups
    // For now, return a placeholder or integration with WhatsApp Business API
    const groupName = `${trek.name.replace(/\s+/g, "")}_${Date.now()}`;
    return `https://chat.whatsapp.com/${groupName}`;
  }

  /**
   * Get scheduled time for reminders
   */
  private getScheduledTime(daysBefore: number): Date {
    const now = new Date();
    const scheduledTime = new Date(now);

    if (daysBefore > 0) {
      // Before trek (T-7, T-3, T-1)
      scheduledTime.setDate(now.getDate() - daysBefore);
      scheduledTime.setHours(9, 0, 0, 0); // 9 AM
    } else {
      // After trek (T+1, T+3)
      scheduledTime.setDate(now.getDate() - daysBefore);
      scheduledTime.setHours(11, 0, 0, 0); // 11 AM
    }

    return scheduledTime;
  }

  /**
   * Get temperature range based on difficulty
   */
  private getTemperatureRange(difficulty: string): string {
    const ranges = {
      Easy: "15-25°C",
      Moderate: "10-20°C",
      Hard: "5-15°C",
      Expert: "0-10°C",
    };
    return ranges[difficulty as keyof typeof ranges] || "10-20°C";
  }

  /**
   * Get layer recommendation based on difficulty
   */
  private getLayerRecommendation(difficulty: string): string {
    const recommendations = {
      Easy: "1-2 layers",
      Moderate: "2-3 layers",
      Hard: "3-4 layers",
      Expert: "4-5 layers + thermal wear",
    };
    return (
      recommendations[difficulty as keyof typeof recommendations] ||
      "2-3 layers"
    );
  }

  /**
   * Generate Google Maps link for location
   */
  private generateMapLink(location: string): string {
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/?q=${encodedLocation}`;
  }

  /**
   * Get emergency contact number
   */
  private getEmergencyContact(): string {
    // This should come from admin settings or environment variables
    return "+91 98765 43210"; // Placeholder
  }

  /**
   * Process all scheduled notifications (to be called by cron job)
   */
  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();

      // Get all pending notifications that should be sent now
      const { data: notifications, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", now.toISOString())
        .order("scheduled_for", { ascending: true });

      if (error) {
        throw createAppError(error.message, ErrorCodes.DATABASE_ERROR);
      }

      for (const notification of notifications || []) {
        await this.sendNotification({
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.notification_type,
          channels: notification.channels,
          priority: notification.priority,
          trek_id: notification.trek_id,
          scheduled_for: now,
        });

        // Mark as sent
        await supabase
          .from("scheduled_notifications")
          .update({
            status: "sent",
            sent_at: now.toISOString(),
          })
          .eq("id", notification.id);
      }
    } catch (error) {
      logError(error, "Processing scheduled notifications");
    }
  }
}

/**
 * Hook for using notification service in components
 */
export function useNotificationService() {
  const service = NotificationService.getInstance();

  return {
    sendT7DayReminder: (trek: TrekEvent) => service.sendT7DayReminder(trek),
    sendT3DayReminder: (trek: TrekEvent) => service.sendT3DayReminder(trek),
    sendT1DayReminder: (trek: TrekEvent) => service.sendT1DayReminder(trek),
    sendRegistrationConfirmation: (
      registration: TrekRegistration,
      trek: TrekEvent,
    ) => service.sendRegistrationConfirmation(registration, trek),
    sendPaymentVerification: (
      registration: TrekRegistration,
      trek: TrekEvent,
    ) => service.sendPaymentVerification(registration, trek),
    sendPostTrekFeedback: (trek: TrekEvent) =>
      service.sendPostTrekFeedback(trek),
    sendWhatsAppInvitation: (registration: TrekRegistration, trek: TrekEvent) =>
      service.sendWhatsAppInvitation(registration, trek),
    processScheduledNotifications: () =>
      service.processScheduledNotifications(),
  };
}
