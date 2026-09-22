# Use lightweight Debian Bookworm Node.js LTS base
FROM node:20-bookworm-slim

# Install system dependencies: Tesseract OCR (with English training data) and Poppler utilities (pdftoppm)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source
COPY . .

# Ensure storage directories exist for original PDFs and OCR text files
# NOTE: Railway container filesystems are ephemeral across redeploys.
# For long-term production, attach a Railway volume or integrate S3/Supabase storage.
RUN mkdir -p uploads/pdfs uploads/ocr_texts uploads/temp

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Launch server with entry.js (which ensures crypto polyfill is loaded)
CMD ["node", "entry.js"]
