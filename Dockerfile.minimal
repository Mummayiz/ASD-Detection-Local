FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy minimal requirements and install
COPY minimal_requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy minimal server
COPY minimal_server.py ./

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "minimal_server.py"]
