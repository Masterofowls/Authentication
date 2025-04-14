# Deployment Guide

This guide provides step-by-step instructions for deploying the Supabase Authentication System to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

1. A Supabase account with a project set up
2. The necessary environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `SESSION_SECRET` (a random string for securing sessions)
3. Executed the SQL in `supabase-setup.sql` on your Supabase instance

## Option 1: Deploy to Replit

### Steps:

1. **Fork the Project**
   - Create a new Replit from this template

2. **Set Environment Variables**
   - In your Replit, go to "Secrets" in the Tools panel
   - Add the following secrets:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`
     - `SESSION_SECRET`

3. **Deploy**
   - Click the "Deploy" button in the Replit interface
   - Replit will handle the hosting and provide a URL

### Notes for Replit Deployment:

- The application is already configured to run on Replit
- The server binds to `0.0.0.0` to work with Replit's proxy
- Ensure the workflow "Start application" is properly configured

## Option 2: Deploy to Vercel (Frontend) and Railway (Backend)

### Deploy Frontend to Vercel:

1. **Prepare for Deployment**
   - Create a `.env.production` file with your production environment variables
   - Ensure `vite.config.ts` has the correct build configuration

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set the build command to `npm run build`
   - Set the output directory to `dist`
   - Configure environment variables in the Vercel dashboard
   - Deploy

### Deploy Backend to Railway:

1. **Prepare for Railway**
   - Create a `Procfile` in the root with: `web: npm start`
   - Ensure `package.json` has a start script: `"start": "NODE_ENV=production node dist/server/index.js"`

2. **Deploy to Railway**
   - Connect your GitHub repository to Railway
   - Add environment variables in the Railway dashboard
   - Deploy the service

3. **Connect Frontend and Backend**
   - Update the frontend API URL to point to your Railway backend

## Option 3: Docker Deployment

### Create Docker Configuration:

1. **Create Dockerfile**

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
```

2. **Create Docker Compose File**

```yaml
version: '3'
services:
  auth-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - SUPABASE_URL=your_supabase_url
      - SUPABASE_ANON_KEY=your_supabase_anon_key
      - SUPABASE_SERVICE_KEY=your_supabase_service_key
      - SESSION_SECRET=your_session_secret
    restart: always
```

3. **Build and Run**

```bash
docker-compose up -d
```

## Environment-Specific Configurations

### Production Checklist:

1. **Security**
   - Set proper CORS origins for production
   - Use HTTPS for all connections
   - Set secure cookie options
   - Set appropriate session timeouts

2. **Performance**
   - Enable compression middleware
   - Consider using a CDN for static assets
   - Implement rate limiting for authentication endpoints

3. **Monitoring**
   - Set up logging with a service like Logtail or Papertrail
   - Configure error tracking with Sentry or similar
   - Set up performance monitoring

## Hosting-Specific Notes

### AWS:

1. **Elastic Beanstalk**
   - Create a `Procfile` with: `web: npm start`
   - Set environment variables in the EB environment
   - Use enhanced health reporting

2. **ECS/Fargate**
   - Use the Docker configuration
   - Set up a load balancer with HTTPS
   - Configure auto-scaling

### GCP:

1. **App Engine**
   - Create an `app.yaml` with your configuration
   - Deploy with `gcloud app deploy`

2. **Cloud Run**
   - Use the Docker configuration
   - Deploy with `gcloud run deploy`

### Azure:

1. **App Service**
   - Deploy using the Azure CLI or VS Code extension
   - Configure environment variables in the Azure portal

## Database Migration

When migrating from the template's MemStorage to a real PostgreSQL database:

1. **Update the Storage Interface**
   - Create a new implementation of `IStorage` for PostgreSQL
   - Use connection pooling for better performance
   - Implement all required methods

2. **Session Storage**
   - Switch to `connect-pg-simple` for PostgreSQL session storage
   - Create the sessions table with the SQL provided

3. **Testing**
   - Test all authentication flows in the staging environment
   - Verify session persistence works correctly

## Scaling Considerations

1. **Horizontal Scaling**
   - Ensure session storage is shared across instances (using Redis or a DB)
   - Make the app stateless for easy scaling

2. **Database Scaling**
   - Supabase handles database scaling for you
   - For custom databases, consider read replicas for heavy read loads

3. **Caching**
   - Implement Redis for API response caching
   - Consider caching user profiles and non-sensitive data

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure the correct origins are allowed in both Express and Supabase
   - Check that credentials are included in requests

2. **Authentication Failures**
   - Verify environment variables are correctly set
   - Check for session cookie issues (domain, secure, httpOnly settings)
   - Ensure Supabase is properly configured

3. **Database Connection Issues**
   - Check network access to Supabase
   - Verify IP allowlists if implemented

## Monitoring and Maintenance

1. **Regular Updates**
   - Keep dependencies updated with `npm audit fix`
   - Monitor for security advisories

2. **Backup Strategy**
   - Supabase provides automatic backups
   - For custom databases, implement a backup schedule

3. **Performance Monitoring**
   - Set up monitoring for API response times
   - Track authentication success/failure rates
   - Monitor session activity and concurrency

## Conclusion

This deployment guide helps you deploy the Supabase Authentication System to various platforms. Adjust the configurations based on your specific requirements and the chosen hosting environment.

For additional support, consult the documentation for your hosting platform or the official Supabase documentation.