# BJJ Coach

A Node.js application for BJJ coaching, deployed to Google Cloud Run.

_Last updated: March 19, 2024 15:25 PST_

## Deployment

This application is deployed to Google Cloud Run using GitHub Actions. The deployment process is automated and will trigger on pushes to the main branch.

### Manual Deployment Steps (if needed)

1. Create a Google Cloud project and enable necessary APIs:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable storage.googleapis.com
   ```

2. Create a Cloud Storage bucket:
   ```bash
   gcloud storage buckets create gs://bjjcoach-files --location=us-central1
   ```

3. Copy files to Cloud Storage:
   ```bash
   gcloud storage cp . gs://bjjcoach-files/ --recursive
   ```

4. Deploy to Cloud Run:
   ```bash
   gcloud run services replace service.yaml
   ```

5. Make the service public:
   ```bash
   gcloud run services add-iam-policy-binding bjjcoach \
     --member="allUsers" \
     --role="roles/run.invoker" \
     --region=us-central1
   ```

## Environment Variables

The following environment variables are required:
- `PORT`: The port the server listens on (default: 8080)
- `BUCKET_NAME`: The name of the Cloud Storage bucket (default: bjjcoach-files)

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start the production server:
   ```bash
   npm start
   ```

## License

MIT

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── utils/         # Utility functions
  ├── styles/        # CSS and styling files
  └── index.js       # Application entry point
public/              # Static files
``` 