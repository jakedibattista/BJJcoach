# BJJ Coach

A web application for BJJ coaching and training management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=8080
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

This project uses Google Cloud Run with instant deployments. Follow these steps to deploy:

1. Install and configure Google Cloud CLI:
```bash
gcloud init
```

2. Create a Cloud Storage bucket:
```bash
gcloud storage buckets create gs://BUCKET_NAME
```

3. Deploy the application:
```bash
# Copy application files to Cloud Storage
gcloud storage cp -r ./* gs://BUCKET_NAME/

# Deploy the service
gcloud run services replace service.yaml

# Make the service public
gcloud run services add-iam-policy-binding bjj-coach --region us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

4. Update the application:
```bash
# Update code in Cloud Storage
gcloud storage cp -r ./* gs://BUCKET_NAME/

# Force service to pick up new code
gcloud run services update bjj-coach --region us-central1 --update-env-vars DATE=$(date +%Y-%m-%d_%H:%M:%S)
```

## Development

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reload
- `npm test`: Run tests
- `npm run lint`: Run ESLint

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