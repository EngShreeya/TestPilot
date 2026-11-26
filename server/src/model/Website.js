import mongoose from "mongoose";

export const WEBSITE_ENVIRONMENTS = ["production", "staging", "development"];
export const WEBSITE_STATUSES = ["active", "paused"];

const websiteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner user is required"],
            index: true,
        },
        name: {
            type: String,
            required: [true, "Website name is required"],
            trim: true,
            minlength: [2, "Website name must be at least 2 characters"],
            maxlength: [100, "Website name cannot exceed 100 characters"],
        },
        url: {
            type: String,
            required: [true, "Website URL is required"],
            trim: true,
            maxlength: [2048, "Website URL cannot exceed 2048 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
            default: "",
        },
        environment: {
            type: String,
            enum: {
                values: WEBSITE_ENVIRONMENTS,
                message: "Environment must be production, staging, or development",
            },
            default: "production",
        },
        status: {
            type: String,
            enum: {
                values: WEBSITE_STATUSES,
                message: "Status must be active or paused",
            },
            default: "active",
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            transform(_doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

websiteSchema.index({ user: 1, url: 1 }, { unique: true });

websiteSchema.methods.toSafeWebsite = function toSafeWebsite() {
    return {
        id: this._id.toString(),
        userId: this.user.toString(),
        name: this.name,
        url: this.url,
        description: this.description,
        environment: this.environment,
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

const Website = mongoose.model("Website", websiteSchema);

export default Website;

