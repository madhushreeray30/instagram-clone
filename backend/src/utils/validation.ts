import Joi from 'joi';

export const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().max(100).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().max(100).optional(),
    bio: Joi.string().max(150).optional(),
    website: Joi.string().uri().optional(),
    phone: Joi.string().optional(),
    isPrivate: Joi.boolean().optional(),
  }),

  createPost: Joi.object({
    caption: Joi.string().max(2200).optional(),
    location: Joi.string().optional(),
  }),

  updatePost: Joi.object({
    caption: Joi.string().max(2200).optional(),
  }),

  createComment: Joi.object({
    content: Joi.string().max(300).required(),
    parentCommentId: Joi.string().uuid().optional(),
  }),

  updateComment: Joi.object({
    content: Joi.string().max(300).required(),
  }),

  searchQuery: Joi.object({
    q: Joi.string().min(1).required(),
    type: Joi.string().valid('users', 'posts', 'hashtags').optional(),
  }),
};

export function validateRequest(data: any, schema: Joi.ObjectSchema) {
  return schema.validate(data, { abortEarly: false });
}
