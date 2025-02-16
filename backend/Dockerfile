# Use official Python image
FROM python:3.10

# Set the working directory inside the container
WORKDIR /app

# Copy backend files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the FastAPI default port
EXPOSE 8000

# Start FastAPI server
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
