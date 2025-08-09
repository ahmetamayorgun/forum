#!/bin/bash

# Deployment script for React Notification App
echo "🚀 Starting deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please update .env file with your Supabase credentials"
    else
        echo "❌ .env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Build and start containers
echo "🔨 Building Docker image..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 10

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is running at: http://localhost"
    echo "🔍 Health check: http://localhost/health"
    echo ""
    echo "📋 Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop app: docker-compose down"
    echo "  - Restart app: docker-compose restart"
    echo "  - Update app: ./deploy.sh"
else
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi
