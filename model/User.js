import { compare, hash } from 'bcrypt';
import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
    },
    profileImg: {
      type: String,
      default: '/uploads/default.jpg',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bio: String,
    password: {
      type: String,
      min: [8, 'Password should be at least 8 charcters'],
      required: true,
    },
    phone: String,
    address: String,
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    refreshToken: String,
    passwordResetToken: String,
    passwordResetTokenExpiry: Date,
    passwordResetCode: String,
    passwordResetCodeVerified: Boolean,
    passwordResetCodeExpiry: Date,
  },
  { timestamps: true, versionKey: false }
);
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await compare(candidatePassword, this.password);
};

export const User = model('User', UserSchema);
