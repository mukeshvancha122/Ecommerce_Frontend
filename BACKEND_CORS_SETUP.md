# Backend CORS Configuration Guide

## For Django Backend on AWS

Since your backend is Python (Django) deployed on AWS, you need to configure CORS to allow requests from your frontend.

### Step 1: Install django-cors-headers

```bash
pip install django-cors-headers
```

### Step 2: Add to INSTALLED_APPS in settings.py

```python
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]
```

### Step 3: Add Middleware

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Should be at the top
    'django.middleware.common.CommonMiddleware',
    ...
]
```

### Step 4: Configure CORS Settings

```python
# Allow all origins in development (NOT for production)
CORS_ALLOW_ALL_ORIGINS = True  # Only for development

# OR for production, specify allowed origins:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://your-frontend-domain.com",  # Production
]

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Allowed headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'accept-language',
]

# Allowed methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Expose headers to frontend
CORS_EXPOSE_HEADERS = [
    'content-type',
    'authorization',
]
```

### Step 5: For AWS Deployment

If using AWS (EC2, ECS, etc.), also ensure:

1. **Security Groups**: Allow inbound traffic on port 8000 from your frontend's IP/domain
2. **Load Balancer**: If using ALB, configure CORS at the load balancer level if needed
3. **API Gateway**: If using API Gateway, configure CORS there as well

### Step 6: Test CORS

After configuration, test with:

```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://54.145.239.205:8000/api/v1/user/get-token/
```

You should see `Access-Control-Allow-Origin` in the response headers.

### Alternative: Using django-cors-headers with specific settings

```python
# More secure production settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-production-domain.com",
]

CORS_ALLOW_CREDENTIALS = True

# For development only
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
```

### Important Notes:

1. **Never use `CORS_ALLOW_ALL_ORIGINS = True` in production**
2. **Always specify exact origins in production**
3. **Restart your Django server after making changes**
4. **Check AWS Security Groups allow traffic on port 8000**

