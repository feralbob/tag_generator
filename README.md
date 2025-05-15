# Fire Department Tag Generator

A web application for generating CR80-sized identification tags for fire department members. The application allows users to create multiple tags with customizable text and background colors, preview them in real-time, and download them as a PDF.

## Features

- Create multiple tags with different information
- Customize text and background colors
- Real-time PDF preview
- Download generated PDF
- CR80-sized tag format
- Responsive design
- Client-side PDF generation (no server required)

## Setup

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

## Deployment to S3

1. Build the project:
```bash
npm run build
```

2. Upload the contents of the `dist` directory to your S3 bucket.

3. Configure the S3 bucket for static website hosting:
   - Enable static website hosting
   - Set the index document to `index.html`
   - Set the error document to `index.html` (for client-side routing)

4. Configure bucket policy to allow public read access:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## Usage

1. Enter the fire department name, member number, member name, and role for each tag
2. Customize the text and background colors using the color pickers
3. Add more tags using the "Add Another Tag" button
4. Preview the generated PDF in real-time
5. Click the "Download PDF" button to save the PDF to your computer

The downloaded PDF will be named using the format: `Fire_Department_Name_YYYY-MM-DD.pdf` 