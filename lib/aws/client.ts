export const aws_config = {
  region: process.env.AWS_REGION, // Adjust region if needed
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};
