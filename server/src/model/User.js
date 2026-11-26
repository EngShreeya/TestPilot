import mongoose from "mongoose";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [80, "Name cannot exceed 80 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: [254, "Email cannot exceed 254 characters"],
            match: [EMAIL_REGEX, "Please provide a valid email address"],
        },
        passwordHash: {
            type: String,
            required: [true, "Password hash is required"],
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                delete ret.passwordHash;
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            transform(_doc, ret) {
                delete ret.passwordHash;
                delete ret.__v;
                return ret;
            },
        },
    }
);

/**
 * Returns a sanitized user profile safe to expose in API responses.
 */
userSchema.methods.toSafeProfile = function toSafeProfile() {
    return {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

const User = mongoose.model("User", userSchema);

export default User;

