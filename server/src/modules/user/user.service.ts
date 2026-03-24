import { prisma } from "../../lib/prisma";
import type { UserProfile, UpdateUserProfilePayload } from "./user.interface";

export const userService = {
  /**
   * Get current user's profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      timezone: user.timezone || "UTC",
    };
  },

  /**
   * Update current user's profile
   */
  async updateProfile(
    userId: string,
    payload: UpdateUserProfilePayload
  ): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.name,
        bio: payload.bio,
        website: payload.website,
        timezone: payload.timezone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      timezone: user.timezone || "UTC",
    };
  },

  /**
   * Upload/update user's avatar image
   */
  async updateAvatar(userId: string, imageUrl: string): Promise<UserProfile> {
    // Get the old image to delete from cloudinary if needed
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    // Delete old image from cloudinary if exists and is a cloudinary URL
    if (oldUser?.image && oldUser.image.includes("cloudinary")) {
      try {
        const { deleteFileFromCloudinary } = await import("../../config/cloudinary.config");
        await deleteFileFromCloudinary(oldUser.image);
      } catch (error) {
        console.error("Failed to delete old avatar from cloudinary:", error);
        // Continue with update even if delete fails
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      timezone: user.timezone || "UTC",
    };
  },
};
