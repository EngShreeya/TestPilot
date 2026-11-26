import mongoose from "mongoose";
import Website, {
    WEBSITE_ENVIRONMENTS,
    WEBSITE_STATUSES,
} from "../model/Website.js";
import { AppError } from "../utils/errors.js";

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeAndValidateUrl(rawUrl) {
    if (typeof rawUrl !== "string" || !rawUrl.trim()) {
        return { error: "Website URL is required" };
    }

    const trimmed = rawUrl.trim();
    if (trimmed.length > 2048) {
        return { error: "Website URL cannot exceed 2048 characters" };
    }

    let parsed;
    try {
        parsed = new URL(trimmed);
    } catch {
        return { error: "Please provide a valid URL starting with http:// or https://" };
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { error: "URL must use http:// or https:// protocol" };
    }

    if (!parsed.hostname || !parsed.hostname.includes(".") && parsed.hostname !== "localhost") {
        return { error: "Please provide a valid website hostname" };
    }

    const normalizedPath =
        parsed.pathname === "/" && !parsed.search && !parsed.hash
            ? ""
            : `${parsed.pathname}${parsed.search}${parsed.hash}`;

    return {
        url: `${parsed.origin}${normalizedPath}`,
    };
}

export function validateWebsiteInput(rawInput = {}, { partial = false } = {}) {
    const errors = {};
    const sanitized = {};

    if (!partial || rawInput.name !== undefined) {
        const name = typeof rawInput.name === "string" ? rawInput.name.trim() : "";
        if (!name) {
            errors.name = "Website name is required";
        } else if (name.length < 2 || name.length > 100) {
            errors.name = "Website name must be between 2 and 100 characters";
        } else {
            sanitized.name = name;
        }
    }

    if (!partial || rawInput.url !== undefined) {
        const { url, error } = normalizeAndValidateUrl(rawInput.url);
        if (error) {
            errors.url = error;
        } else {
            sanitized.url = url;
        }
    }

    if (rawInput.description !== undefined) {
        if (typeof rawInput.description !== "string") {
            errors.description = "Description must be text";
        } else {
            const description = rawInput.description.trim();
            if (description.length > 500) {
                errors.description = "Description cannot exceed 500 characters";
            } else {
                sanitized.description = description;
            }
        }
    }

    if (rawInput.environment !== undefined) {
        const env =
            typeof rawInput.environment === "string"
                ? rawInput.environment.trim().toLowerCase()
                : "";
        if (!WEBSITE_ENVIRONMENTS.includes(env)) {
            errors.environment =
                "Environment must be production, staging, or development";
        } else {
            sanitized.environment = env;
        }
    }

    if (rawInput.status !== undefined) {
        const status =
            typeof rawInput.status === "string"
                ? rawInput.status.trim().toLowerCase()
                : "";
        if (!WEBSITE_STATUSES.includes(status)) {
            errors.status = "Status must be active or paused";
        } else {
            sanitized.status = status;
        }
    }

    if (Object.keys(errors).length > 0) {
        const firstMessage = Object.values(errors)[0];
        throw new AppError(400, firstMessage, errors);
    }

    if (partial && Object.keys(sanitized).length === 0) {
        throw new AppError(400, "No valid website fields provided for update");
    }

    return sanitized;
}

function assertValidWebsiteId(websiteId) {
    if (!mongoose.Types.ObjectId.isValid(websiteId)) {
        throw new AppError(400, "Invalid website ID");
    }
}

async function findOwnedWebsiteOrThrow(userId, websiteId) {
    assertValidWebsiteId(websiteId);

    const website = await Website.findById(websiteId);
    if (!website) {
        throw new AppError(404, "Website not found");
    }

    if (website.user.toString() !== userId) {
        throw new AppError(403, "You do not have permission to access this website");
    }

    return website;
}

export async function createWebsite(userId, rawInput) {
    const data = validateWebsiteInput(rawInput, { partial: false });

    const existing = await Website.findOne({ user: userId, url: data.url }).lean();
    if (existing) {
        throw new AppError(409, "You have already added this website URL", {
            url: "This website URL is already registered in your workspace",
        });
    }

    try {
        const website = await Website.create({
            user: userId,
            ...data,
        });
        return website.toSafeWebsite();
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppError(409, "You have already added this website URL", {
                url: "This website URL is already registered in your workspace",
            });
        }
        throw error;
    }
}

export async function listWebsites(userId, query = {}) {
    const filter = { user: userId };

    if (typeof query.status === "string" && WEBSITE_STATUSES.includes(query.status.trim().toLowerCase())) {
        filter.status = query.status.trim().toLowerCase();
    }

    if (
        typeof query.environment === "string" &&
        WEBSITE_ENVIRONMENTS.includes(query.environment.trim().toLowerCase())
    ) {
        filter.environment = query.environment.trim().toLowerCase();
    }

    if (typeof query.search === "string" && query.search.trim()) {
        const pattern = new RegExp(escapeRegex(query.search.trim()), "i");
        filter.$or = [{ name: pattern }, { url: pattern }];
    }

    const [websites, allUserWebsites] = await Promise.all([
        Website.find(filter).sort({ updatedAt: -1, createdAt: -1 }),
        Website.find({ user: userId }).select("status").lean(),
    ]);

    const summary = allUserWebsites.reduce(
        (acc, item) => {
            acc.total += 1;
            if (item.status === "active") acc.active += 1;
            if (item.status === "paused") acc.paused += 1;
            return acc;
        },
        { total: 0, active: 0, paused: 0 }
    );

    return {
        websites: websites.map((site) => site.toSafeWebsite()),
        summary,
    };
}

export async function getWebsiteById(userId, websiteId) {
    const website = await findOwnedWebsiteOrThrow(userId, websiteId);
    return website.toSafeWebsite();
}

export async function updateWebsite(userId, websiteId, rawInput) {
    const updates = validateWebsiteInput(rawInput, { partial: true });
    const website = await findOwnedWebsiteOrThrow(userId, websiteId);

    if (updates.url && updates.url !== website.url) {
        const duplicate = await Website.findOne({
            user: userId,
            url: updates.url,
            _id: { $ne: website._id },
        }).lean();

        if (duplicate) {
            throw new AppError(409, "You have already added this website URL", {
                url: "This website URL is already registered in your workspace",
            });
        }
    }

    Object.assign(website, updates);

    try {
        await website.save();
        return website.toSafeWebsite();
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppError(409, "You have already added this website URL", {
                url: "This website URL is already registered in your workspace",
            });
        }
        throw error;
    }
}

export async function deleteWebsite(userId, websiteId) {
    const website = await findOwnedWebsiteOrThrow(userId, websiteId);
    const deleted = website.toSafeWebsite();
    await website.deleteOne();
    return deleted;
}

