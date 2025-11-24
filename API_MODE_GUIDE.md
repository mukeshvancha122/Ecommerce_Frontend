# API Mode Configuration Guide

This guide explains how to switch between **Dummy Data (Localhost)** and **Real AWS Data (Production)** modes.

## Overview

The application supports two modes:
1. **DUMMY Mode**: Uses mock data for local development (no backend required)
2. **AWS Mode**: Connects to the real AWS backend at `http://54.145.239.205:8000`

## How to Switch Modes

### Method 1: Environment Variable (Recommended)

Create or edit the `.env` file in the project root:

#### For Dummy Data (Localhost):
```bash
REACT_APP_USE_DUMMY_DATA=true
```

#### For AWS Backend (Production):
```bash
REACT_APP_USE_DUMMY_DATA=false
```

Or simply remove the line to use default behavior.

### Method 2: Automatic Detection

If `REACT_APP_USE_DUMMY_DATA` is not set:
- **Development (localhost)**: Automatically uses dummy data
- **Production**: Automatically uses AWS backend

## Step-by-Step Instructions

### Using Dummy Data (Local Development)

1. **Create/Edit `.env` file** in the project root:
   ```bash
   REACT_APP_USE_DUMMY_DATA=true
   ```

2. **Restart the development server**:
   ```bash
   npm start
   ```

3. **Verify the mode**:
   - Check the browser console for: `🔧 API Mode: DUMMY (Dummy Data)`
   - All API calls will return mock data instantly

### Using AWS Backend (Production)

1. **Create/Edit `.env` file** in the project root:
   ```bash
   REACT_APP_USE_DUMMY_DATA=false
   REACT_APP_API_BASE_URL=http://54.145.239.205:8000
   ```

2. **Or remove the dummy data flag** (defaults to AWS in production):
   ```bash
   # REACT_APP_USE_DUMMY_DATA=true  # Comment out or remove
   REACT_APP_API_BASE_URL=http://54.145.239.205:8000
   ```

3. **Restart the development server**:
   ```bash
   npm start
   ```

4. **Verify the mode**:
   - Check the browser console for: `🔧 API Mode: AWS (AWS Backend)`
   - API calls will go to `http://54.145.239.205:8000`

## Configuration Files

### `src/config/apiConfig.js`
- Controls the API mode logic
- Checks environment variables and hostname
- Exports `USE_DUMMY_DATA` flag

### `src/data/dummyData.js`
- Contains all mock data structures
- Matches the AWS backend API response format
- Includes categories, products, user profile, orders, etc.

### `src/utils/mockApiInterceptor.js`
- Intercepts axios requests when in DUMMY mode
- Returns mock data based on the API endpoint
- Simulates network delays for realistic testing

## Default Behavior

| Environment | Hostname | Default Mode |
|------------|----------|--------------|
| Development | localhost | DUMMY |
| Development | 127.0.0.1 | DUMMY |
| Production | Any | AWS |

## Troubleshooting

### Issue: Still seeing real API calls in localhost
**Solution**: 
1. Check `.env` file has `REACT_APP_USE_DUMMY_DATA=true`
2. Restart the dev server completely
3. Clear browser cache
4. Check console for mode confirmation

### Issue: Dummy data not loading
**Solution**:
1. Verify `src/data/dummyData.js` exists
2. Check browser console for errors
3. Ensure `USE_DUMMY_DATA` is `true` in console logs

### Issue: AWS backend not connecting
**Solution**:
1. Verify `REACT_APP_USE_DUMMY_DATA=false` or unset
2. Check `REACT_APP_API_BASE_URL` is correct
3. Verify backend is running at `http://54.145.239.205:8000`
4. Check CORS settings on backend
5. Check network tab for failed requests

## Testing Both Modes

### Test Dummy Mode:
```bash
# .env
REACT_APP_USE_DUMMY_DATA=true
npm start
# Open http://localhost:3000
# Check console: Should see "DUMMY (Dummy Data)"
```

### Test AWS Mode:
```bash
# .env
REACT_APP_USE_DUMMY_DATA=false
npm start
# Open http://localhost:3000
# Check console: Should see "AWS (AWS Backend)"
# Check Network tab: Requests should go to AWS endpoint
```

## Notes

- The mode is determined at build/start time
- Changes to `.env` require a server restart
- Dummy data includes realistic delays (300-500ms) to simulate network
- All dummy data structures match the AWS backend format
- You can customize dummy data in `src/data/dummyData.js`

